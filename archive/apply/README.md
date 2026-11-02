# Archived application flow (restore next recruiting term)

Removed from the live site in September 2026 after applications closed.

Files here:
- `apply.$slug.tsx` — department one-pager + application page (restore to `src/routes/apply.$slug.tsx`)
- `ApplicationForm.tsx` — the form (restore to `src/components/ApplicationForm.tsx`)
- `ApplyCountdown.tsx` — deadline countdown bar + hero block (restore to `src/components/ApplyCountdown.tsx`)
- `applications.functions.ts` — server-side submission handler (restore to `src/lib/applications.functions.ts`)

To reopen applications:
1. Move the four files back to the paths above.
2. Re-add the countdown bar to `src/components/layout/SiteLayout.tsx` and the hero countdown to `src/routes/index.tsx`.
3. Re-add the "Apply" buttons in `src/components/layout/Nav.tsx`.
4. Turn the department cards in `src/routes/departments.tsx` and `src/routes/index.tsx` back into `<Link to="/apply/$slug">`.
5. Update the deadline date in `ApplyCountdown.tsx`.

The database table, storage bucket and the /admin dashboard are untouched — past applications and CVs remain accessible.
