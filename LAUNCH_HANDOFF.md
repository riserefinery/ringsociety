# Ring Society — CMS and Launch Handoff

## Current delivery state

The public website preserves the imported Figma Make design system and route structure. The original guide and resource content remain in place as a rendering fallback while the Sanity CMS drafts are completed editorially and published.

The dedicated **Ring Society CMS** Studio has been deployed at [ring-society.sanity.studio](https://ring-society.sanity.studio/). It belongs to the Ring Society Sanity project (`p1o8iwkt`) and is separate from the existing Reflect Advisors Studio.

| Area | Status | Notes |
|---|---:|---|
| Sanity project and `production` dataset | Ready | The project contains only Ring Society’s Sanity system records; no Reflect Advisors content is present. |
| Ring Society CMS Studio | Ready | Hosted Studio application at `ring-society.sanity.studio`; title is **Ring Society CMS**. The released Studio includes the Presentation preview tool pointing to the Shopfine Vercel review site. |
| Organization byline | Ready | Use the `Publication settings` singleton. Published content defaults to Ring Society, not individual authors. |
| Guide/resource CMS adapter | Ready | Fifteen editable guide/article drafts, four legal-page drafts, and their imagery are available in Studio. Local source content remains the visual fallback until editorial publication. |
| Top Guides controls | Ready | Editors select, add, remove, and drag-order post references from the Top Guides page; the copy and Big Feature background remain centralized on each selected post. |
| Global hello bar | Ready | The green bar above the navigation is editable from Site Settings. |
| Contact page and footer CTA UI | Ready | The footer CTA collects First Name, Last Name, and Email. The Contact page additionally collects a topic and optional message. Live GoHighLevel delivery remains intentionally disabled until the final integration phase. |
| Legal-page destinations | Published | Privacy Policy, Terms & Conditions, Accessibility Statement, and Your Privacy Choices routes are live and linked from the footer and mobile menu. |
| Canonical domain, CORS, and review preview | Ready for review | `https://ringsociety.com` is canonical; root, `www`, and `https://ringsociety-web.vercel.app` are approved for Sanity client access. The Studio Presentation tool opens the Vercel review site. |

## Editorial workflow

Use the CMS Studio for **Site Settings**, **Categories**, **Posts**, **Pages**, **Legal pages**, and the **Publication settings** singleton. The post structure includes a title, slug, excerpt, hero image with alt text, category, Portable Text body, related posts, featured flag, publication date, and search/social metadata.

> Do not use the existing short definitive guide as source copy for launch. It is only a template and design reference. Create and publish each guide after its complete, approved editorial copy and assets are available.

For each new guide, create it as a draft, add its hero image and alt text, save its body in Portable Text, then open **Presentation** in Studio to view the current Vercel review site. Publish only after editorial approval. The `All Resources`, `Top Guides`, `Our Mission`, and `Contact` singletons also expose **Hero Image and Alignment**. Use **Center Center** for an even vertical crop while the viewport changes.

### Managing the Top Guides rows

Open **Pages → Top Guides** and use **Top Guides Order** to add a post or guide, remove an entry, or drag entries into the desired display sequence. A selected row always uses the referenced post’s **Title**, **Excerpt**, **Content Type**, **Top Guides Badge**, **Top Guides Overlay Text**, and **Big Feature Image**. This keeps every guide’s copy and media centralized in one post document rather than duplicating it on the landing page.

To change a row’s wide desktop background, open **Blog & Guides → All Posts & Guides → [the post] → Media → Big Feature Image**. Add alt text and adjust the focal alignment as needed. If this field is blank, the Top Guides row falls back to the post’s standard **Hero Image**. The post’s standard Hero Image continues to supply compact/mobile imagery; the Big Feature Image is the wide Top Guides art direction.

The migrated Top Guides draft begins with the current eight rows and their current order. To make an editor’s changes public, publish the selected posts and then publish the Top Guides page. Draft records remain visible to editors but are intentionally not returned by the public site until publication.

There is **no separate Vercel push for published Sanity content**. The public site loads published CMS data directly. While the full catalog is still being completed, publishing one selected post and then publishing the Top Guides page updates that post’s row while the other selected rows retain their local fallback content. This lets editors review a single Big Feature image change without waiting for every guide to be published.

### Editing the top hello bar

Open **Site Settings → Hello Bar Text**, edit the short message shown in the green bar above the navigation, then publish Site Settings. The existing message remains as the public-site fallback until that singleton is published.

## Vercel public-site setup

The Shopfine Vercel project **`ringsociety-web`** is already connected to the repository root. Do not deploy the `studio/` directory to Vercel; the managed Sanity Studio is already live. The included `vercel.json` supplies Vite output settings and client-side route fallbacks for the public application.

| Vercel setting | Value |
|---|---|
| Root Directory | Repository root |
| Build Command | `pnpm build` |
| Output Directory | `dist` |
| Current review URL | `https://ringsociety-web.vercel.app` |
| Production domain | `ringsociety.com` (not assigned yet) |
| Redirect host | `www.ringsociety.com` → `ringsociety.com` |
| Required public variables | `VITE_SANITY_PROJECT_ID=p1o8iwkt`, `VITE_SANITY_DATASET=production` |
| Deferred server secret | `GHL_INBOUND_WEBHOOK_URL` |

The stable Vercel review origin is already configured in Sanity CORS with credentials disabled. Do not use a broad wildcard unless the deployment workflow requires it.

## Browser-independent Studio release

When the Studio schema changes, create a short-lived Sanity token with the minimum deployment permission in **Sanity Manage → Ring Society → API → Tokens**. Keep the token private, export it as `SANITY_AUTH_TOKEN`, then run the following from the repository’s `studio/` directory:

```bash
pnpm install --frozen-lockfile
SANITY_AUTH_TOKEN="$SANITY_AUTH_TOKEN" pnpm exec sanity schemas deploy
SANITY_AUTH_TOKEN="$SANITY_AUTH_TOKEN" pnpm exec sanity deploy --yes --no-build
```

Use a short-lived project deploy token with the **Deploy Studio** and **Deploy Schema** grants (or equivalent Developer role). Confirm the release with `pnpm exec sanity schemas list`. For editor-facing preview changes, build and deploy the Studio after confirming that `SANITY_STUDIO_PREVIEW_URL` is set as needed; the current default is `https://ringsociety-web.vercel.app`.

## Updating a guide image sitewide

Open **Blog & Guides → All Posts & Guides** in Ring Society Studio and select the guide. In **Hero Image and Alignment**, replace **Main Image**, complete the required alt text, choose the desired **Focal Alignment**, then publish when the guide content is ready. The same hero image feeds the guide card, listing surfaces, and guide detail template, so one update controls that guide sitewide.

The current CMS migration created the existing catalog as **drafts**. Drafts are visible and editable in Studio but do not replace the local fallback content on the public site until published. The supplied **How to Choose A Jeweler: Our 10-Point Framework** image has also been applied to the local fallback immediately, so the current review site already uses it while its editable guide draft remains available in Studio.

## Remaining launch inputs

| Input | Required for | Owner/action |
|---|---|---|
| Complete, approved guide articles and images | CMS publishing and launch | Ring Society editorial team |
| GoHighLevel inbound-workflow URL | Final lead-capture activation | Configure later; store only as `GHL_INBOUND_WEBHOOK_URL` in Vercel/secure environment settings |
| Production domain cutover | Public launch | Assign `ringsociety.com` to `ringsociety-web`, redirect `www`, and leave `app.ringsociety.com` assigned to the existing quiz project. |

## GoHighLevel final step

The public source is ready for the selected inbound-workflow approach, but no live CRM endpoint has been configured. At final activation, create one GoHighLevel workflow with the **Inbound Webhook** trigger, store its private workflow URL as `GHL_INBOUND_WEBHOOK_URL`, and test both forms. The footer CTA sends `firstName`, `lastName`, `email`, and `source`; the Contact page additionally sends `topic` and an optional `message`. The server never exposes the workflow URL to browsers.

## Validation performed

The public Vite build completes successfully. The lead payload validator covers normalisation, missing/invalid fields, honeypot blocking, and the Contact-only topic/message values. The Sanity Studio schema is released to the Ring Society `production` dataset, the dedicated Studio application is live, and Presentation points to the Vercel review URL.
