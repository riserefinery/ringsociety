# Ring Society — Article Migration Handoff

## Purpose

This handoff is for a focused follow-on task that migrates the approved Ring Society article catalog into Sanity. The public website and its visual system are already implemented. The migration task should **not** redesign the site, refactor page layouts, or alter the existing CMS schema unless a real content-mapping gap is first identified and approved.

## Current system

| Area | Current state |
|---|---|
| Public site | React/Vite public site, deployed from GitHub to the Shopfine Vercel project `ringsociety-web` |
| Public review URL | `https://ringsociety-web.vercel.app/` |
| CMS | Sanity project `p1o8iwkt`, dataset `production` |
| Studio | `https://ring-society.sanity.studio/` |
| Editorial ownership | Ring Society only; do not add individual author bylines |
| Existing content | Draft post records, legal pages, page settings, article labels, Top Guides controls, related-guide controls, and local display fallbacks are already in place |

## Recommended migration approach

Use **Sanity as the sole editorial source of truth** for every approved guide. Migrate one article at a time at first, validate it in Studio and on the Vercel review site, then continue as a controlled batch. This prevents a formatting or image-placement issue from being repeated across all fourteen articles.

Each source article should be mapped into one Sanity **post** document with the following elements.

| Source material | Sanity destination | Migration requirement |
|---|---|---|
| Article title | `title` | Preserve approved capitalization and editorial wording. |
| URL direction | `slug` | Confirm a clean, stable public slug before publishing. |
| Intro/dek | `excerpt` | Keep it concise and distinct from the first body paragraph. |
| Primary visual | Hero Image and Alignment | Upload the approved asset, provide descriptive alt text, and set focal alignment. |
| Article body | Portable Text body | Preserve headings, paragraphs, lists, links, emphasis, and inline images in their original reading order. |
| Inline images | Portable Text image blocks | Upload each source image as a Sanity asset and place it immediately after the corresponding body block. Add alt text and a caption only when editorially approved. |
| Search/social fields | SEO and social metadata | Use the approved SEO title, description, and social image where supplied; otherwise flag for editorial completion rather than inventing copy. |
| Editorial relationships | Labels, Top Guides, and Related Guides | Apply only the intended approved selections and order. |

## Intake formats

Both source formats are supported. **Google Docs is preferred when the document is the approved editorial master; Markdown is preferred when the body and image paths are already cleanly structured.**

### Google Docs intake

Provide a Google Drive folder containing the approved article Docs and, ideally, a companion asset folder. The migration task should read documents through the connected Google Workspace workflow rather than manually copying from a browser window. Each article should have a clear title and status, and the source document should use semantic heading styles where possible.

For images embedded in a Doc, the migration task should export or retrieve the original images, retain their visual placement relative to the surrounding text, upload them to Sanity, and add approved alt text. If a Google Doc contains only compressed inline previews, provide the original image files in the companion folder whenever possible.

### Markdown intake

Upload a single ZIP or folder containing each `.md` file and its image directory. Relative image paths must remain intact. Use meaningful image filenames such as `diamond-cut-comparison.jpg`, not ambiguous camera-export names. A Markdown article should use heading syntax, paragraph breaks, standard lists, and inline image syntax in final editorial order.

## Efficient batch workflow

1. Create one **source-of-truth folder** with the fourteen approved article documents and an `assets/` subfolder for each article.
2. Supply a simple migration tracker with article title, desired slug, category, hero-image filename, publication status, and any special label or related-guide instruction.
3. Migrate one pilot guide completely, including its hero, inline media, SEO fields, and preview verification.
4. Obtain editorial approval of the pilot in both Sanity Presentation and the Vercel review site.
5. Process the remaining articles in small, reviewable batches. Do not publish drafts until each article’s source copy, imagery, alt text, and metadata are approved.
6. After each batch, verify public routes, image loading, heading hierarchy, inline-media order, labels, related guides, and Top Guides behavior.

> The migration must never fabricate copy, sources, ratings, reviews, or testimonials. Missing alt text, metadata, caption guidance, or image source details should be flagged for Ring Society editorial review.

## Image handling standard

Every hero and inline image needs clear editorial ownership, an original-resolution file where available, and descriptive alt text. Decorative images may use an empty alt value only where they are genuinely non-informational. Images should be uploaded to Sanity, never hard-coded into a post body from a temporary local path.

For article body images, preserve the article’s narrative rhythm: place an image adjacent to the paragraph or section it supports, rather than collecting all images at the top or bottom. If the source contains a complex comparison table, diagram, or unsupported visual layout, flag it before migration so it can be rebuilt in an appropriate editorial format.

## Recommended new-chat prompt

Start a new task in this same Ring Society project and attach this handoff. Then send the following with either the Google Drive folder link or the Markdown package:

> Read the attached `ARTICLE_MIGRATION_HANDOFF.md`. I am ready to migrate Ring Society’s approved editorial articles into the existing Sanity project `p1o8iwkt`, dataset `production`. Use Sanity as the editorial source of truth. Preserve all approved copy, headings, links, inline-image positions, and image alt text; do not redesign the public site or change the CMS schema without asking. Begin with one pilot article and show me the Sanity mapping and Vercel preview before processing the remaining articles.

## What to provide before the migration begins

| Required input | Why it matters |
|---|---|
| Approved Google Docs folder or Markdown package | Establishes the article copy that may be migrated. |
| Original image files or per-article asset folders | Avoids relying on compressed inline previews. |
| Alt text and caption guidance | Supports accessible, accurate image treatment. |
| Title/slug/category tracker | Prevents ambiguous route and taxonomy choices. |
| Publication order | Allows drafts to be reviewed and released in the intended sequence. |
| Any article-label, Top Guides, or related-guide instructions | Keeps editorial merchandising decisions deliberate and CMS-managed. |

## Current boundaries

The existing Shopfine funnel at `app.ringsociety.com` remains separate from the editorial site. The editorial migration should not change its architecture, domain assignments, Vercel configuration, lead forms, or the established public-site styling. It should focus on accurately moving approved editorial content and media into Sanity, then validating each resulting guide page.
