import { useState } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { submitApplication } from "@/lib/applications.functions";
import type { Department } from "@/lib/departments";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";

const schema = z.object({
  full_name: z.string().trim().min(2, "Full name is required").max(120),
  email: z.string().trim().email("Valid email required").max(255),
  program: z.string().trim().min(2, "Program is required").max(120),
  graduation_year: z.string().trim().regex(/^\d{4}$/, "Year (YYYY)"),
  nationality: z.string().trim().max(80).optional().or(z.literal("")),
  linkedin_url: z.string().trim().url("Must be a URL").max(255).refine(
    (v) => /^https?:\/\//i.test(v),
    "Must be an http(s) URL",
  ),
  experience: z.string().trim().min(2, "Required").max(500),
  desk_preference: z.string().trim().min(1, "Select an option").max(120),
  position_type: z.string().trim().max(40).optional().or(z.literal("")),
  motivation: z.string().trim().max(2000).optional().or(z.literal("")),
  relevant_experience: z.string().trim().max(2000).optional().or(z.literal("")),
  consent: z.literal(true, { errorMap: () => ({ message: "Required" }) }),
});

const MAX_BYTES = 10 * 1024 * 1024;

export function ApplicationForm({ d }: { d: Department }) {
  const submit = useServerFn(submitApplication);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);

  if (done) {
    return (
      <div className="rounded-sm border border-border bg-card p-12 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-steel" />
        <h3 className="mt-5 font-serif text-2xl text-navy">Application received</h3>
        <p className="mt-3 text-muted-foreground">
          The {d.name} team will be in touch via the email you provided.
        </p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries());
    const parsed = schema.safeParse({ ...raw, consent: raw.consent === "on" });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[issue.path[0] as string] = issue.message;
      setErrors(errs);
      toast.error("Please fix the highlighted fields");
      return;
    }
    if (!file) { setErrors((x) => ({ ...x, cv: "CV (PDF) is required" })); return; }
    if (file.type !== "application/pdf") { setErrors((x) => ({ ...x, cv: "PDF only" })); return; }
    if (file.size > MAX_BYTES) { setErrors((x) => ({ ...x, cv: "Max 10 MB" })); return; }

    setSubmitting(true);
    try {
      const buf = await file.arrayBuffer();
      // Base64 encode without blowing the call stack on large files.
      let binary = "";
      const bytes = new Uint8Array(buf);
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
      }
      const cv_base64 = btoa(binary);

      await submit({
        data: {
          department: d.slug,
          full_name: parsed.data.full_name,
          email: parsed.data.email,
          program: parsed.data.program,
          graduation_year: parsed.data.graduation_year,
          nationality: parsed.data.nationality || null,
          linkedin_url: parsed.data.linkedin_url,
          experience: parsed.data.experience,
          desk_preference: parsed.data.desk_preference,
          position_type: parsed.data.position_type || null,
          motivation: parsed.data.motivation || null,
          relevant_experience: parsed.data.relevant_experience || null,
          consent: true,
          cv_filename: file.name,
          cv_base64,
        },
      });
      setDone(true);
    } catch (err) {
      console.error(err);
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const deskOptions = d.verticals.length > 0 ? d.verticals : null;
  const showPosition = d.support === true;

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-sm border border-border bg-card p-7 md:p-9">
      {showPosition && (
        <div>
          <Label>Position you're applying for <span className="text-destructive">*</span></Label>
          <select
            name="position_type"
            required
            defaultValue=""
            className="mt-1.5 h-11 w-full rounded-sm border border-input bg-background px-3 text-sm"
          >
            <option value="" disabled>Select a position…</option>
            <option value={`Head of ${d.name}`}>{`Head of ${d.name}`}</option>
            <option value="Associate">Associate</option>
          </select>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Full name" name="full_name" error={errors.full_name} required />
        <Field label="Email" name="email" type="email" placeholder="you@esade.edu" error={errors.email} required />
        <Field label="Master's program" name="program" placeholder="MSc Finance" error={errors.program} required />
        <Field label="Expected graduation year" name="graduation_year" placeholder="2027" error={errors.graduation_year} required />
        <Field label="Nationality (optional)" name="nationality" error={errors.nationality} />
        <Field label="LinkedIn URL" name="linkedin_url" type="url" placeholder="https://linkedin.com/in/..." error={errors.linkedin_url} required />
      </div>

      <Field
        label="Prior work experience (years & type)"
        name="experience"
        placeholder="e.g. 2 yrs M&A advisory at boutique IB, Frankfurt"
        error={errors.experience}
        required
      />

      <div>
        <Label>{d.deskLabel} <span className="text-destructive">*</span></Label>
        {deskOptions ? (
          <select
            name="desk_preference"
            className="mt-1.5 h-11 w-full rounded-sm border border-input bg-background px-3 text-sm"
            defaultValue=""
            required
          >
            <option value="" disabled>Select an option…</option>
            {deskOptions.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        ) : (
          <input
            name="desk_preference"
            placeholder="e.g. Partnerships with London hedge funds"
            className="mt-1.5 h-11 w-full rounded-sm border border-input bg-background px-3 text-sm"
            required
          />
        )}
        {errors.desk_preference && <p className="mt-1 text-xs text-destructive">{errors.desk_preference}</p>}
      </div>

      <TextArea
        label="Why this department? (optional)"
        name="motivation"
        rows={5}
        placeholder="Tell us what draws you to this desk and what you want to get out of EMFC."
        error={errors.motivation}
      />
      <TextArea
        label="Relevant experience or a deal/company you'd pitch (optional)"
        name="relevant_experience"
        rows={4}
        placeholder="A recent transaction, a stock idea, a credit you'd buy or short. Whatever shows how you think."
        error={errors.relevant_experience}
      />

      <div>
        <Label>CV (PDF, max 10 MB) <span className="text-destructive">*</span></Label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-1.5 block w-full rounded-sm border border-dashed border-input bg-background p-3 text-sm file:mr-3 file:rounded-sm file:border-0 file:bg-navy file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
        />
        {errors.cv && <p className="mt-1 text-xs text-destructive">{errors.cv}</p>}
      </div>

      <label className="flex items-start gap-3 text-sm text-muted-foreground">
        <input type="checkbox" name="consent" className="mt-1 h-4 w-4 rounded border-input" required />
        <span>I consent to being contacted by EMFC about this application and EMFC recruiting events.</span>
      </label>
      {errors.consent && <p className="-mt-3 text-xs text-destructive">{errors.consent}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gold px-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-foreground transition hover:brightness-95 disabled:opacity-60"
      >
        {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : "Submit application"}
      </button>
    </form>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-navy">{children}</label>;
}

function Field({
  label, name, type = "text", placeholder, error, required,
}: { label: string; name: string; type?: string; placeholder?: string; error?: string; required?: boolean }) {
  return (
    <div>
      <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="mt-1.5 h-11 w-full rounded-sm border border-input bg-background px-3 text-sm"
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function TextArea({
  label, name, rows, placeholder, error, required,
}: { label: string; name: string; rows: number; placeholder?: string; error?: string; required?: boolean }) {
  return (
    <div>
      <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
      <textarea
        name={name}
        rows={rows}
        placeholder={placeholder}
        required={required}
        className="mt-1.5 w-full rounded-sm border border-input bg-background p-3 text-sm"
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
