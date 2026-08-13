# Ring Society — Shopfine Vercel Domain Plan

## Approved architecture

Ring Society will use **two separate Vercel projects inside the existing Shopfine account**. This keeps the existing quiz application independent from the editorial website, avoids proxy or routing complexity, and allows each product to deploy on its own release cadence.

| Vercel project | Role | Hostnames | Action |
|---|---|---|---|
| Existing quiz project | Ring Society quizzes and interactive application | `app.ringsociety.com` | **Do not change** its project settings, domain, or DNS record. |
| New `ringsociety-web` project | Editorial site, guides, CMS-powered resources, Contact page | Initial `*.vercel.app` URL; later `ringsociety.com` and `www.ringsociety.com` | Create from `riserefinery/ringsociety`. |

> The `app` subdomain and the apex domain are independent DNS names. Assigning the apex domain to the editorial project will not disturb the existing quiz application, provided `app.ringsociety.com` remains assigned to its current Vercel project.

## Initial Vercel import

In the **Shopfine** Vercel account, import [riserefinery/ringsociety](https://github.com/riserefinery/ringsociety) as a new project named `ringsociety-web`. Configure the project with the following settings.

| Setting | Value |
|---|---|
| Framework preset | Vite |
| Root Directory | `.` |
| Build Command | `pnpm build` |
| Output Directory | `dist` |
| Production Branch | `main` |
| Do not deploy | `studio/` — the CMS is already hosted at [ring-society.sanity.studio](https://ring-society.sanity.studio/) |
| Preview custom domain | None initially |
| Production custom domain | None initially |

The initial Vercel deployment will create a project-specific `*.vercel.app` URL. Treat this as the first shared review URL. It does **not** affect `ringsociety.com` until a custom domain is explicitly added.

## Environment variables

Configure these values for **Preview** and **Production** before importing the project. The public Sanity values are safe to expose to the browser; the future GoHighLevel webhook must be stored only as a server-side secret.

| Variable | Preview | Production | Notes |
|---|---:|---:|---|
| `VITE_SANITY_PROJECT_ID` | `p1o8iwkt` | `p1o8iwkt` | Ring Society Sanity project ID. |
| `VITE_SANITY_DATASET` | `production` | `production` | Existing isolated Ring Society dataset. |
| `GHL_INBOUND_WEBHOOK_URL` | Leave unset | Leave unset | Add only during the final CRM activation. Never expose it as a `VITE_` variable. |

## Domain cutover — only after review approval

When the website is approved on its Vercel URL, open **`ringsociety-web` → Settings → Domains** and add `ringsociety.com`. Then add `www.ringsociety.com` and configure it to redirect to the apex domain. If Vercel asks for a TXT verification record, complete that verification with the domain DNS owner. If it asks for DNS changes, apply **only the apex and `www` instructions for this new project**.

Do not modify the existing `app` DNS record or remove `app.ringsociety.com` from the current quiz project. It remains the dedicated quiz destination.

## Post-import actions

After the first Vercel deployment URL exists, add that exact origin to the Sanity project CORS allowlist with credentials disabled. Then update any cross-site quiz calls to use the stable `https://app.ringsociety.com` destination and preserve the editorial website’s canonical URL as `https://ringsociety.com`.

For ongoing work, create a branch or pull request before changes that need review. Vercel will generate a dedicated preview URL without changing the production deployment or custom domain.
