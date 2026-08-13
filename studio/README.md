# Ring Society CMS Studio

This Studio is deliberately separate from the public Figma Make application so editorial tooling does not alter the public site router, build configuration, or visual system.

## Local Development

Run `pnpm install` and then `pnpm dev` from this directory. The Studio is configured for the Ring Society Sanity project (`p1o8iwkt`) and its `production` dataset.

## Editorial Policy

Published articles use **Ring Society** as the organization byline. Do not create individual author documents. The current local guide content exists only as a visual/template reference; do not seed or publish it. Add posts only after approved editorial copy, images, and legal review are available.

## Publishing Flow

Create or edit a post, supply a title, slug, excerpt, publish date, responsive hero image, introduction, body, categories, and SEO. A document remains invisible on the public site until it has a slug and publish date and is published. The public site retains local Figma Make content as a development fallback until published Sanity content exists.

