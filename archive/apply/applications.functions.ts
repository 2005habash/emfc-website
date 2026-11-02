import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Server-side validated submission for a department application.
// The file is uploaded through the service role (not directly from the browser)
// so anonymous clients cannot flood the "cvs" bucket with arbitrary files.
const submissionSchema = z.object({
  department: z.string().trim().min(1).max(80).regex(/^[a-z][a-z-]*$/),
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  program: z.string().trim().min(2).max(120),
  graduation_year: z.string().trim().regex(/^\d{4}$/),
  nationality: z.string().trim().max(80).optional().nullable(),
  linkedin_url: z.string().trim().url().max(255).refine(
    (v) => /^https?:\/\//i.test(v),
    "Must be an http(s) URL",
  ),
  experience: z.string().trim().min(2).max(500),
  desk_preference: z.string().trim().min(1).max(120),
  position_type: z.string().trim().max(40).optional().nullable(),
  motivation: z.string().trim().max(2000).optional().nullable(),
  relevant_experience: z.string().trim().max(2000).optional().nullable(),
  consent: z.literal(true),
  cv_filename: z.string().trim().min(1).max(255),
  // Base64-encoded PDF bytes. 10 MB raw ≈ ~13.4 MB base64.
  cv_base64: z.string().min(1).max(15 * 1024 * 1024),
});

const MAX_BYTES = 10 * 1024 * 1024;

export const submitApplication = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submissionSchema.parse(data))
  .handler(async ({ data }) => {
    // Decode and re-validate the file server-side.
    const bytes = Buffer.from(data.cv_base64, "base64");
    if (bytes.length === 0 || bytes.length > MAX_BYTES) {
      throw new Response("Invalid file size", { status: 400 });
    }
    // PDF magic number "%PDF-"
    if (
      bytes[0] !== 0x25 ||
      bytes[1] !== 0x50 ||
      bytes[2] !== 0x44 ||
      bytes[3] !== 0x46 ||
      bytes[4] !== 0x2d
    ) {
      throw new Response("File must be a PDF", { status: 400 });
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Server generates the UUID; client cannot forge paths.
    const uuid = crypto.randomUUID();
    const safeName =
      data.cv_filename.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.pdf$/i, "") + ".pdf";
    const path = `${data.department}/${uuid}/${safeName}`;

    const { error: upErr } = await supabaseAdmin.storage
      .from("cvs")
      .upload(path, bytes, { contentType: "application/pdf", upsert: false });
    if (upErr) {
      console.error("cv upload failed", upErr);
      throw new Response("Upload failed", { status: 500 });
    }

    const { error: insErr } = await supabaseAdmin.from("applications").insert({
      department: data.department,
      full_name: data.full_name,
      email: data.email,
      program: data.program,
      graduation_year: data.graduation_year,
      nationality: data.nationality || null,
      linkedin_url: data.linkedin_url,
      experience: data.experience,
      desk_preference: data.desk_preference,
      position_type: data.position_type || null,
      motivation: data.motivation || null,
      relevant_experience: data.relevant_experience || null,
      cv_path: path,
      consent: true,
    } as never);

    if (insErr) {
      // Roll back the uploaded file so orphaned CVs don't accumulate.
      await supabaseAdmin.storage.from("cvs").remove([path]);
      console.error("application insert failed", insErr);
      throw new Response("Submission failed", { status: 500 });
    }

    return { ok: true as const };
  });
