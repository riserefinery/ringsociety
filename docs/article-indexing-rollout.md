# Ring Society Article Indexing Rollout

## Approved single-article release

Only `https://ringsociety.com/guides/how-to-buy-an-engagement-ring` is approved for indexing in this release. The article was reviewed and published in Sanity with the approved title, description, seven graphics, original hero, and `seo.noIndex: false`.

The build renders this published post through the existing React article template into one HTML artifact. The canonical route serves that content-bearing HTML to visitors, search crawlers, and social crawlers alike. Its head contains the article metadata before JavaScript runs. The browser is seeded with the same public snapshot so its initial article matches the crawler version.

All other routes keep their existing protections. `.figma/make/site.json` remains `robots.index: false`; the common HTML shell remains noindexed. Vercel keeps the blanket guide header for every unapproved guide, the SMS and legal headers, and the existing metadata-only sharing route for other guides. Preview/noncanonical hosts remain noindexed. The metadata-only API and direct artifact URLs are also noindexed. The approved article's trailing-slash alias redirects to its clean canonical URL.

On `ringsociety.com` only, robots.txt permits this exact article and its static `/assets/` resources while retaining `Disallow: /` for other pages. The default robots.txt on other hosts continues to block crawling. Do not submit an XML sitemap at this stage.

## Editorial update and deployment sequence

1. Update the existing Sanity article through a reviewed draft, preserving its slug, hero, and unrelated fields.
2. Publish only after content, graphics, citations, and metadata are approved.
3. Regenerate and deploy the crawlable HTML through the normal GitHub/Vercel build. **Sanity publication alone does not refresh this article's static search copy.** Its browser snapshot and raw HTML deliberately stay on the same deployed content revision.
4. Check the canonical response's meaningful body, unique title/description/canonical/social tags, absence of noindex, and robots allowance with visitor, search, and social User-Agents. Check an unapproved guide and preview host remain protected.

The build fails closed if the approved post is unavailable, lacks content, has a mismatched canonical path, or is not explicitly opted into indexing. To revoke indexing for this static page, restore its CMS noindex flag and the deployment-level noindex block or remove the approved route; redeploy the change. A CMS flag cannot instantly revoke already deployed static HTML.

## Guardrails

Do not broaden the approved slug or host allowlist without separate approval. Do not release the paused desktop hero-height patch as part of indexing work. Leave `app.ringsociety.com`, Reflect, legal routes, domain redirects, the legacy SMS launcher, and every lead-form integration untouched.

Sources and body-level Related Guides stay in the existing closed Article End Matter accordions, not in the main body or table of contents. Future articles remain noindexed until their own editorial approval and explicit indexing authorization.
