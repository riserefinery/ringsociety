# Ring Society Article Indexing Rollout

## Current production and proposed expansion

The existing production release indexes only `https://ringsociety.com/guides/how-to-buy-an-engagement-ring`. The local seven-guide code is **not itself a publication or metadata approval**. The user has authorized indexing the following six existing guides, subject to approving each proposed metadata title and description before any publication:

- `/guides/engagement-ring-settings-and-styles`
- `/guides/how-to-choose-a-jeweler`
- `/guides/engagement-rings-with-hidden-halos`
- `/guides/natural-vs-lab-grown-diamonds`
- `/guides/which-diamond-shape-looks-biggest`
- `/guides/ultimate-guide-to-diamond-clarity`

The six published CMS records currently retain `seo.noIndex: true`. The local guarded production build is therefore expected to fail until the approved metadata is published and **each** of those records is explicitly changed to `seo.noIndex: false` as part of an authorized release. Do not deploy the pending code before those prerequisites are met. Never use a mock or override in a release build to bypass these guards.

## Design and protections

The build reads each matching **published** Sanity post from project `p1o8iwkt`, production dataset, and renders its actual mapped body in the existing React article template. Each canonical route gets its own content-bearing HTML, title, description, canonical, social tags, Article and Organization structured data, and public hydration snapshot. The first browser render is seeded only when the snapshot's slug, canonical path, host, and required data match the actual route. The snapshot and HTML intentionally remain on the same build-time content revision; SPA navigation retains the CMS cache and hostname/noindex checks.

The build fails closed for an unavailable or non-unique published post, wrong slug, a `noIndex` value other than explicit `false`, an invalid/mismatched supplied canonical path, missing title/excerpt/hero, empty or non-substantive body, missing metadata, or mismatched rendered metadata/schema. A missing CMS canonical override defaults to that guide's exact `/guides/<slug>` path. A failed regeneration removes the entire generated article directory rather than leaving stale or partial artifacts.

Only `ringsociety.com` receives indexable responses for the seven exact clean guide paths. Slash, `index`, and `index.html` aliases redirect to their clean canonical URLs with a noindex header. Other guides, home, legal and SMS pages, preview/noncanonical hosts, direct `/approved-articles/` artifacts and the metadata-only API retain their protections; existing lead forms and the API are unchanged. The common HTML shell and default robots.txt stay blocked. On the canonical host only, robots.txt permits each exact approved guide and `/assets/`, with `Disallow: /` for everything else. Do not submit an XML sitemap at this stage.

## Editorial update and deployment sequence

1. Propose the six titles and descriptions to the user and obtain explicit approval **before** publishing any metadata or indexing changes. Preserve each existing slug, hero, article body and unrelated fields.
2. After approval and separate authorization to publish, use reviewed Sanity drafts; publish the approved metadata and set `seo.noIndex: false` for each of the six. Keep the already approved buying guide intact. Confirm each published record's exact canonical path and substantive body.
3. Run the guarded build and checks, then deploy only with appropriate release authorization. **Sanity publication alone does not refresh static search copy.** Each browser snapshot and raw HTML stay on the deployed build's content revision.
4. Check initial raw HTML for each of the seven: correct body, exact route-specific title/description/canonical/social tags and structured data, no noindex, and robots allowance, using visitor, search, and social user agents. Verify snapshot/URL identity, JavaScript initialization and navigation. Verify preview/noncanonical hosts, unapproved guides, home, legal, aliases and API remain protected. No live lead submissions are needed.

To revoke indexing for a deployed static page, restore its CMS noindex flag **and** change deployment-level protections or remove the approved route, then redeploy. A CMS flag alone cannot instantly revoke already deployed static HTML.

## Guardrails

Do not broaden the slug or host allowlist without separate approval. Leave `app.ringsociety.com`, Reflect, domain redirects, the paused desktop hero-height change, legal routes, the legacy SMS launcher and every lead-form integration untouched. Sources and body-level Related Guides remain in their existing closed Article End Matter accordions; article-specific source presentation remains unchanged. Other articles remain noindexed until separately authorized and editorially approved.
