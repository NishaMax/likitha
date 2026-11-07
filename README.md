# Likitha

Likitha is a mobile-first Sinhala story and novel publishing platform for Sri Lanka.

## Local development

Requirements:

- Node.js 22+
- npm

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Local configuration is read from `.env`. Use `.env.example` as the template. `NEXT_PUBLIC_SITE_URL` controls canonical URLs, Open Graph URLs, robots, and the sitemap.

### Supabase setup

The authentication schema is defined in `prisma/schema.prisma`.

1. Copy the Prisma **Transaction pooler** connection string into `DATABASE_URL` (port `6543`).
2. Copy the Prisma **Session pooler** connection string into `DIRECT_URL` (port `5432`).
3. Confirm the username, password, host, port, and database name are copied exactly.
3. Run:

```bash
npm run db:generate
npm run db:push
```

The database password must be the current Supabase database password, not a Google OAuth secret or the Supabase project API key. If the password contains special characters, use the URL-encoded value in the connection string.

Google OAuth uses `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`. The redirect URL for local development is:

```text
http://localhost:3000/api/auth/callback/google
```

## Validation

```bash
npm run lint
npm run build
```

## Vercel deployment

1. Import this repository into Vercel and keep the build command as `npm run build`.
2. Add the production environment variables from `.env.example` for Production:
   - `DATABASE_URL` using the Supabase transaction pooler.
   - `DIRECT_URL` using the Supabase session pooler.
   - A new production `AUTH_SECRET`.
   - `NEXTAUTH_URL=https://likitha.lk`.
   - `NEXT_PUBLIC_SITE_URL=https://likitha.lk`.
   - `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.
   - `ADMIN_EMAIL` and a long random `ADMIN_PASSWORD`.
3. Add the Vercel deployment URL and `https://likitha.lk` to the Google OAuth authorized origins and callback URLs:
   `https://likitha.lk/api/auth/callback/google`.
4. Add `likitha.lk` to Vercel, then configure the DNS records Vercel provides. Verify HTTPS before changing the canonical URL.
5. Submit `https://likitha.lk/sitemap.xml` in Google Search Console after DNS and HTTPS are working.

Admin authentication is required for `/admin/reviews` and all `/api/admin/*` handlers. Keep `ADMIN_EMAIL` and `ADMIN_PASSWORD` configured in Vercel Production, and never commit them to the repository.

## Product plan

See [plan.md](./plan.md) for the full product, architecture, mobile-responsive design, implementation, and launch plan.
