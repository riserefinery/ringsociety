# Ring Society Article Import Log

## Pilot 01 — Engagement Rings with Hidden Halos

| Field | Recorded value |
|---|---|
| Source file | `EngagementRingswithHiddenHalos_TheSubtleSparkleTrend.md` |
| Existing Sanity record | `post-engagement-rings-with-hidden-halos` |
| Public route | `/guides/engagement-rings-with-hidden-halos` |
| Publication state | Published for pilot review |
| Search-indexing state | `seo.noIndex: true`; the site-wide and `/guides/` no-index controls remain active |
| Imported body structure | Three lead-in paragraphs, eight H2 sections, ten H3 sections, ten semantic bullet items, four inline guide links, four Related Guides, and four Sources |
| Images | No new image assets were supplied or created. The pre-existing temporary hero asset remains in place; there are no inline article images. |
| Deliberate omission | The inline and Related Guides reference to `questions-to-ask-before-buying-a-ring` was removed because no existing Ring Society guide record or route exists for it. |

The article was mapped only to its existing guide page and not to a new route. The imported Portable Text preserves the supplied title, emphasis, headings, lists, citations, and link placement. Internal links were normalized to existing canonical `/guides/` paths. Sources and Related Guides remain in the site’s closed Article End Matter accordions.

## Batch 1 — Tier 1 and 2

The six approved Markdown files in `Tier1and2.zip` were mapped only to their existing Sanity post records and published to their existing public routes. Every record remains protected by `seo.noIndex: true`, the global site no-index policy, and the Vercel `/guides/` `X-Robots-Tag: noindex, follow` header.

| Existing guide | Public route | Imported content | End matter |
|---|---|---|---|
| Go Big or Shop Small? Big-Box vs. Local vs. Online Jewelers | `/guides/big-box-vs-local-vs-online-jewelers` | 3 lead-in paragraphs; 56 body blocks | 4 Related Guides; 5 Sources |
| Natural vs. Lab-Grown Diamonds: The Honest, Unbiased Comparison | `/guides/natural-vs-lab-grown-diamonds` | 2 lead-in paragraphs; 42 body blocks | 6 Related Guides; 7 Sources |
| The Complete Guide to Engagement Ring Settings & Styles | `/guides/engagement-ring-settings-and-styles` | 4 lead-in paragraphs; 109 body blocks | 5 Related Guides; 4 official GIA Sources |
| The Ideal Diamond Cut: How to Choose the Right Diamond for Your Ring Setting and Budget | `/guides/ideal-diamond-cut` | 2 lead-in paragraphs; 43 body blocks | 7 Related Guides; 6 Sources |
| The Ultimate Guide to Diamond Clarity, and What it Means for Your Ring Choice & Budget | `/guides/ultimate-guide-to-diamond-clarity` | 2 lead-in paragraphs; 59 body blocks | 8 Related Guides; 7 Sources |
| Which Diamond Shape Looks the Biggest? | `/guides/which-diamond-shape-looks-biggest` | 3 lead-in paragraphs; 40 body blocks | 6 Related Guides; 2 Sources |

The Go Big page title was updated sitewide to the supplied headline ending in “Jewelers.” The unavailable `questions-to-ask-before-buying-a-ring` link was removed from every Batch 1 inline reference and Related Guides list. All remaining Ring Society links were normalized to canonical `/guides/` paths. The four Settings & Styles source citations that arrived without URLs were verified against official GIA pages before publication. No new pages, image assets, or inline images were created; existing hero media remains in place until approved article-specific media is supplied.

## Batch 2 — Tier 3

The five approved Markdown files in `Tier3.zip` were mapped only to their matching existing Sanity post records and published to their existing public routes. Each record remains protected by `seo.noIndex: true`, the global site no-index policy, and the Vercel `/guides/` `X-Robots-Tag: noindex, follow` header.

| Existing guide | Public route | Imported content | End matter |
|---|---|---|---|
| Engagement Ring Budgets: How Much Should You Spend? | `/guides/engagement-ring-budgets` | 3 lead-in paragraphs; 70 body blocks | 5 Related Guides; 9 verified Sources |
| How to Find Her Ring Size Without Ruining the Surprise | `/guides/how-to-find-her-ring-size` | 3 lead-in paragraphs; 27 body blocks | 2 Related Guides; 3 Sources |
| The 4Cs of Diamonds Explained in Plain English | `/guides/4cs-of-diamonds` | 3 lead-in paragraphs; 54 body blocks | 8 Related Guides; 8 Sources |
| The Most Popular & Trending Ring Styles and Diamond Shapes in 2026 | `/guides/engagement-ring-trends-2026` | 4 lead-in paragraphs; 70 body blocks | 5 Related Guides; 6 Sources |
| What Drives Diamond Pricing? Hear from Experts | `/guides/what-drives-diamond-pricing` | 2 lead-in paragraphs; 47 body blocks | 5 Related Guides; 8 Sources |

The Ring Size guide retains the approved “How to Find Her Ring Size Without Ruining the Surprise” headline. The 4Cs and Ring Trends records adopt their supplied headlines sitewide; local fallbacks, homepage cards, footer labels, and migration fixtures were aligned to avoid stale text. The unavailable `questions-to-ask-before-buying-a-ring` destination was removed from the Ring Size and 4Cs Related Guides. The 4Cs supplied its Related Guides as plain-text names, which were resolved to existing canonical guides. The Budget source list arrived without URLs; every citation was verified against its original publisher and linked to its official source before publication. No new routes or imagery were created.

## Reusable pilot rules

For each next approved Markdown article, map the supplied content to its matching existing Sanity post draft or published post. Do not create a new page unless the user explicitly requests one. Preserve semantic Markdown structure, convert valid in-body links to canonical existing Ring Society routes, and remove or flag any link whose destination does not yet exist. Do not manufacture imagery: retain an existing approved hero only when appropriate, and add inline images only after approved assets and alt text are provided. Keep every imported article no-indexed until its expert review and final image/SEO approval are complete.

## Pilot 02 — How to Choose A Jeweler: Our 10-Point Framework

| Field | Recorded value |
|---|---|
| Source file | `HowtoChooseYourJeweler_RingSocietyFramework.md` |
| Existing Sanity record | `post-how-to-choose-a-jeweler` |
| Public route | `/guides/how-to-choose-a-jeweler` |
| Publication state | Published for pilot review |
| Search-indexing state | `seo.noIndex: true`; the site-wide and `/guides/` no-index controls remain active |
| Imported body structure | Five lead-in paragraphs; five H2 sections; thirteen H3 sections; ten italicized reader prompts; one inline GIA Report Check link |
| End matter | None supplied; no Sources or Related Guides accordion entries were added |
| Images | No new images were supplied or created. The existing approved Hero Image and social-sharing image remain unchanged. |

The supplied framework was mapped only to the existing Jeweler guide record. The established title, permalink, Hero Image, article label, share title, share description, share image, and canonical path remain unchanged. Its source heading was intentionally treated as the source-document heading rather than a second on-page H1; the existing article title remains the only public H1. No new route, image asset, or indexability change was introduced.
