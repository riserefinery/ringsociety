import { createClient } from '@sanity/client'
import { readFile } from 'node:fs/promises'

const projectId = process.env.VITE_SANITY_PROJECT_ID ?? 'p1o8iwkt'
const dataset = process.env.VITE_SANITY_DATASET ?? 'production'
const token = process.env.SANITY_AUTH_TOKEN

if (!token) {
  throw new Error('SANITY_AUTH_TOKEN is required to migrate editable Sanity drafts.')
}

const client = createClient({ projectId, dataset, token, apiVersion: '2026-08-13', useCdn: false })

const replacementJewelerImage = 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/QwiXUftFpgsSnumz.jpg'

const sources = {
  howToBuy: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/XaEXePovnvXGswTb.jpg',
  jeweler: replacementJewelerImage,
  trending: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/MARaSrzuOckwxtoS.jpg',
  halo: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/xeFgYxgqkbWOmlLh.jpg',
  budgets: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/QqEaUeTWpdRBWDjG.jpg',
  settings: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/eAIVNFooCjXmmLJd.jpg',
  ringSize: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/hFZJHeyhppzEtJMe.jpg',
  shape: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/GEtCYTVLWsDDWQkj.jpg',
  fourCs: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/GHoQDeoRtAqJOmXb.jpg',
  emerald: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/ktShmKNwEtMTspjp.jpg',
  labGrown: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/isNGiovgPQFKdxYw.jpg',
  pricing: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/RsTiiuLraYGvENfp.jpg',
  clarity: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/pcfFdHEVNYfOzKQZ.jpg',
  idealCut: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/RBNOqPFQkHvUzKDx.jpg',
  definitiveHero: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/hMRVJNIUabdYFWOo.png',
  anatomy: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/OWqnlWlvIuDcqkVF.png',
  settingsDiagram: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/wuvbtZrsLxQfrIyD.png',
  bigFeatureJeweler: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/QwiXUftFpgsSnumz.jpg',
  bigFeatureBudgets: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/fKOcyQuJEeuUHCpz.jpg',
  bigFeatureLabGrown: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/GkZGYuwxyGjJYYCf.jpg',
  bigFeatureSettings: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/bsaGZmmdfsoCbOUG.jpg',
  bigFeatureBigBox: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/tsixmYGlQYMxDvwA.jpg',
  bigFeaturePricing: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/ByyEtHdFmDcPOceG.jpg',
  bigFeatureClarity: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663235760234/HkhNntTGilnADxkj.jpg',
}

const guides = [
  { slug: 'how-to-buy-an-engagement-ring', category: 'Guide', title: 'How to Buy an Engagement Ring', excerpt: 'Shopping for an engagement ring should be one of life’s biggest moments… but often couples find it intimidating and stressful. We’ll show you everything, from styles to budgeting, to jewelers.', cta: 'view the guide', image: 'howToBuy', alt: 'A woman resting her hand against her face, an engagement ring catching the light', filters: ['most-loved'] },
  { slug: 'how-to-choose-a-jeweler', category: 'Guide', title: 'How to Choose A Jeweler: Our 10-Point Framework', excerpt: 'Before you walk into any jeweler, there are 10 things you should be evaluating — from how long they’ve been in business and the quality of their customer reviews, to how they handle pricing, post-purchase support, and more.', cta: 'view the guide', image: 'jeweler', alt: 'A Ring Society guide about choosing the right jeweler', filters: ['most-loved', 'jeweler'], bigFeature: 'bigFeatureJeweler', topGuidesBadge: 'featured' },
  { slug: 'most-popular-trending-ring-styles-2026', category: 'Trends', title: 'The Most Popular & Trending Ring Styles and Diamonds in 2026', excerpt: 'Discover the ring styles and diamond trends shaping 2026.', cta: 'trending diamond rings', image: 'trending', alt: 'A brilliant-cut diamond ring resting on textured fabric', filters: ['trends'] },
  { slug: 'engagement-rings-with-hidden-halos', category: 'Perspectives', title: 'Engagement Rings with Hidden Halos: The Subtle Sparkle Trend', excerpt: 'A closer look at the hidden-halo engagement-ring trend.', cta: 'hidden halo engagement rings', image: 'halo', alt: 'A diamond solitaire ring on deep blue velvet', filters: ['perspectives', 'trends'] },
  { slug: 'engagement-ring-budgets', category: 'Guide', title: 'Engagement Ring Budgets: How Much Should You Spend?', excerpt: 'How much should you actually spend on an engagement ring? We break down real budget ranges, what drives the price, and how to get the most sparkle for what you’re comfortable spending.', cta: 'view the guide', image: 'budgets', alt: 'An engagement ring displayed in a presentation box', filters: ['most-loved'], bigFeature: 'bigFeatureBudgets' },
  { slug: 'engagement-ring-settings-and-styles', category: 'Guide', title: 'The Complete Guide to Engagement Ring Settings & Styles', excerpt: 'A visual guide detailing every major ring setting and how different settings affect day-to-day wear.', cta: 'view the guide', image: 'settings', alt: 'An assortment of rings on a dark surface', filters: ['most-loved'], bigFeature: 'bigFeatureSettings' },
  { slug: 'how-to-find-her-ring-size', category: 'Article', title: 'How to Find Her Ring Size Without Ruining the Surprise', excerpt: 'A practical guide to learning ring size without spoiling the moment.', cta: 'ring sizing guide', image: 'ringSize', alt: 'A couple holding hands', filters: ['jeweler'] },
  { slug: 'which-diamond-shape-looks-biggest', category: 'Article', title: 'Which Diamond Shape Looks the Biggest?', excerpt: 'Compare diamond shapes and their visual presence.', cta: 'compare diamond shapes', image: 'shape', alt: 'A diamond ring photographed on fabric', filters: ['diamonds'] },
  { slug: '4cs-of-diamonds', category: 'Guide', title: 'The 4Cs of Diamonds (Explained in Plain English)', excerpt: 'A plain-English guide to cut, color, clarity, and carat weight.', cta: 'view the guide', image: 'fourCs', alt: 'A woman with her hand resting near her face', filters: ['most-loved', 'diamonds'] },
  { slug: 'go-big-or-shop-small', category: 'Guide', title: 'Go Big or Shop Small? Big-Box vs. Local vs. Online', excerpt: 'How national chains, online-only retailers, and independent local jewelers differ.', cta: 'view the guide', image: 'emerald', alt: 'A gold ring set with an emerald-green stone', filters: ['jeweler', 'perspectives'], bigFeature: 'bigFeatureBigBox' },
  { slug: 'natural-vs-lab-grown-diamonds', category: 'Guide', title: 'Natural vs. Lab-Grown Diamonds: The Honest, Unbiased Comparison', excerpt: 'A transparent guide comparing price, chemical makeup, long-term value retention, and ethical considerations.', cta: 'view the guide', image: 'labGrown', alt: 'Loose diamonds scattered across a surface', filters: ['most-loved', 'diamonds'], bigFeature: 'bigFeatureLabGrown', topGuidesTextTone: 'dark' },
  { slug: 'what-drives-diamond-pricing', category: 'Guide', title: 'What Drives Diamond Pricing? Hear from Experts', excerpt: 'Industry insiders explain how the 4Cs, certification, and market forces affect diamond pricing.', cta: 'diamond pricing guide', image: 'pricing', alt: 'A jeweler working at a bench', filters: ['diamonds', 'perspectives'], bigFeature: 'bigFeaturePricing' },
  { slug: 'ultimate-guide-to-diamond-clarity', category: 'Guide', title: 'The Ultimate Guide to Diamond Clarity, and What it Means for Your Ring Choice & Budget', excerpt: 'Learn what clarity grades really mean, which inclusions you will never see, and where to spend versus save.', cta: 'view the guide', image: 'clarity', alt: 'A gold ring with a green gemstone on a table', filters: ['diamonds'], bigFeature: 'bigFeatureClarity' },
  { slug: 'ideal-diamond-cut', category: 'Article', title: 'The Ideal Diamond Cut: How to Choose the Right Diamond for Your Ring Setting and Budget', excerpt: 'A guide to choosing a diamond cut for your setting and budget.', cta: 'how to choose a diamond', image: 'idealCut', alt: 'A silver ring worn on a finger', filters: ['diamonds'] },
]

const categoryDefinitions = [
  { key: 'jeweler', title: 'Finding a Jeweler' },
  { key: 'trends', title: 'Trends' },
  { key: 'perspectives', title: 'Perspectives' },
  { key: 'diamonds', title: 'Diamonds' },
]

function key(label) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 32)
}

function block(text, style = 'normal') {
  return { _type: 'block', _key: `block-${key(text)}-${Math.random().toString(36).slice(2, 7)}`, style, markDefs: [], children: [{ _type: 'span', _key: `span-${Math.random().toString(36).slice(2, 7)}`, text, marks: [] }] }
}

function imageField(assetId) {
  return { _type: 'image', asset: { _type: 'reference', _ref: assetId } }
}

async function uploadImage(label, sourceUrl) {
  const response = await fetch(sourceUrl)
  if (!response.ok) throw new Error(`Unable to download ${label}: ${response.status}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  const contentType = response.headers.get('content-type') ?? 'image/jpeg'
  return client.assets.upload('image', bytes, { filename: `${label}.${contentType.includes('png') ? 'png' : 'jpg'}`, contentType })
}

function markdownToBlocks(markdown) {
  const text = markdown.replace(/\r/g, '')
  const chunks = text.split(/\n\n+/).map((chunk) => chunk.trim()).filter(Boolean)
  return chunks.map((chunk) => {
    const cleaned = chunk.replace(/^#{1,3}\s+/, '').replace(/\[(.*?)\]\((.*?)\)/g, '$1').replace(/\*\*(.*?)\*\*/g, '$1')
    const style = /^#{1,3}\s+/.test(chunk) ? 'h2' : 'normal'
    return block(cleaned, style)
  })
}

async function main() {
  const assets = {}
  for (const [label, sourceUrl] of Object.entries(sources)) {
    process.stdout.write(`Uploading ${label}… `)
    assets[label] = await uploadImage(label, sourceUrl)
    console.log(assets[label]._id)
  }

  for (const category of categoryDefinitions) {
    await client.createOrReplace({
      _id: `category-${category.key}`,
      _type: 'category',
      title: category.title,
      slug: { _type: 'slug', current: category.key },
      filterKey: category.key,
      description: `${category.title} resources imported from the existing website catalog.`,
    })
  }

  await client.createOrReplace({
    _id: 'drafts.siteSettings',
    _type: 'siteSettings',
    siteTitle: 'Ring Society',
    helloBarText: 'Your trusted guide to the perfect Engagement ring',
  })

  for (const guide of guides) {
    const imageAsset = assets[guide.image]
    await client.createOrReplace({
      _id: `drafts.post-${guide.slug}`,
      _type: 'post',
      title: guide.title,
      slug: { _type: 'slug', current: guide.slug },
      excerpt: guide.excerpt,
      contentType: guide.category,
      isMostLoved: guide.filters.includes('most-loved'),
      heroImage: { _type: 'responsiveImage', mainImage: imageField(imageAsset._id), alt: guide.alt, focalPoint: 'center center' },
      ...(guide.bigFeature ? { bigFeatureImage: { _type: 'responsiveImage', mainImage: imageField(assets[guide.bigFeature]._id), alt: `${guide.title} Top Guides background`, focalPoint: 'center center' } } : {}),
      ...(guide.topGuidesBadge ? { topGuidesBadge: guide.topGuidesBadge } : {}),
      ...(guide.topGuidesTextTone ? { topGuidesTextTone: guide.topGuidesTextTone } : {}),
      categories: guide.filters.filter((filter) => filter !== 'most-loved').map((filter) => ({ _key: `category-${filter}`, _type: 'reference', _ref: `category-${filter}` })),
      keywordTags: [guide.category, ...guide.filters],
      intro: [block(guide.excerpt)],
      body: [block('Imported from the existing Ring Society website as an editable draft. Replace or complete this content before publishing.')],
    })
  }

  await client.createOrReplace({
    _id: 'drafts.post-the-definitive-engagement-ring-buying-guide-2026',
    _type: 'post',
    title: 'The Definitive Engagement Ring Buying Guide for 2026',
    slug: { _type: 'slug', current: 'the-definitive-engagement-ring-buying-guide-2026' },
    excerpt: 'An independent, step-by-step masterclass on settings, diamond metrics, and materials to help you make a pressure-free, completely confident choice.',
    contentType: 'Guide',
    isMostLoved: true,
    heroImage: { _type: 'responsiveImage', mainImage: imageField(assets.definitiveHero._id), alt: 'Woman wearing an engagement ring', focalPoint: 'center center' },
    categories: ['jeweler', 'perspectives'].map((filter) => ({ _key: `category-${filter}`, _type: 'reference', _ref: `category-${filter}` })),
    keywordTags: ['Engagement Rings', 'Diamonds', 'Lab-Grown', 'Settings', 'Solitaire', 'Halo', 'Oval Cut', 'Budget Guide', '4Cs', 'Wedding Bands', 'Gemstones', 'Ring Sizing'],
    intro: [
      block("Finding the right engagement ring doesn't have to be a complicated process. While the world of diamonds, settings, and metals can feel overwhelming at first, it really comes down to a few clear decisions that align with your style and your budget."),
      block("The following pages break down the essentials — from understanding how a setting affects daily wear to choosing a diamond shape that fits your partner's hand. This is the practical, behind-the-counter information that turns an overwhelming search into a confident collaboration."),
    ],
    body: [
      block('1. First, a Little Vocabulary', 'h2'),
      block("Before you start comparing rings, it helps to know what you're actually looking at. Jewelers use this language constantly, and understanding it turns the conversation into a collaboration instead of a guessing game."),
      { _type: 'image', _key: 'image-anatomy', asset: { _type: 'reference', _ref: assets.anatomy._id }, alt: 'Infographic labelling the band, setting, head and center stone of an engagement ring', caption: 'The four parts of every engagement ring. Learn these and the rest of the conversation gets easier.' },
      { _type: 'definitionList', _key: 'definitions-parts', items: [{ _key: 'band', term: 'The Band', definition: 'The circular piece of metal that wraps around the finger.' }, { _key: 'setting', term: 'The Setting', definition: 'The metal framework that holds the center stone in place.' }, { _key: 'head', term: 'The Head', definition: 'The part of the setting that grips the stone directly.' }, { _key: 'center-stone', term: 'The Center Stone', definition: 'The diamond or gemstone everything else exists to showcase.' }] },
      { _type: 'image', _key: 'image-settings', asset: { _type: 'reference', _ref: assets.settingsDiagram._id }, alt: 'Infographic comparing six common engagement ring setting styles side by side', caption: 'The six most common setting styles, side by side.' },
      block('2. Start Here — Style Before Stones', 'h2'),
      block("Almost every guide begins with the 4Cs of diamonds. We suggest a different starting point: figure out what kind of ring you're drawn to before you think about a single gemstone. Style shapes everything downstream."),
      { _type: 'callout', _key: 'callout-key-advice', label: 'Key advice', text: "Before you walk into any store or open any browser tab, spend some time with Pinterest, Instagram, or even friends' hands. Notice what catches your eye." },
    ],
  })

  const topGuideSlugs = ['how-to-choose-a-jeweler', 'engagement-ring-budgets', 'natural-vs-lab-grown-diamonds', 'how-to-buy-an-engagement-ring', 'engagement-ring-settings-and-styles', 'go-big-or-shop-small', 'what-drives-diamond-pricing', 'ultimate-guide-to-diamond-clarity']
  await client.createOrReplace({
    _id: 'drafts.topGuidesLanding',
    _type: 'topGuidesLanding',
    headline: 'Top Guides',
    introduction: 'Browse our most-loved guides, trending engagement rings, and perspectives from industry insiders',
    selectedPosts: topGuideSlugs.map((slug) => ({ _key: `top-guide-${slug}`, _type: 'reference', _ref: `drafts.post-${slug}` })),
  })

  const legalDocuments = [
    { slug: 'privacy-policy', title: 'Privacy Policy', file: 'src/content/legal/privacy-policy.md' },
    { slug: 'terms-and-conditions', title: 'Terms & Conditions', file: 'src/content/legal/terms-and-conditions.md' },
    { slug: 'accessibility', title: 'Accessibility Statement', file: 'src/content/legal/accessibility-statement.md' },
    { slug: 'do-not-sell', title: 'Your Privacy Choices', file: 'src/content/legal/privacy-choices.md' },
  ]

  for (const legal of legalDocuments) {
    const markdown = await readFile(new URL(`../${legal.file}`, import.meta.url), 'utf8')
    await client.createOrReplace({
      _id: `drafts.legal-${legal.slug}`,
      _type: 'legalPage',
      title: legal.title,
      slug: { _type: 'slug', current: legal.slug },
      body: markdownToBlocks(markdown),
    })
  }

  console.log(`Created ${guides.length + 1} editable guide drafts, ${categoryDefinitions.length} category drafts, and ${legalDocuments.length} legal-page drafts.`)
}

await main()
