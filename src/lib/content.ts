import type { Card } from '../components/GuideCard'
import {
  IMAGES,
  GUIDE_FEATURES,
  heroMobileImg,
  articleHero,
  articleAnatomy,
  articleSettings,
  ctaLabGrown,
} from './assets'
import type { CmsResponsiveImage } from '../sanity/types'

/**
 * Central blog model. Every guide/article lives here once, so the same
 * record feeds the desktop cards, the mobile cards, and the blog header.
 *
 *  - `feature`      → the article's feature image. Used everywhere the article
 *                     is referenced compactly: cards (desktop + mobile) and the
 *                     blog post header. One image, reused.
 *  - `guideFeature` → the wide "guide feature" art shown on pillar guides
 *                     (e.g. the Top Guides page). Only pillar guides have one;
 *                     when absent we fall back to `feature`.
 */
export type Guide = {
  slug: string
  category: string
  badge?: 'Featured' | 'most loved'
  title: string
  excerpt: string
  cardCta: string
  feature: string
  guideFeature?: string
  /** Text tone over the guide-feature art: 'light' = white text, 'dark' = black text. */
  tone: 'light' | 'dark'
  imagePosition?: string
}

/** Pillar guides, in the order they appear on the Top Guides page. */
export const pillarGuides: Guide[] = [
  {
    slug: 'how-to-choose-a-jeweler',
    category: 'Guide',
    badge: 'Featured',
    title: 'How to Choose A Jeweler: Our 10-Point Framework',
    excerpt:
      "Before you walk into any jeweler, there are 10 things you should be evaluating — from how long they’ve been in business and the quality of their customer reviews, to how they handle pricing, post-purchase support, and more.",
    cardCta: 'view the guide',
    feature: IMAGES.jeweler,
    guideFeature: GUIDE_FEATURES.jeweler,
    tone: 'light',
    imagePosition: 'center',
  },
  {
    slug: 'engagement-ring-budgets',
    category: 'Guide',
    title: 'Engagement Ring Budgets: How Much Should You Spend?',
    excerpt:
      "How much should you actually spend on an engagement ring? We break down real budget ranges, what drives the price, and how to get the most sparkle for what you’re comfortable spending.",
    cardCta: 'view the guide',
    feature: IMAGES.budgets,
    guideFeature: GUIDE_FEATURES.budgets,
    tone: 'light',
    imagePosition: '50% 30%',
  },
  {
    slug: 'natural-vs-lab-grown-diamonds',
    category: 'Guide',
    title: 'Natural vs. Lab-Grown Diamonds: The Honest, Unbiased Comparison',
    excerpt:
      'A transparent guide tackling the biggest question being asked right now. It compares price, chemical makeup, long-term value retention, and ethical considerations.',
    cardCta: 'view the guide',
    feature: IMAGES.labGrown,
    guideFeature: GUIDE_FEATURES.labGrown,
    tone: 'dark',
    imagePosition: 'center',
  },
  {
    slug: 'how-to-buy-an-engagement-ring',
    category: 'Guide',
    badge: 'most loved',
    title: 'How to Buy an Engagement Ring',
    excerpt:
      "Shopping for an engagement ring should be one of life’s biggest moments… but often couples find it intimidating and stressful. We’ll show you everything, from styles to budgeting, to jewelers.",
    cardCta: 'view the guide',
    feature: heroMobileImg,
    tone: 'light',
    imagePosition: '70% center',
  },
  {
    slug: 'engagement-ring-settings-and-styles',
    category: 'Guide',
    title: 'The Complete Guide to Engagement Ring Settings & Styles',
    excerpt:
      'A visual guide detailing every major ring setting (Solitaire, Halo, Pavé, Bezel, Channel, Three-Stone). It covers the pros and cons of each, how different settings impact the perceived size of the center stone, and which styles suit more active lifestyles.',
    cardCta: 'view the guide',
    feature: IMAGES.settings,
    guideFeature: GUIDE_FEATURES.settings,
    tone: 'light',
    imagePosition: 'center',
  },
  {
    slug: 'go-big-or-shop-small',
    category: 'Guide',
    title: 'Go Big or Shop Small? Big-Box vs. Local vs. Online',
    excerpt:
      "Before a single conversation about stones or settings, there’s a bigger decision hiding underneath all of it: where you buy the ring. National chains, online-only retailers, and independent local jewelers each operate genuinely differently, and the differences matter more than most buyers expect going in.",
    cardCta: 'view the guide',
    feature: IMAGES.emerald,
    guideFeature: GUIDE_FEATURES.bigBox,
    tone: 'light',
    imagePosition: 'center',
  },
  {
    slug: 'what-drives-diamond-pricing',
    category: 'Guide',
    title: 'What Drives Diamond Pricing? Hear from Experts',
    excerpt:
      "What actually determines the price of a diamond? Industry insiders explain how the 4Cs, certification, and market forces come together — so you know exactly what you’re paying for.",
    cardCta: 'view the guide',
    feature: IMAGES.pricing,
    guideFeature: GUIDE_FEATURES.pricing,
    tone: 'light',
    imagePosition: 'center',
  },
  {
    slug: 'ultimate-guide-to-diamond-clarity',
    category: 'Guide',
    title: 'The Ultimate Guide to Diamond Clarity, and What it Means for Your Ring Choice & Budget',
    excerpt:
      "Clarity is one of the most misunderstood of the 4Cs. Learn what the grades really mean, which inclusions you’ll never see anyway, and where to spend versus save for your ring.",
    cardCta: 'view the guide',
    feature: IMAGES.clarity,
    guideFeature: GUIDE_FEATURES.clarity,
    tone: 'light',
    imagePosition: 'center',
  },
]

/* ---------------------------------------------------------------
   All Resources — the blog landing model.

   Every card anywhere on the site pulls its image from the article
   it references (standard blog setup), so the whole catalogue lives
   here once as `Card` records. Each article is tagged with the
   filter chips it belongs to; "View All" shows everything.
----------------------------------------------------------------*/
export const FILTERS = [
  { key: 'all', label: 'View All' },
  { key: 'most-loved', label: 'Most-Loved Guides' },
  { key: 'jeweler', label: 'Finding a Jeweler' },
  { key: 'trends', label: 'Trends' },
  { key: 'perspectives', label: 'Perspectives' },
  { key: 'diamonds', label: 'Diamonds' },
] as const

export type FilterKey = Exclude<(typeof FILTERS)[number]['key'], 'all'>

/** Map a human category label (e.g. "Perspectives") to the All Resources filter it belongs to. */
export function filterKeyForCategory(label: string): FilterKey | undefined {
  const match = FILTERS.find((f) => f.key !== 'all' && f.label.toLowerCase().includes(label.toLowerCase()))
  return match?.key as FilterKey | undefined
}

export type Article = Card & { filters: FilterKey[] }

const cmsSlugByTitle: Record<string, string> = {
  'How to Buy an Engagement Ring': 'how-to-buy-an-engagement-ring',
  'How to Choose A Jeweler: Our 10-Point Framework': 'how-to-choose-a-jeweler',
  'The Most Popular & Trending Ring Styles and Diamonds in 2026': 'most-popular-trending-ring-styles-2026',
  'Engagement Rings with Hidden Halos: The Subtle Sparkle Trend': 'engagement-rings-with-hidden-halos',
  'Engagement Ring Budgets: How Much Should You Spend?': 'engagement-ring-budgets',
  'The Complete Guide to Engagement Ring Settings & Styles': 'engagement-ring-settings-and-styles',
  'How to Find Her Ring Size Without Ruining the Surprise': 'how-to-find-her-ring-size',
  'Which Diamond Shape Looks the Biggest?': 'which-diamond-shape-looks-biggest',
  'The 4Cs of Diamonds (Explained in Plain English)': '4cs-of-diamonds',
  'Go Big or Shop Small? Big-Box vs. Local vs. Online': 'go-big-or-shop-small',
  'Natural vs. Lab-Grown Diamonds: The Honest, Unbiased Comparison': 'natural-vs-lab-grown-diamonds',
  'What Drives Diamond Pricing? Hear from Experts': 'what-drives-diamond-pricing',
  'The Ultimate Guide to Diamond Clarity, and What it Means for Your Ring Choice & Budget': 'ultimate-guide-to-diamond-clarity',
  'The Ideal Diamond Cut: How to Choose the Right Diamond for Your Ring Setting and Budget': 'ideal-diamond-cut',
}

export function articleSlugForTitle(title: string): string {
  return cmsSlugByTitle[title] ?? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function articlePathForTitle(title: string): string {
  return `/guides/${articleSlugForTitle(title)}`
}

export const allArticles: Article[] = [
  {
    category: 'Guide',
    title: 'How to Buy an Engagement Ring',
    cta: 'view the guide',
    image: heroMobileImg,
    alt: 'A woman resting her hand against her face, an engagement ring catching the light',
    filters: ['most-loved'],
  },
  {
    category: 'Guide',
    title: 'How to Choose A Jeweler: Our 10-Point Framework',
    cta: 'view the guide',
    image: IMAGES.jeweler,
    alt: 'A jeweler holding a diamond engagement ring',
    filters: ['most-loved', 'jeweler'],
  },
  {
    category: 'Trends',
    title: 'The Most Popular & Trending Ring Styles and Diamonds in 2026',
    cta: 'trending diamond rings',
    image: IMAGES.trending,
    alt: 'A brilliant-cut diamond ring resting on textured fabric',
    filters: ['trends'],
  },
  {
    category: 'Perspectives',
    title: 'Engagement Rings with Hidden Halos: The Subtle Sparkle Trend',
    cta: 'hidden halo engagement rings',
    image: IMAGES.halo,
    alt: 'A diamond solitaire ring on deep blue velvet',
    filters: ['perspectives', 'trends'],
  },
  {
    category: 'Guide',
    title: 'Engagement Ring Budgets: How Much Should You Spend?',
    cta: 'view the guide',
    image: IMAGES.budgets,
    alt: 'An engagement ring displayed in a presentation box',
    filters: ['most-loved'],
  },
  {
    category: 'Guide',
    title: 'The Complete Guide to Engagement Ring Settings & Styles',
    cta: 'view the guide',
    image: IMAGES.settings,
    alt: 'An assortment of rings on a dark surface',
    filters: ['most-loved'],
  },
  {
    category: 'Article',
    title: 'How to Find Her Ring Size Without Ruining the Surprise',
    cta: 'ring sizing guide',
    image: IMAGES.ringSize,
    alt: 'A couple holding hands',
    filters: ['jeweler'],
  },
  {
    category: 'Article',
    title: 'Which Diamond Shape Looks the Biggest?',
    cta: 'compare diamond shapes',
    image: IMAGES.shape,
    alt: 'A diamond ring photographed on fabric',
    filters: ['diamonds'],
  },
  {
    category: 'Guide',
    title: 'The 4Cs of Diamonds (Explained in Plain English)',
    cta: 'view the guide',
    image: IMAGES.fourCs,
    alt: 'A woman with her hand resting near her face',
    filters: ['most-loved', 'diamonds'],
  },
  {
    category: 'Guide',
    title: 'Go Big or Shop Small? Big-Box vs. Local vs. Online',
    cta: 'view the guide',
    image: IMAGES.emerald,
    alt: 'A gold ring set with an emerald-green stone',
    filters: ['jeweler', 'perspectives'],
  },
  {
    category: 'Guide',
    title: 'Natural vs. Lab-Grown Diamonds: The Honest, Unbiased Comparison',
    cta: 'view the guide',
    image: IMAGES.labGrown,
    alt: 'Loose diamonds scattered across a surface',
    dark: true,
    filters: ['most-loved', 'diamonds'],
  },
  {
    category: 'Guide',
    title: 'What Drives Diamond Pricing? Hear from Experts',
    cta: 'diamond pricing guide',
    image: IMAGES.pricing,
    alt: 'A jeweler working at a bench',
    filters: ['diamonds', 'perspectives'],
  },
  {
    category: 'Guide',
    title: 'The Ultimate Guide to Diamond Clarity, and What it Means for Your Ring Choice & Budget',
    cta: 'view the guide',
    image: IMAGES.clarity,
    alt: 'A gold ring with a green gemstone on a table',
    filters: ['diamonds'],
  },
  {
    category: 'Article',
    title: 'The Ideal Diamond Cut: How to Choose the Right Diamond for Your Ring Setting and Budget',
    cta: 'how to choose a diamond',
    image: IMAGES.idealCut,
    alt: 'A silver ring worn on a finger',
    dark: true,
    filters: ['diamonds'],
  },
]

/**
 * Keeps the full resource grid navigable while articles are published one at a
 * time. Published CMS cards override their matching local card; not-yet-published
 * records retain the established design fallback and route.
 */
export function mergePublishedArticleCards(cmsArticles: Article[]): Article[] {
  const cmsByPath = new Map(cmsArticles.filter((card) => card.to).map((card) => [card.to as string, card]))
  const merged = allArticles.map((fallback) => {
    const path = articlePathForTitle(fallback.title)
    const cms = cmsByPath.get(path)
    return {
      ...fallback,
      ...cms,
      to: path,
      filters: cms?.filters?.length ? cms.filters : fallback.filters,
    }
  })

  const knownPaths = new Set(merged.map((card) => card.to))
  return [...merged, ...cmsArticles.filter((card) => card.to && !knownPaths.has(card.to))]
}

/* ---------------------------------------------------------------
   Article template — the master content model for every guide &
   article on the site. An article is authored purely as data:
   ordered `body` blocks that the <ArticleTemplate> renders. H2
   blocks auto-populate the sticky table of contents, and every
   `image` block joins the in-article zoom gallery.
----------------------------------------------------------------*/
export type ArticleBlock =
  | { type: 'p'; text: string; muted?: boolean }
  | { type: 'h2'; text: string; toc: string }
  | { type: 'image'; src: string; alt: string; caption?: string; note?: string }
  | { type: 'deflist'; items: { term: string; def: string }[] }
  | { type: 'note'; label: string; text: string }

/**
 * A sidebar CTA card. A site-wide default lives below; any article can
 * override the whole card — including a custom `background` color and its
 * own `image`.
 */
export type ArticleCta = {
  title: string
  label: string
  image: string
  /** Card background color. Defaults to black. */
  background?: string
  to?: string
}

export const defaultArticleCta: ArticleCta = {
  title: 'Lab Grown vs Natural Diamonds',
  label: 'view the guide',
  image: ctaLabGrown,
  background: '#000000',
  to: '/guides/natural-vs-lab-grown-diamonds',
}

export type ArticleDoc = {
  slug: string
  category: string
  badge?: 'Featured' | 'most loved'
  title: string
  subtitle: string
  readTime: string
  hero: string
  heroImage?: CmsResponsiveImage
  categories: string[]
  keywordTags: string[]
  cta?: ArticleCta
  intro: ArticleBlock[]
  body: ArticleBlock[]
  /** "Explore More" cards. Omit to default to the most recent articles. */
  related?: Card[]
}

const definitiveGuide: ArticleDoc = {
  slug: 'the-definitive-engagement-ring-buying-guide-2026',
  category: 'Guide',
  badge: 'most loved',
  title: 'The Definitive Engagement Ring Buying Guide for 2026',
  subtitle:
    'An independent, step-by-step masterclass on settings, diamond metrics, and materials to help you make a pressure-free, completely confident choice.',
  readTime: '4 minute read',
  hero: articleHero,
  categories: ['Guides', 'Perspectives', 'Finding a Jeweler'],
  keywordTags: [
    'Engagement Rings',
    'Diamonds',
    'Lab-Grown',
    'Settings',
    'Solitaire',
    'Halo',
    'Oval Cut',
    'Budget Guide',
    '4Cs',
    'Wedding Bands',
    'Gemstones',
    'Ring Sizing',
  ],
  intro: [
    {
      type: 'p',
      text: "Finding the right engagement ring doesn't have to be a complicated process. While the world of diamonds, settings, and metals can feel overwhelming at first, it really comes down to a few clear decisions that align with your style and your budget.",
    },
    {
      type: 'p',
      text: "The following pages break down the essentials — from understanding how a setting affects daily wear to choosing a diamond shape that fits your partner's hand. This is the practical, behind-the-counter information that turns an overwhelming search into a confident collaboration.",
    },
  ],
  body: [
    { type: 'h2', text: '1. First, a Little Vocabulary', toc: 'First, a Little Vocabulary' },
    {
      type: 'p',
      text: "Before you start comparing rings, it helps to know what you're actually looking at. Jewelers use this language constantly, and understanding it turns the conversation into a collaboration instead of a guessing game.",
    },
    {
      type: 'image',
      src: articleAnatomy,
      alt: 'Infographic labelling the band, setting, head and center stone of an engagement ring',
      caption:
        'The four parts of every engagement ring. Learn these and the rest of the conversation gets easier.',
    },
    {
      type: 'deflist',
      items: [
        { term: 'The Band', def: 'The circular piece of metal that wraps around the finger.' },
        { term: 'The Setting', def: 'The metal framework that holds the center stone in place.' },
        { term: 'The Head', def: 'The part of the setting that grips the stone directly.' },
        {
          term: 'The Center Stone',
          def: 'The diamond or gemstone everything else exists to showcase.',
        },
      ],
    },
    { type: 'p', text: 'Setting styles to illustrate: Prong, Bezel, Halo, Cathedral, Pavé' },
    {
      type: 'image',
      src: articleSettings,
      alt: 'Infographic comparing six common engagement ring setting styles side by side',
      caption: 'The six most common setting styles, side by side.',
    },
    {
      type: 'deflist',
      items: [
        {
          term: 'The Center Stone',
          def: 'The diamond or gemstone everything else exists to showcase.',
        },
      ],
    },
    { type: 'h2', text: '2. Start Here — Style Before Stones', toc: 'Start Here: Style Before Stones' },
    {
      type: 'p',
      text: "Almost every guide begins with the 4Cs of diamonds. We suggest a different starting point: figure out what kind of ring you're drawn to before you think about a single gemstone. Style shapes everything downstream. A person who gravitates toward clean, architectural lines has different needs than someone who loves intricate, romantic detail.",
    },
    {
      type: 'note',
      label: 'Key advice',
      text: "Before you walk into any store or open any browser tab, spend some time with Pinterest, Instagram, or even friends' hands. Notice what catches your eye.",
    },
    {
      type: 'p',
      text: 'Important note: Inspiration only tells part of the story. A setting that looks perfect in a saved photo can read completely differently in person.',
    },
  ],
}

export const articleDocs: ArticleDoc[] = [definitiveGuide]

function categoryLabels(filters: FilterKey[]): string[] {
  const labels = filters.map((filter) => FILTERS.find((item) => item.key === filter)?.label).filter(Boolean) as string[]
  return labels.length ? labels : ['Guides']
}

function temporaryArticleFor(slug: string): ArticleDoc | null {
  const fallback = allArticles.find((article) => articleSlugForTitle(article.title) === slug)
  if (!fallback) return null

  const guide = pillarGuides.find((item) => item.slug === slug)
  return {
    slug,
    category: fallback.category,
    badge: guide?.badge,
    title: fallback.title,
    subtitle: guide?.excerpt ?? `This is the working article page for ${fallback.title}.`,
    readTime: '',
    hero: fallback.image,
    categories: categoryLabels(fallback.filters),
    keywordTags: [fallback.category, ...fallback.filters],
    intro: [
      {
        type: 'p',
        text: 'This connected article preview is in place so the complete Ring Society experience can be reviewed before final editorial copy is published from Sanity.',
      },
    ],
    body: [
      { type: 'h2', text: 'Article Preview', toc: 'Article Preview' },
      {
        type: 'p',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. This temporary text shows the final article template, reading flow, navigation, and related-content behavior without representing approved Ring Society editorial copy.',
      },
      { type: 'h2', text: 'Editorial Draft Area', toc: 'Editorial Draft Area' },
      {
        type: 'p',
        text: 'Replace this placeholder body in Sanity when the approved article is ready. Once published, the CMS record automatically replaces this local preview while retaining the same route and page design.',
      },
    ],
  }
}

export function getArticle(slug?: string): ArticleDoc {
  return articleDocs.find((article) => article.slug === slug) ?? temporaryArticleFor(slug ?? '') ?? definitiveGuide
}

/**
 * Estimated reading time, auto-calculated from the article's actual text
 * (subtitle + intro + body) at ~225 words per minute, rounded up.
 */
export function readingTimeFor(doc: ArticleDoc): string {
  const textOf = (b: ArticleBlock): string => {
    switch (b.type) {
      case 'p':
      case 'h2':
        return b.text
      case 'image':
        return `${b.caption ?? ''} ${b.note ?? ''}`
      case 'note':
        return `${b.label} ${b.text}`
      case 'deflist':
        return b.items.map((it) => `${it.term} ${it.def}`).join(' ')
    }
  }
  const words = [doc.subtitle, ...doc.intro.map(textOf), ...doc.body.map(textOf)]
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
  return `${Math.max(1, Math.ceil(words / 225))} minute read`
}

/**
 * "Explore More" cards for an article: its own `related` list when set,
 * otherwise the most recent articles from the catalogue (top of
 * `allArticles`), skipping the one being read.
 */
export function getRelated(doc: ArticleDoc): Card[] {
  if (doc.related) return doc.related
  return allArticles.filter((a) => a.title !== doc.title).slice(0, 3)
}
