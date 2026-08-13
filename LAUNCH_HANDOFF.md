# Ring Society — CMS and Launch Handoff

## Current delivery state

The public website preserves the imported Figma Make design system and route structure. The original guide and resource content remain in place as a rendering fallback while the Sanity CMS is empty. No unfinished guide has been migrated or published.

The dedicated **Ring Society CMS** Studio has been deployed at [ring-society.sanity.studio](https://ring-society.sanity.studio/). It belongs to the Ring Society Sanity project (`p1o8iwkt`) and is separate from the existing Reflect Advisors Studio.

| Area | Status | Notes |
|---|---:|---|
| Sanity project and `production` dataset | Ready | The project contains only Ring Society’s Sanity system records; no Reflect Advisors content is present. |
| Ring Society CMS Studio | Ready | Hosted Studio application; title is **Ring Society CMS**. |
| Organization byline | Ready | Use the `Publication settings` singleton. Published content defaults to Ring Society, not individual authors. |
| Guide/resource CMS adapter | Ready | Published Sanity posts can populate existing resource and guide templates. Local source content remains the visual fallback until editorial migration. |
| Contact page and footer CTA UI | Ready | Both collect First Name, Last Name, and Email only. Live GoHighLevel delivery remains intentionally disabled until the final integration phase. |
| Legal-page destinations | Scaffolded | They are intentionally no-index and show a placeholder until counsel-approved copy is supplied. |
| Canonical domain and CORS | Partially ready | `https://ringsociety.com` is canonical; both root and `www` production origins are now in Sanity CORS. Add a concrete preview origin after the Vercel project is created. |

## Editorial workflow

Use the CMS Studio for **Categories**, **Posts**, **Pages**, **Legal pages**, and the **Publication settings** singleton. The post structure includes a title, slug, excerpt, hero image with alt text, category, Portable Text body, related posts, featured flag, publication date, and search/social metadata.

> Do not use the existing short definitive guide as source copy for launch. It is only a template and design reference. Create and publish each guide after its complete, approved editorial copy and assets are available.

For each new guide, create it as a draft, add its hero image and alt text, save its body in Portable Text, then preview it through the local/public site after the Vercel preview origin has been approved in Sanity CORS. Publish only after editorial approval.

## Vercel public-site setup

Create **one Vercel project** from this repository’s root. Do not deploy the `studio/` directory to Vercel; the managed Sanity Studio is already live. The included `vercel.json` supplies Vite output settings and client-side route fallbacks for the public application.

| Vercel setting | Value |
|---|---|
| Root Directory | Repository root |
| Build Command | `pnpm build` |
| Output Directory | `dist` |
| Production domain | `ringsociety.com` |
| Redirect host | `www.ringsociety.com` → `ringsociety.com` |
| Required public variables | `VITE_SANITY_PROJECT_ID=p1o8iwkt`, `VITE_SANITY_DATASET=production` |
| Deferred server secret | `GHL_INBOUND_WEBHOOK_URL` |

After Vercel creates its preview deployment URL, add that exact origin to Sanity’s CORS allowlist with credentials disabled. Do not use a broad wildcard unless the deployment workflow requires it.

## Remaining launch inputs

| Input | Required for | Owner/action |
|---|---|---|
| Complete, approved guide articles and images | CMS migration and launch publishing | Ring Society editorial team |
| Counsel-approved Privacy Policy, Terms & Conditions, Accessibility, and Do Not Sell copy | Publishing legal routes | Ring Society legal counsel |
| Approved Open Graph image at `1200 × 630` pixels | Optional future brand refinement | A verified existing Ring Society hero image is already configured as the social preview. Replace it only if the brand team supplies a dedicated social card. |
| Vercel preview URL | Sanity CORS and final preview verification | Vercel project setup |
| GoHighLevel inbound-workflow URL | Final lead-capture activation | Configure at the very end; store only as `GHL_INBOUND_WEBHOOK_URL` in Vercel/secure environment settings |

## GoHighLevel final step

The public source is ready for the selected inbound-workflow approach, but no live CRM endpoint has been configured. At final activation, create one GoHighLevel workflow with the **Inbound Webhook** trigger, store its private workflow URL as `GHL_INBOUND_WEBHOOK_URL`, and test both the footer CTA and Contact page. The server will pass only `firstName`, `lastName`, `email`, and a `source` label; it does not expose the workflow URL to browsers.

## Validation performed

The public Vite build completes successfully. The lead payload validator covers normalisation, missing/invalid fields, and honeypot blocking. The Sanity Studio schema is deployed to the Ring Society `production` dataset, and the dedicated Studio application is live.
