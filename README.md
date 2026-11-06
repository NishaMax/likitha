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

Local configuration is read from `.env`. Use `.env.example` as the template. The homepage and authentication foundation are implemented; publishing features will be added in later phases.

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

## Product plan

See [plan.md](./plan.md) for the full product, architecture, mobile-responsive design, implementation, and launch plan.
