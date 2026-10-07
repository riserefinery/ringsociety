import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Funnel schema — reusable objects.
 *
 * Every funnel document follows the same rule: editors own the words and the pictures, the
 * application owns the behaviour. Fields the app depends on are grouped into a collapsed
 * "LOCKED" fieldset and marked read-only, so they are visible for reference but cannot be
 * changed by accident.
 */

/** A field the application reads. Visible, documented, not editable. */
const lockedField = (
  name: string,
  title: string,
  description: string,
  type = 'string',
) =>
  defineField({
    name,
    title,
    type,
    readOnly: true,
    fieldset: 'locked',
    description,
  })

const lockedFieldset = {
  name: 'locked',
  title: 'LOCKED — set by the app, do not change',
  options: { collapsible: true, collapsed: true },
}

/** Standard alt-text-carrying image used across the funnel pages. */
export const funnelImage = defineType({
  name: 'funnelImage',
  title: 'Image',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      description:
        'Leave blank to keep the image currently shipped with the site — the preview above shows exactly what is live now. Uploading a new one replaces it.',
    }),
    defineField({
      name: 'alt',
      title: 'Alt Text',
      type: 'string',
      description:
        'Describe the image for screen readers and search engines. Required whenever an image is uploaded.',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { image?: unknown } | undefined
          if (parent?.image && !value) return 'Alt text is required when an image is set.'
          return true
        }),
    }),
  ],
  preview: {
    select: { title: 'alt', media: 'image' },
    prepare: ({ title, media }) => ({ title: title || 'Shipped image (no override)', media }),
  },
})

/**
 * One answer choice. `label` is editorial; `value` is the matching contract sent to n8n and
 * must never be edited, so it is locked.
 */
/**
 * The metals a visitor can choose. The values match the metal question's answer values exactly,
 * so an image can never be filed under a metal the quiz cannot produce.
 */
const METAL_CHOICES = [
  { title: 'Platinum or White Gold', value: 'platinum_or_white_gold' },
  { title: 'Yellow Gold', value: 'yellow_gold' },
  { title: 'Rose Gold', value: 'rose_gold' },
]

/** One metal-specific image for an answer choice. */
export const metalImage = defineType({
  name: 'metalImage',
  title: 'Metal Image',
  type: 'object',
  fields: [
    defineField({
      name: 'metal',
      title: 'Metal',
      type: 'string',
      options: { list: METAL_CHOICES, layout: 'radio' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      description: 'The same choice rendered in this metal. Keep the framing identical to the others.',
    }),
    defineField({
      name: 'alt',
      title: 'Alt Text',
      type: 'string',
      description: 'Describe the ring and the metal, e.g. "Solitaire engagement ring in rose gold".',
    }),
  ],
  preview: {
    select: { metal: 'metal', alt: 'alt', media: 'image' },
    prepare: ({ metal, alt, media }) => ({
      title: METAL_CHOICES.find((choice) => choice.value === metal)?.title ?? 'Metal not set',
      subtitle: alt,
      media,
    }),
  },
})

export const quizOption = defineType({
  name: 'quizOption',
  title: 'Answer Choice',
  type: 'object',
  fieldsets: [lockedFieldset],
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'The words shown on the choice card.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image Override',
      type: 'image',
      options: { hotspot: true },
      description:
        'Square, ideally 800×800 or larger. Shown in the answer grid for image questions such as shape and metal colour. Leave blank to keep the current image.',
    }),
    defineField({
      name: 'imageAlt',
      title: 'Image Alt Text',
      type: 'string',
      description: 'Required if an image override is uploaded.',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { image?: unknown } | undefined
          if (parent?.image && !value) return 'Alt text is required when an image is set.'
          return true
        }),
    }),
    defineField({
      name: 'imageByMetal',
      title: 'Images by Metal',
      type: 'array',
      of: [defineArrayMember({ type: 'metalImage' })],
      description:
        'The same choice in other metals. When a visitor has already picked a metal, their choice is shown instead of the image above. Any metal left out — or the whole list empty — falls back to the image above, so a partially filled list is safe.',
      validation: (Rule) =>
        Rule.custom((value) => {
          const list = (value ?? []) as Array<{ metal?: string }>
          const seen = new Set<string>()
          for (const entry of list) {
            if (!entry?.metal) continue
            if (seen.has(entry.metal)) return 'Each metal can only appear once.'
            seen.add(entry.metal)
          }
          return true
        }),
    }),
    lockedField(
      'value',
      'Answer Value',
      'The key this answer sends to the matching engine. Changing it would silently break results, so it is locked.',
    ),
  ],
  preview: {
    select: { title: 'label', subtitle: 'value', media: 'image' },
  },
})

/**
 * One question in a quiz. Each quiz owns its own copy of its questions — there is no shared
 * question library — so editing a question here affects only this funnel.
 */
export const quizStep = defineType({
  name: 'quizStep',
  title: 'Question',
  type: 'object',
  fieldsets: [lockedFieldset],
  fields: [
    defineField({
      name: 'internalName',
      title: 'Step Name',
      type: 'string',
      description:
        'For your reference only, e.g. "Metal colour". Never shown to visitors.',
    }),
    defineField({
      name: 'enabled',
      title: 'Show This Question',
      type: 'boolean',
      initialValue: true,
      description:
        'Turn off to hide this question from visitors without deleting it. Question numbering updates automatically.',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Subhead Above the Card — This Question Only',
      type: 'string',
      description:
        'Leave blank to use the funnel’s default subhead. Fill it in to show different wording above the card on this question only.',
    }),
    defineField({
      name: 'question',
      title: 'Question',
      type: 'text',
      rows: 2,
      description:
        'The headline. You can use {first_name} to insert the visitor\u2019s first name — leave the token exactly as written.',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { stepId?: string } | undefined
          const id = parent?.stepId
          if (!value) return true
          if ((id === 'q2' || id === 'q9') && !String(value).includes('{first_name}')) {
            return 'This step uses {first_name} in the live quiz. If you removed it on purpose, publish anyway — this is a warning only.'
          }
          return true
        }).warning(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Supporting Line',
      type: 'text',
      rows: 2,
      description: 'The smaller line under the question, e.g. "Choose up to 3".',
    }),
    defineField({
      name: 'placeholder',
      title: 'Input Placeholder',
      type: 'string',
      description: 'Shown inside text, zip, email, and phone fields.',
    }),
    defineField({
      name: 'note',
      title: 'Note Under the Field',
      type: 'text',
      rows: 3,
      description: 'Consent and disclaimer text shown beneath the field.',
    }),
    defineField({
      name: 'noteSecondary',
      title: 'Second Note',
      type: 'text',
      rows: 3,
      description: 'Rendered below the primary note when present.',
    }),
    defineField({
      name: 'footerLabel',
      title: 'Button Label',
      type: 'string',
      description: 'The primary button on this step, e.g. "See my matches".',
    }),
    defineField({
      name: 'requiredErrorMessage',
      title: 'Validation Message',
      type: 'string',
      description: 'Shown when a required field is submitted empty.',
    }),
    defineField({
      name: 'expandOptionsLabel',
      title: 'Expand Options Label',
      type: 'string',
      description: 'The control that reveals the remaining choices, when a step starts collapsed.',
    }),
    defineField({
      name: 'followsMetalChoice',
      title: 'Show Images in the Chosen Metal',
      type: 'boolean',
      initialValue: true,
      description:
        'When on, an answer choice that has images filed under "Images by Metal" shows the one matching the metal the visitor picked earlier. When off, every choice keeps its single main image. Has no effect on choices without metal images.',
    }),
    defineField({
      name: 'options',
      title: 'Answer Choices',
      type: 'array',
      of: [defineArrayMember({ type: 'quizOption' })],
      description: 'Drag to reorder. Labels and images are editable; values are locked.',
    }),
    lockedField(
      'stepId',
      'Step ID',
      'Identifies this step in the application and in the URL (?step=q3). The content you edit here is matched to the step by this ID.',
    ),
    lockedField(
      'stepType',
      'Input Type',
      'Controls which input renders: text, single choice, image choice, multi-select, zip, email, phone, or contact.',
    ),
    lockedField(
      'answerField',
      'Stored Answer',
      'The answer slot this question fills. The matching engine and results page read it.',
    ),
    lockedField(
      'questionCounter',
      'Counts Toward Progress',
      'Whether this step is numbered ("QUESTION 03/06"). Off for zip, email, and phone steps.',
      'boolean',
    ),
    lockedField(
      'selectionLimit',
      'Maximum Selections',
      'How many choices a visitor may pick on a multi-select question.',
      'number',
    ),
    lockedField(
      'optional',
      'Skippable',
      'Whether the visitor may continue without answering.',
      'boolean',
    ),
    lockedField(
      'branchRule',
      'Branch Rule',
      'Conditional display rule. This question only appears when the stated condition is met, which is why its position is constrained.',
    ),
    lockedField(
      'webhookTrigger',
      'Webhook Trigger',
      'Which delivery step fires after this question is answered. Part of the live lead pipeline.',
    ),
    lockedField(
      'flowRules',
      'Flow Rules',
      'Hide-when rules for deep links and out-of-territory visitors, and whether this step runs the zip territory check.',
    ),
    lockedField(
      'reorderLocked',
      'Ordering Constraint',
      'When set, this question must stay in its current position relative to the question named here. Everything else can be reordered freely.',
    ),
  ],
  preview: {
    select: { title: 'question', subtitle: 'stepId', enabled: 'enabled', locked: 'reorderLocked' },
    prepare: ({ title, subtitle, enabled, locked }) => ({
      title: title ? String(title).replace('{first_name}', '\u2026') : 'Untitled question',
      subtitle: [
        subtitle,
        enabled === false ? 'HIDDEN' : null,
        locked ? 'ORDER LOCKED' : null,
      ]
        .filter(Boolean)
        .join(' · '),
    }),
  },
})

/** Hero copy and imagery for a quiz landing screen. */
export const quizIntro = defineType({
  name: 'quizIntro',
  title: 'Landing Screen',
  type: 'object',
  fields: [
    defineField({
      name: 'heroTitle',
      title: 'Headline',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroTitleEmphasis',
      title: 'Headline — Italic Suffix',
      type: 'string',
      description: 'Appended to the headline in italics, e.g. "Top Local Jeweler".',
    }),
    defineField({
      name: 'mobileImageTitle',
      title: 'Mobile Image Overlay Title',
      type: 'string',
      description: 'Text shown over the hero image on mobile. Leave blank to reuse the headline.',
    }),
    defineField({
      name: 'heroEyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'The small line above the headline, e.g. "and get a special gift at the end".',
    }),
    defineField({
      name: 'body',
      title: 'Body Paragraphs',
      type: 'array',
      of: [defineArrayMember({ type: 'text', rows: 2 })],
      description:
        'Up to two paragraphs. The first carries the italic phrase set below; the second renders as an italic continuation.',
      validation: (Rule) => Rule.max(2).warning('Only the first two paragraphs render.'),
    }),
    defineField({
      name: 'bodyFirstEmphasis',
      title: 'Italic Phrase in First Paragraph',
      type: 'string',
      description: 'A phrase that must appear word-for-word inside the first paragraph, e.g. "Perfect Ring".',
    }),
    defineField({
      name: 'bodySecondItalic',
      title: 'Second Paragraph Joins the First',
      type: 'boolean',
      description:
        'When on, the second paragraph renders as an italic continuation of the first instead of starting a new one. Matches how Find a Jeweler reads today.',
      initialValue: false,
    }),
    defineField({
      name: 'bodyTail',
      title: 'Closing Paragraph',
      type: 'text',
      rows: 2,
      description: 'An extra paragraph after the body. Line breaks are preserved.',
    }),
    defineField({
      name: 'durationLabel',
      title: 'Duration Label (Mobile)',
      type: 'string',
      description: 'e.g. "60 second quiz".',
    }),
    defineField({
      name: 'desktopDurationLabel',
      title: 'Duration Label (Desktop)',
      type: 'string',
    }),
    defineField({
      name: 'closingLead',
      title: 'Closing Headline',
      type: 'string',
      description: 'e.g. "Ready to Find". Leave blank to hide the closing block.',
    }),
    defineField({
      name: 'closingEmphasis',
      title: 'Closing Headline — Italic Part',
      type: 'string',
      description: 'e.g. "The Perfect Ring?".',
    }),
    defineField({
      name: 'cta',
      title: 'Button Label',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'desktopCta',
      title: 'Button Label (Desktop Override)',
      type: 'string',
    }),
    defineField({
      name: 'heroSubhead',
      title: 'Hero Subhead',
      type: 'text',
      rows: 3,
      description:
        'A single serif line between the heading and the button. Filling this in switches the intro to the landing-page layout: eyebrow, heading, subhead, button, small print — and the Body paragraphs below are not shown.',
    }),
    defineField({
      name: 'heroDisclaimer',
      title: 'Small Print Under Button',
      type: 'text',
      rows: 4,
      description:
        'Shown directly below the button. Include the offer terms and eligibility note.',
    }),
    defineField({
      name: 'heroDisclaimerLink',
      title: 'Small Print — Linked Phrase',
      type: 'string',
      description:
        'An exact phrase from the small print above, e.g. "See full terms and eligibility." It renders underlined and opens the Diamond Card Terms. Leave blank for plain text.',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'funnelImage',
      description:
        'Portrait, ideally 1440×2048 (about 1:1.4). Find a Jeweler uses a wide landscape image instead. Leave blank to keep the current image.',
    }),
    defineField({
      name: 'mobileHeroImage',
      title: 'Mobile Hero Image',
      type: 'funnelImage',
      description:
        'Portrait or square, ideally 786×776. Only shown on phones. Leave blank to reuse the hero image.',
    }),
  ],
  preview: {
    select: { title: 'heroTitle', media: 'heroImage.image' },
  },
})

/** Static copy for a results page. Matched-jeweler data always comes from n8n, never from here. */
export const quizResults = defineType({
  name: 'quizResults',
  title: 'Results Page Copy',
  type: 'object',
  description:
    'Only the fixed wording on the results page lives here. Jeweler names, addresses, distances, availability, and ring recommendations are delivered live and are not editable.',
  fields: [
    defineField({ name: 'sectionLabel', title: 'Section Label', type: 'string', description: 'e.g. "What we do".' }),
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'greetingPrefix', title: 'Greeting Prefix', type: 'string', description: 'e.g. "Great News".' }),
        defineField({ name: 'ringStylesReady', title: 'Sub-headline', type: 'string' }),
        defineField({ name: 'title', title: 'Headline', type: 'string' }),
        defineField({ name: 'bodyLead', title: 'Body — Opening', type: 'text', rows: 3 }),
        defineField({ name: 'bodyRest', title: 'Body — Continuation', type: 'text', rows: 3 }),
        defineField({ name: 'scrollHint', title: 'Scroll Hint', type: 'string' }),
        defineField({ name: 'matchedWith', title: 'Matched-With Lead-in', type: 'string', description: 'Find a Jeweler only — e.g. "We\'ve matched you with".' }),
        defineField({ name: 'locationPrefix', title: 'Location Prefix', type: 'string', description: 'Find a Jeweler only — e.g. "in".' }),
        defineField({ name: 'subtitle', title: 'Subtitle', type: 'string', description: 'Find a Jeweler only.' }),
      ],
    }),
    defineField({
      name: 'heroOutOfTerritory',
      title: 'Hero — Out of Territory',
      type: 'object',
      description:
        'Shown when the zip check finds no certified jeweler nearby. This visitor sees no matched jeweler, so the wording differs.',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'title', title: 'Headline', type: 'string' }),
        defineField({ name: 'titleLineOne', title: 'Headline — Line 1', type: 'string' }),
        defineField({ name: 'titleLineTwoLead', title: 'Headline — Line 2 Opening', type: 'string' }),
        defineField({ name: 'titleAccent', title: 'Headline — Accent Word', type: 'string' }),
        defineField({ name: 'titleLineTwoRest', title: 'Headline — Line 2 Continuation', type: 'string' }),
        defineField({ name: 'bodyLead', title: 'Body — Opening', type: 'text', rows: 3 }),
        defineField({ name: 'bodyRest', title: 'Body — Continuation', type: 'text', rows: 3 }),
        defineField({ name: 'scrollHint', title: 'Scroll Hint', type: 'string' }),
      ],
    }),
    defineField({
      name: 'matches',
      title: 'Matches Section',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'titleLead', title: 'Title — Opening', type: 'string' }),
        defineField({ name: 'titleAccent', title: 'Title — Accent Word', type: 'string' }),
        defineField({
          name: 'uniqueTasteNote',
          title: 'Distinctive Taste Note',
          type: 'text',
          rows: 3,
          description: 'Use {jewelerName} where the store name should appear.',
        }),
        defineField({
          name: 'uniqueTasteFallbackJewelerName',
          title: 'Distinctive Taste Note — Fallback Name',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'designSection',
      title: 'Custom Ring Section',
      type: 'object',
      description: 'Used by the Design Your Ring results page.',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'ringName', title: 'Ring Name', type: 'string' }),
        defineField({ name: 'choicesLead', title: 'Choices Lead-in', type: 'text', rows: 2 }),
        defineField({
          name: 'choices',
          title: 'Design Choices',
          type: 'array',
          of: [defineArrayMember({ type: 'string' })],
        }),
        defineField({ name: 'ctaTitle', title: 'Closing Title', type: 'string' }),
        defineField({ name: 'ctaLead', title: 'Closing — Opening', type: 'text', rows: 2 }),
        defineField({ name: 'ctaLink', title: 'Closing — Linked Phrase', type: 'string' }),
        defineField({ name: 'ctaRest', title: 'Closing — Continuation', type: 'text', rows: 2 }),
        defineField({ name: 'ctaLabel', title: 'Closing Button Label', type: 'string' }),
      ],
    }),
    defineField({
      name: 'readyBanner',
      title: 'Closing Banner',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'bodyLead', title: 'Body — Opening', type: 'text', rows: 2 }),
        defineField({ name: 'bodyLink', title: 'Body — Linked Phrase', type: 'string' }),
        defineField({ name: 'bodyRest', title: 'Body — Continuation', type: 'text', rows: 2 }),
        defineField({ name: 'ctaLabel', title: 'Button Label', type: 'string' }),
      ],
    }),
  ],
  options: { collapsible: true, collapsed: false },
})

/** The Diamond Card phone step used by the two ring funnels. */
export const phoneCaptureCopy = defineType({
  name: 'phoneCaptureCopy',
  title: 'Diamond Card Step',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrowFallback', title: 'Eyebrow', type: 'string' }),
    defineField({ name: 'eyebrowPrefix', title: 'Eyebrow (Desktop)', type: 'string' }),
    defineField({ name: 'title', title: 'Headline', type: 'string' }),
    defineField({ name: 'claimLine', title: 'Claim Line', type: 'text', rows: 2 }),
    defineField({ name: 'validityLine', title: 'Validity Line', type: 'string' }),
    defineField({ name: 'formTitle', title: 'Form Title', type: 'string' }),
    defineField({ name: 'formSubtitle', title: 'Form Subtitle', type: 'text', rows: 2 }),
    defineField({ name: 'subtitleEmphasis', title: 'Form Subtitle — Italic Phrase', type: 'string' }),
    defineField({ name: 'subtitleTail', title: 'Form Subtitle — Continuation', type: 'text', rows: 2 }),
    defineField({ name: 'note', title: 'Consent Note', type: 'text', rows: 4 }),
    defineField({ name: 'ctaLabel', title: 'Primary Button Label', type: 'string' }),
    defineField({ name: 'declineLabel', title: 'Decline Label', type: 'string' }),
    defineField({ name: 'heroBackground', title: 'Hero Background', type: 'funnelImage' }),
    defineField({ name: 'heroBackgroundDesktop', title: 'Hero Background (Desktop)', type: 'funnelImage' }),
  ],
  options: { collapsible: true, collapsed: true },
})

/** A titled list of steps or rows, used by the Diamond Card terms accordion. */
export const funnelListSection = defineType({
  name: 'funnelListSection',
  title: 'List Section',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Section Title', type: 'string' }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        defineArrayMember({ type: 'funnelListItem' }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', items: 'items' },
    prepare: ({ title, items }) => ({
      title: title || 'List Section',
      subtitle: Array.isArray(items) ? `${items.length} item${items.length === 1 ? '' : 's'}` : undefined,
    }),
  },
})

/** A single line of copy with an optional emphasised phrase. */
export const funnelListItem = defineType({
  name: 'funnelListItem',
  title: 'List Item',
  type: 'object',
  fields: [
    defineField({ name: 'text', title: 'Text', type: 'text', rows: 2, validation: (Rule) => Rule.required() }),
    defineField({
      name: 'boldPhrase',
      title: 'Bold Phrase',
      type: 'string',
      description: 'Optional phrase inside the text to render bold. Must match the text word-for-word.',
    }),
  ],
  preview: { select: { title: 'text', subtitle: 'boldPhrase' } },
})
