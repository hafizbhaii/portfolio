# Muhammad Taha — portfolio with local admin panel

This is the complete source project, with images and a ready-built copy of the website. It includes the footer lock, password-protected editor, editable text and images, case-study galleries, WhatsApp contact form, LinkedIn, theme toggle, and smooth loading screen.

## Start on your computer

1. Install **Node.js 24 LTS** and **pnpm 11**. If you have Node.js but not pnpm, run `npm install -g pnpm@11.25.0`.
2. Extract this ZIP, open the `Muhammad-Taha-Portfolio` folder in your terminal, then run:

```sh
pnpm install --frozen-lockfile
pnpm run setup:local
pnpm start
```

During setup, choose your admin password. You can enter the same password you previously chose for the hosted website. Password entry is hidden. Setup initializes your local database without erasing existing edits.

Open **http://localhost:8787** in your browser. Keep the terminal running while using the website.

Click the small lock in the footer, enter your local password, edit the content, and click **Publish changes**. Updates appear on this local website when visitors refresh it.

No Cloudflare login or paid cloud database is needed for local operation. Wrangler runs the server, database, and image storage on your computer. Internet access is needed for the initial dependency installation; Google Fonts also uses the internet, with system-font fallbacks.

## What is included

- `app/`: website routes and React admin panel.
- `lib/server.ts`: password checks, sessions, publishing, and image uploads.
- `lib/content.ts`: validation and safe HTML rendering.
- `lib/editor-schema.json`: initial editable content and image descriptions.
- `lib/portfolio-template.json`: your website design, animations, and client scripts.
- `public/images/`: included portfolio mockups and logo.
- `drizzle/`: database migrations.
- `dist/`: ready-built application, matching this source.
- `wrangler.local.json`: local server configuration.
- `scripts/setup-local.mjs`: password setup and database initialization.

## Your edits and uploads

Local content, uploaded images and sessions are stored under **`.wrangler/state/`**. Your password verifier is in **`.dev.vars`**. Back up these together with the project. Stop the server before copying the data folder.

The packaged content is the website's source content at the time the admin panel was built. This package does not synchronize with the hosted website or copy any later edits made in its live database. “Publish changes” here updates your local installation only.

Do not delete `.wrangler/state/` unless you intend to erase local content and uploads. Database migrations are tracked and can be safely run again.

## Rebuild after editing the code

Stop the server, then run:

```sh
pnpm build
pnpm run setup:local
pnpm start
```

You do not need to rebuild for changes made through the admin panel.

To change your local admin password, stop the server and run:

```sh
pnpm run setup:local -- --reset-password
pnpm start
```

This also signs out existing local editor sessions.

## Local hosting and internet hosting

This is a server application. Opening an HTML file directly, VS Code Live Server, or XAMPP's static-file serving will not run its admin features.

The included start command binds to your computer's loopback interface. It is intended for access on that computer. Local edits do not update the public internet. Internet hosting needs a compatible Cloudflare Workers deployment with D1, R2, HTTPS, and a separately configured password secret. The existing hosted Site identity and production credentials are deliberately not included in this independent project.

The editor uses HTTP-only, SameSite cookies. Local HTTP uses a loopback-only cookie name; HTTPS deployments retain the Secure cookie protection.

## Checks

The original server passed authentication, unauthorized-write rejection, publication, upload/read, invalid-image, logout, and rate-limit checks. The local export also includes these test sources in `tests/`. Browser rendering could not be visually checked in this session.
