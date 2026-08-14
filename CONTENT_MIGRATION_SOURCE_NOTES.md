# CMS Migration Source Notes

## Definitive engagement-ring guide

The current public fallback guide is available at `https://ringsociety-web.vercel.app/guides/the-definitive-engagement-ring-buying-guide-2026`.

| Field | Current value |
|---|---|
| Title | The Definitive Engagement Ring Buying Guide for 2026 |
| Hero image | `https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/hMRVJNIUabdYFWOo.png` |
| Supporting images | `https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/OWqnlWlvIuDcqkVF.png`; `https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/wuvbtZrsLxQfrIyD.png` |
| Current status | Local fallback/template content; retain as a Sanity draft until editorial approval. |

The guide currently includes a subtitle, two introductory paragraphs, two major sections, image captions, a definition list, categories, keywords, and a related-guide surface. Its Sanity draft should preserve the current slug and material so editors can replace or complete it without altering the live fallback until they publish.

## Live fallback verification

On 2026-08-14, the Shopfine review deployment at `https://ringsociety-web.vercel.app` continued to render the imported fallback catalog on All Resources and Top Guides, while the new public Jeweler Framework image was applied through the shared local asset mapping. The editable Sanity drafts intentionally remain unpublished, so they can be completed and reviewed in Studio before they replace the fallback catalog.

## Dataset verification

On 2026-08-14, a raw-perspective query against the `p1o8iwkt` production dataset confirmed **15 editable `post` drafts** and **4 editable `legalPage` drafts**. It also confirmed that `drafts.post-how-to-choose-a-jeweler` references the supplied Jeweler Framework asset: `image-b326d3006e0d637442eb00c087fbc53130793ac8-1340x895-jpg`. The regression suite includes `server/sanity-migration-catalog.test.ts` to retain this check.

## Top Guides and hello-bar migration

On 2026-08-14, the migration created `drafts.topGuidesLanding` with eight ordered guide references, added each relevant post’s `bigFeatureImage`, and created `drafts.siteSettings` with the current green hello-bar message. The review deployment continued to display the existing eight-row Top Guides fallback, including the supplied Jeweler Framework background, while those CMS records remain drafts. Once the selected posts and Top Guides singleton are published, the public page will instead use the editor-managed order and post-level Big Feature images.
