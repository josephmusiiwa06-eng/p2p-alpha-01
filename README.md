# p2p-alpha-01

Play2Perform Alpha — a small Next.js + Supabase app for early childhood motor development assessment.

## Repository structure

- `.eslintrc.json`
- `.gitignore`
- `next.config.js`
- `package.json`
- `tsconfig.json`
- `supabase/schema.sql`  ← run this in Supabase SQL Editor
- `src/types/index.ts`
- `src/lib/supabase.ts`
- `src/lib/scoring.ts`
- `src/lib/data.ts`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/login/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/assess/page.tsx`
- `src/app/assess/[childId]/page.tsx`
- `src/app/children/page.tsx`
- `src/app/children/new/page.tsx`
- `src/app/children/[id]/page.tsx`
- `src/app/report/[token]/page.tsx`

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure Supabase keys in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Run Supabase schema in the SQL Editor using `supabase/schema.sql`.
4. Start the dev server:
   ```bash
   npm run dev
   ```

## Notes

- `supabase/schema.sql` is a copy of the initial migration file for manual import.
- The app includes coach login, dashboards, child registration, assessments, and shareable reports.
