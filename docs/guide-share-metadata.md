# Ring Society Guide Share Metadata

## Purpose

Every Ring Society guide now has its own social-sharing metadata. When a guide link is pasted into a supported social or messaging platform, the shared card uses that guide’s own title, description, canonical permalink, and Hero Image rather than the homepage defaults.

## Editor workflow in Sanity

Open the relevant **Post or Guide** document in Ring Society Studio.

| Field | Location | Normal behavior | When to edit it |
|---|---|---|---|
| **Permalink** | Content tab | The public guide URL uses `/guides/` plus this editable ending. | Change only when the URL itself must change. Add a redirect before changing an established permalink. |
| **Share Title Override** | Search & Sharing tab | Defaults to the article title. | Use when a social-card headline should differ from the on-page title. |
| **Share Description Override** | Search & Sharing tab | Defaults to the article excerpt. | Use to make the preview clearer, shorter, or more specific. Aim for approximately 100–150 characters. |
| **Share Image Override** | Search & Sharing tab | Defaults to the guide’s Hero Image. | Use only when a dedicated social crop or illustration is preferable. |
| **Canonical URL Override** | Search & Sharing tab | Defaults to the public Permalink. | Leave blank in normal circumstances. Use only for a deliberate canonicalization decision. |
| **Prevent Search Indexing** | Search & Sharing tab | Continues to protect unreviewed guides from search. | Turn off only after editorial and expert review approve a guide for indexing. |

## Current default policy

All currently published guides have been populated with editable share values. Their share images reference their existing Hero Images; their share titles mirror the published guide titles; their share descriptions are concise editorial summaries; and their canonical paths match the current `/guides/` public routes.

This setup does not change the current pilot-wide no-index policy. A guide may have a fully formed share card while remaining excluded from search results.

## Technical behavior

The normal browser experience updates document metadata after guide content loads. For reliable previews, supported social crawlers also receive a lightweight server-rendered metadata document. This ensures the platform can read the correct Open Graph and Twitter tags in its initial HTTP response.

After changing share metadata, publish the guide in Sanity. Most platforms cache previews; if an old preview persists, use that platform’s official sharing debugger or wait for its cache to refresh. The website URL itself remains unchanged unless the **Permalink** is edited.
