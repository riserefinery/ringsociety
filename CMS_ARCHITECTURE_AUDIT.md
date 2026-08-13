# Ring Society CMS Architecture Audit and Additive Integration Map

**Audit status:** Read-only review completed on the user-provided Figma Make archive. The original archive is unchanged. The copy used for inspection is isolated at `/home/ubuntu/ring-society-source-audit`.

> **Conclusion:** The existing implementation has a clear, reusable shape and should be extended rather than rebuilt. The recommended approach is a separate Sanity Studio application plus a small Sanity data adapter in the public site, so the current Figma Make routes, shared shell, styling, cards, and article interaction model remain recognizably intact.

## 1. Existing Architecture

| Area | Current implementation | Preservation decision |
|---|---|---|
| Runtime | Vite 8, React 19, Tailwind CSS 4, React Router 8 | Retain. Add only the small Sanity client and Portable Text dependencies required by the public site. |
| Routing | A React Router browser data router in `src/app/routes.tsx` | Retain the router and append exact routes only. Do not replace it with another routing system. |
| Site shell | `src/app/Root.tsx` owns the shared Header, Footer, route outlet, and scroll restoration | Retain unchanged. New tertiary pages inherit this shell automatically. |
| Navigation | `src/lib/nav.ts` supplies navigation labels to the Header, mobile navigation, and Footer | Preserve the central data pattern. Add paths to existing legal records and the Contact entry rather than duplicate menus. |
| Visual system | `src/index.css` defines the Ring Society ink, paper, cream, forest, sage, and Archivo type system | Retain. CMS fields must never expose these tokens as arbitrary editor values. |
| Editorial cards | `GuideCard` is the single image, eyebrow, title, and CTA presentation model | Preserve the component; supply CMS content through its existing shape. A narrow optional destination prop is needed to make newly published CMS posts reachable. |
| Blog listing | `Resources.tsx` filters the static `FILTERS` and `allArticles` lists, preserving selection in the URL | Retain all filter behavior and layout. Replace only the content source through a query-and-mapper layer. |
| Blog article | `Article.tsx` renders an article hero, reading progress, table of contents, sticky sidebar, image lightbox, newsletter, and related cards from `ArticleDoc` and `ArticleBlock` data | Preserve the template and interactions. Map Sanity Portable Text into the current block shape instead of rewriting the page around a generic renderer. |
| Current content | `src/lib/content.ts` centralizes most guide cards and one fully structured source article, while Home also has page-local card collections | Keep the current data as a temporary fallback during the first CMS vertical slice. Do not migrate home-page data until the blog proof is accepted. |

## 2. Page and Content Inventory

| Current or required surface | Current state | CMS scope in the proposed first release |
|---|---|---|
| Homepage | Existing Figma Make composition with page-local editorial card arrays and a hero link to the definitive guide | Keep visually static for the first slice. Only preserve existing guide links when their CMS equivalent is ready. |
| Top Guides | Existing route and reusable guide features/cards | Keep visual structure unchanged. Connect only after the Resource/Article vertical slice works. |
| All Resources | Existing blog listing at `/all-resources`, including URL-based filter chips | **CMS-backed in the first vertical slice.** The listing title and introduction are editable through `blogLanding`; published cards are queried from `post`. |
| Article route | Existing detail template at `/guides/:slug` | **CMS-backed in the first vertical slice.** The provided definitive buying guide is the approved real-content migration candidate. |
| Our Mission | Existing visual template with local content | Preserve as static at this stage. Consider a narrowly typed CMS document only after editorial ownership is confirmed. |
| Contact | Missing route and footer destination | Add as a page-level route. CMS exposes only editor-owned contact information and page SEO; form handling will be selected after contact-flow requirements are confirmed. |
| Privacy, Terms, Accessibility, Do Not Sell | Navigation labels exist but all routes and content are missing | Add exact routes and CMS-managed legal-page documents. Public legal copy must be supplied or approved by the client or its counsel; it will not be invented. |
| Global settings | Existing brand and menu values are code-owned | Add `siteSettings` for default SEO, social/contact details, and future global editorial values. Keep structural navigation and brand tokens in code during launch preparation. |

## 3. Minimal Content Model

| Sanity type | Purpose | Key editorial fields |
|---|---|---|
| `siteSettings` | A singleton for editable global metadata | Site title, default SEO, sharing image, social links, support/contact details. |
| `blogLanding` | A singleton for the All Resources page | Headline, introduction, optional featured post reference, SEO. Existing background art remains code-owned. |
| `post` | The primary resource/guide document | Title, slug, excerpt, categories, publish date, feature flag, most-loved flag, responsive hero, intro, Portable Text body, related-post references, sidebar CTA, SEO. Posts are visibly published by Ring Society rather than an individual. |
| `publicationSettings` | A singleton for the organization byline | Display name, optional organization bio, organization mark, and optional generic editorial disclosure. This replaces individual author documents. |
| `category` | Reusable resource categories and existing chip mapping | Title, slug, description, controlled `filterKey`, sort order. |
| `pageSeo` | Reusable SEO object | SEO title, description, social image, canonical path, no-index toggle. |
| `responsiveImage` | Controlled editorial-image object | Required main image and alt text, optional mobile/tablet/XL crops, and a nine-position focal alignment. |
| `legalPage` | A fixed set of editorially maintained legal documents | Title, locked slug, last-reviewed date, Portable Text body, SEO. |
| `contactPage` | A singleton for editor-owned contact-page copy | Page title, introduction, contact methods, optional appointment CTA, SEO. Form plumbing remains code-owned. |

The current resource filters are not a generic category system. They include the editorial flag **Most-Loved Guides** and several taxonomy lenses. The proposed `category.filterKey` field will use the existing values (`jeweler`, `trends`, `perspectives`, and `diamonds`), while `post.isMostLoved` will drive the remaining chip. This preserves the current user-facing filter vocabulary without forcing editors to understand implementation-only structures.

## 4. First Vertical Slice

The first proof is deliberately limited to the exact path requested: an editor will create or update a Ring Society–authored draft record at `/guides/the-definitive-engagement-ring-buying-guide-2026`, publish it in Sanity, and see the title, excerpt, categories, reading time, hero image, article body, table of contents, related cards, and SEO update in the current listing and article presentation. The current short definitive guide remains only as a visual-template reference. No article seed will be created until complete, approved editorial content is supplied. A newly created published post will appear in the public list and resolve at `/guides/[slug]`.

| Vertical-slice component | How it works without a visual rewrite |
|---|---|
| Resource query | A public Sanity query retrieves published posts and maps them to the current `Card` shape. Until configuration is present, the existing local collection remains a safe development fallback. |
| Article query | A slug query retrieves a published post and maps the document to the current `ArticleDoc` and `ArticleBlock` shape. The existing article template continues to own reading progress, lightbox, sidebar, and animation behavior. |
| Portable Text | Paragraphs, H2 headings, images, definition lists, and callouts map to the block patterns already designed in `Article.tsx`. Unsupported editorial blocks are blocked at the Studio schema level rather than rendered inconsistently. |
| Images | A `picture`-based responsive component applies an alternate mobile/tablet/XL asset when provided; otherwise it uses the main image and focal position. Decorative backgrounds remain file-based. |
| Preview | Sanity Studio uses Presentation preview against a Vercel preview endpoint. Public reads use the CDN; token-bearing draft reads are restricted to a Vercel serverless preview route and are never exposed in browser code. |

## 5. Change Map for Approval

| Path | Action | Reason | Risk and mitigation |
|---|---|---|---|
| `studio/` | Add a separate Sanity Studio package, configuration, structure builder, schemas, and Studio README | Keeps editorial tooling separate from the Figma Make Vite application and avoids altering the client router or build shell. | Prefer the managed Sanity Studio host rather than a second Vercel project. The Studio remains in the same Git repository while editors use a dedicated Sanity-hosted URL. |
| `src/lib/sanity/client.ts`, `queries.ts`, `mappers.ts`, `types.ts`, `image.ts` | Add | Isolates Sanity network access and converts CMS data to the existing UI types. | New dependencies only; no styling or component architecture replacement. |
| `src/components/ResponsiveImage.tsx` | Add | Provides controlled responsive editorial image rendering with existing image behavior as the fallback. | Used only where editor-managed media is required. |
| `src/lib/seo.ts` | Add | Applies document-level title, description, canonical, social image, and no-index metadata from `pageSeo`. | Scoped to CMS-driven templates and legal/contact routes. |
| `src/pages/Resources.tsx` | Modify | Replaces static listing reads with a CMS query plus the current local fallback. Filter UI, layout, and URL behavior remain unchanged. | Loading and empty states must fit the existing grid without content shift. |
| `src/pages/Article.tsx` | Modify | Resolves a CMS post by slug and preserves the current article mechanics. | Async loading and not-found handling must be added without changing visual composition. |
| `src/components/GuideCard.tsx` | Modify | Adds an optional internal destination so CMS cards can open their corresponding article route. | Cards without destinations retain their current rendering. |
| `src/app/routes.tsx` | Modify | Appends Contact and four legal routes while retaining every current route. | Route names will be fixed and checked against footer/mobile navigation. |
| `src/lib/nav.ts` | Modify | Adds destinations for currently label-only legal items. | Uses the current single-source navigation pattern. |
| `src/components/Footer.tsx` | Modify | Turns the existing Contact Us and legal labels into real links. | No footer redesign. |
| `src/pages/Contact.tsx`, `src/pages/Legal.tsx` | Add | Supplies the five required tertiary templates using existing shared components and styling vocabulary. | Legal content is kept unpublished/no-index until approved copy exists. |
| `api/preview.ts`, `api/exit-preview.ts` | Add | Supports authenticated Sanity draft preview on Vercel without leaking an API token into client code. | Vercel-specific; no impact on the standard public rendering path. |
| `vercel.json` | Add | Ensures direct deep links such as `/guides/[slug]` and legal routes resolve on Vercel while preserving `/api/*`. | Verified before deployment using direct-path browser tests. |
| `package.json` and lockfile | Modify | Adds only Sanity client, image URL, and Portable Text packages; Studio dependencies live in `studio/package.json`. | Lockfile changes will be reviewable and no unrelated upgrades are planned. |
| `src/pages/OurMission.tsx` | Repair after approval | The external Vite production build currently fails because two opened motion components close with unrelated tags. | This is a concrete, isolated compatibility repair; no visual refactor is proposed. |
| `scripts/seed-posts.mjs` | Add only after complete, approved Ring Society editorial content is supplied | Creates or updates real guides and their real categories deterministically, with Ring Society as the organization byline. | No fabricated author, testimonial, review, or article content. |
| `api/lead-capture.ts` | Add after GoHighLevel connection method is approved | Validates and forwards the Contact and footer-CTA form payloads to the selected GoHighLevel workflow without exposing secrets in browser code. | A Vercel serverless endpoint keeps the workflow URL or API credential private and enables rate limiting, honeypot checks, and server-side validation. |

## 6. Non-Change List

The following areas are explicitly outside the CMS integration and will remain untouched unless a demonstrated compatibility issue is approved in writing: the shared Root shell; header and mobile navigation behavior; existing color variables; typography choices; motion primitives; existing image assets; visual article composition; reusable card geometry; Figma import files; page-specific home and mission layout; and source file naming or directory structure.

## 7. Identified Compatibility and Launch Risks

| Risk | Evidence from the audit | Proposed resolution |
|---|---|---|
| Current external production build fails | Running the copied archive’s `pnpm build` stops in `src/pages/OurMission.tsx`, where `RevealItem` and `Stagger` are opened but unrelated closing tags are present. | Apply only the two matching closing-tag repairs after approval, then rerun type/build validation before CMS work. |
| The public cards have no destination field | `GuideCard` presents a card without an internal link target. | Add an optional `to` field and wrap only destination-bearing cards; this is required for newly published posts to reach their detail page. |
| Figma design cannot be inspected in the current session | The supplied Figma link presents an authentication wall. | Treat the downloaded Figma Make archive as the current source of truth. A view-enabled Figma link may be added later for visual delta checks. |
| Sanity configuration is not yet available | A Sanity project exists, but the project ID, dataset, Studio role assignments, CORS origin list, and preview secret have not yet been supplied. | The project owner will create the production dataset and provide project ID and Studio administrator access. |
| Local Studio deployment is awaiting account authentication | The local Studio configuration is valid and its `production` dataset contains only Sanity system documents, but the current browser and local Studio CLI have no authenticated Sanity user session. | Use the enabled Sanity connection to inspect the project; when ready to deploy the code-managed Studio, the project owner will complete the Sanity login in the opened browser session. |
| Dataset ownership is verified | The authenticated Sanity dashboard shows that `production` was created with the Ring Society project (`p1o8iwkt`) on August 12, 2026, and the project currently has zero content documents. | Use the existing dataset for Ring Society; do not create a duplicate or migrate any Reflect Advisors data. |
| Dedicated Studio application is deployed | The authenticated Rise Refinery workspace now lists two separate applications: the existing Reflect Advisors Studio and the new Ring Society CMS (`https://ring-society.sanity.studio/`). | Use Ring Society CMS exclusively for Ring Society categories, pages, legal documents, and posts. Do not alter the Reflect Advisors application. |
| Legal copy is not yet available | The requested legal routes have no supplied content or approved source. | Build only after receiving counsel-approved content or a verified policy source. Do not publish placeholders as legal terms. |
| Contact workflow is now defined but the connection method is not | Both the Contact page and footer CTA must create or update contacts in GoHighLevel. | Select either a GoHighLevel inbound-workflow URL held server-side or a direct API connection through a secure serverless endpoint; map the contact fields and consent language before implementation. |
| Indexing must remain controlled | `.figma/make/site.json` currently sets indexing false. | Preserve no-index through staging and preview. Enable indexing only after canonical domains, robots, metadata, and legal copy have been reviewed for launch. |

## 8. Required Configuration and Content Inputs

| Needed item | Why it is needed |
|---|---|
| Sanity project ID and dataset name | Configures the public client and the Studio. |
| Studio owner/admin email addresses | Ensures the correct people receive Sanity Studio access. |
| Production and preview domains | Establishes Sanity CORS origins, canonical URLs, and the Studio preview target. |
| Deployment decision | Confirms the recommended low-complexity arrangement: the public website deploys once on Vercel from the repository root, while the Studio deploys from `studio/` to Sanity’s managed Studio host. |
| Ring Society organization byline details | Confirms the default public display name and whether an editorial disclosure or generic organization bio should appear. |
| Complete, approved article content package | Enables content migration only after all publication copy is ready; the existing brief guide remains a visual reference, not seed content. |
| GoHighLevel workflow URL or approved API credentials | Determines whether the secure contact-capture endpoint sends validated form submissions to an inbound workflow or to the contacts API. |
| Contact and footer-CTA field map plus consent language | Establishes which fields to capture, how contacts should be tagged, and what privacy/marketing consent must be recorded. |
| Counsel-approved legal-page copy or URLs | Required before publishing the Privacy, Terms, Accessibility, and Do Not Sell pages. |
| Preferred public canonical domain | Needed for final SEO and preview configuration. |

## 9. Validation Contract

The implementation will not expand beyond the vertical slice until the following test succeeds in a browser: create or edit one real post in Sanity, attach a real author and category, save it as a draft and verify it is absent from the public list, preview the draft through the protected preview route, publish the post, verify it appears in `/all-resources`, open the generated `/guides/[slug]` route directly, and test the card, hero, body image, table of contents, related-content link, metadata, and responsive crops at mobile, tablet, desktop, and XL widths.

## 10. Immediate Recommendation

Approve the additive change map, provide the configuration and content inputs in Section 8, and authorize the two isolated mission-page build repairs. On approval, the next work is limited to importing the existing source into the managed workspace, confirming the baseline build, establishing the separate Studio, and completing the one-guide vertical slice before touching the homepage or any additional marketing surfaces.
