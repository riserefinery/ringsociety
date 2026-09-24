# Ring Society Article Indexing Rollout

## Current pilot mode

The public Vercel URL remains globally no-indexed because the production apex domain has not yet been assigned. This prevents the preview hostname from competing with the intended `https://ringsociety.com` canonical URLs in search results.

Every `/guides/` route also has a Vercel `X-Robots-Tag: noindex, follow` header. This is the authoritative article-level lock for the pilot: crawlers can read the directive before rendering JavaScript, and the website can be shared with pilot users without putting unreviewed article content into search.

Each post also stores `seo.noIndex`. Existing posts have been set to `true`; new posts default to `true` in the local Studio schema. The public article page emits a matching `meta[name="robots"]` tag when that field is set. The per-post control preserves editorial readiness state for the later production release.

## Production-release sequence

1. Assign `ringsociety.com` to the public Vercel project and set `www.ringsociety.com` to redirect to the apex. Keep `app.ringsociety.com` assigned to the existing matching-funnel project.
2. Add the apex and `www` origins to Sanity CORS if they are not already present.
3. Confirm the homepage’s canonical URL, title, social image, legal pages, and robots response on the apex domain.
4. Change the global site robots setting from `index: false` to `index: true` so the core site can be crawled.
5. Keep the `/guides/` Vercel no-index route header in place while articles are being rewritten and fact-checked. Do not submit an XML sitemap at this stage.
6. After editorial and expert approval of the article set, verify every approved guide has `Prevent Search Indexing` turned off in Studio, remove the temporary `/guides/` header, and then generate and submit a sitemap containing only canonical, indexable URLs.

## Editorial rule

An article should remain no-indexed until its copy has passed factual review, its sources are complete, imagery and alt text are approved, and its SEO title and description have been reviewed. Sources and body-level related guides belong in the existing closed Article End Matter accordions, not in the main Article Body or table of contents.

## Guardrails

Do not use `robots.txt` to block an article that needs to be removed from search. A crawler must be able to access the URL in order to see a `noindex` directive. No-indexed guides should also be omitted from any future sitemap.
