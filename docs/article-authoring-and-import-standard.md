# Ring Society Article Authoring and Import Standard

This standard applies to every Ring Society post and guide authored or migrated through Sanity.

## Approved presentation reference

Use [How to Buy an Engagement Ring: The Definitive Guide](https://ringsociety-web.vercel.app/guides/how-to-buy-an-engagement-ring) as the approved public reference for all incoming article formatting. Preserve its established reading rhythm, heading hierarchy, body-copy treatment, paragraph spacing, native lists, blockquote treatment, editorial callouts, table-of-contents behavior, end-matter accordions, and related-guide presentation. Do not reproduce its copy or imagery in other articles; use it only as the structural and visual standard.

New source articles may be imported without images when images are not yet approved or available. Do not create placeholder, stock, or AI-generated editorial images. When final assets arrive, upload them as Sanity assets, place them in the approved narrative position, and add descriptive alt text before the article becomes indexable.

## Semantic hierarchy

| Content purpose | Sanity control | HTML output | In-article navigation |
|---|---|---|---|
| Article title | `Title` field, outside Article Body | `h1` | Not included |
| Major topic | `Section Heading` | `h2` | Included |
| Subtopic | `Subsection Heading` | `h3` | Excluded |
| Rare deeper subdivision | `Supporting Heading` | `h4` | Excluded |
| Paragraph | `Normal` | `p` | Not included |

Use one `h1` per guide. Use `h2` for the main reader journey and `h3` for supporting sections within an `h2`. Use `h4` only where a genuine third level improves comprehension. Do not use `h5` or `h6`.

## Heading import rule

When importing content from Word, Google Docs, or another source, preserve heading **text and hierarchy** but discard all source inline formatting on `h2`, `h3`, and `h4` blocks. In particular, imported headings must have no bold, italic, underline, strike-through, code, or link marks. Heading appearance is defined only by the Ring Society renderer.

Body-copy emphasis and links should be retained when the source content calls for them.

## Typography and presentation

| Element | Typography | Presentation |
|---|---|---|
| H2 / Section Heading | Instrument Serif | Existing major-section treatment |
| H3 / Subsection Heading | Archivo Medium, 24px, 1.3 line height | Matches Ring Society guide-card titles |
| H4 / Supporting Heading | Archivo Semibold | Compact supporting hierarchy |
| Blockquote | Instrument Serif, 32px, 1.3 line height | Black text with a solid 1px black left separator |
| Editorial Callout | Existing `Editorial Callout` object | Use for `KEY ADVICE` and editorial guidance, not quotations |

A blockquote is for a genuine quotation. An Editorial Callout is for Ring Society guidance or a practical recommendation. They are not interchangeable.

## Lists and related links

Use the native `Bulleted list` and `Numbered list` controls for semantic lists within the main Article Body. The separate `Related Guides (Optional Override)` discovery field controls the post-card recommendations shown after an article and should not be used as a replacement for body-copy reading lists.

## Article end matter

**Sources** and body-level **Related Guides** are article end matter, not Article Body content. They must be stored in the dedicated **Article End Matter** Studio group, then rendered below the main article as two closed accordion toggles.

| Source-document section | Sanity field | Public presentation | Table of contents |
|---|---|---|---|
| `Related Guides` | `Related Guides (Article End Matter)` | Closed Related Guides accordion with linked reading list | Excluded |
| `Sources` / `References` | `Sources (Article End Matter)` | Closed Sources accordion with individual linked citations | Excluded |

During every article import, identify the end-matter boundary before generating Portable Text. Remove the `Related Guides` and `Sources` headings, their items, and their citations from Article Body. Capture each related guide as a title-and-URL entry, and each source as a citation-and-URL entry. Keep all main text, citations that appear inline within paragraphs, images, callouts, and article headings in Article Body.

## Editorial imagery

Use in-article image blocks for article visuals. Every image requires descriptive alt text. Add a caption when it improves reader context, and use an Image Note only for material editorial clarification. Do not move article images into standalone gallery fields: each in-body image is included in the existing article-wide lightbox gallery in its reading order.

## Migration validation checklist

Before a migrated guide is published, verify the following:

- The `Title` field is the single page-level title; no `h1` remains in Article Body.
- Every heading has the right level and no inline formatting marks.
- The navigation includes `h2` headings only.
- Lists inside Article Body are native list blocks, not manually typed bullet characters or separate paragraph approximations.
- `Related Guides` and `Sources` do not appear as blocks or headings in Article Body; their structured fields contain every approved link and citation.
- Blockquotes and Editorial Callouts are used for their distinct editorial purposes.
- Every image retains the approved asset, alt text, caption, source order, and lightbox behavior.
- The public presentation is reviewed at desktop and mobile widths before publication.
