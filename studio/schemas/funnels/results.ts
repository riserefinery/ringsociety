import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Shared results blocks.
 *
 * These five blocks are shown by more than one results page — the Jeweler section and the
 * Diamond Card appear on all four. They are deliberately **plain singletons** rather than
 * blocks each funnel points at, so the wording exists in exactly one place and cannot drift
 * between funnels, and so no funnel can end up rendering nothing because a reference dangles.
 *
 * Only fixed wording lives here. Jeweler names, addresses, hours, photos, distances, and
 * availability are delivered live by the match and are never editable.
 */
const lockedFieldset = {
  name: 'locked',
  title: 'LOCKED — set by the app, do not change',
  options: { collapsible: true, collapsed: true },
}

const lockedField = (name: string, title: string, description: string, type = 'string') =>
  defineField({ name, title, type, readOnly: true, fieldset: 'locked', description })

/** Shown on every results page, above the matched jeweler's live details. */
export const sharedJewelerSection = defineType({
  name: 'sharedJewelerSection',
  title: 'Shared — Jeweler Section',
  type: 'document',
  fieldsets: [lockedFieldset],
  fields: [
    lockedField('routeKey', 'Route Key', 'Read by every results page.'),
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
    defineField({ name: 'meetLabel', title: 'Meet Label', type: 'string' }),
    defineField({ name: 'stickyCtaLabel', title: 'Sticky Button Label', type: 'string' }),
    defineField({ name: 'reasonsTitle', title: 'Reasons Title', type: 'string' }),
    defineField({
      name: 'reasons',
      title: 'Reasons',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'The list of reasons we recommend this jeweler. Shown in two columns on desktop.',
    }),
    defineField({ name: 'locationTitle', title: 'Location Title', type: 'string' }),
    defineField({ name: 'closingTagline', title: 'Closing Tagline', type: 'string' }),
    defineField({
      name: 'activationReminder',
      title: 'Card Activation Reminder',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: { prepare: () => ({ title: 'Shared — Jeweler Section' }) },
})

/** The Diamond Card offer and its terms. Shown on all four results pages. */
export const sharedDiamondCard = defineType({
  name: 'sharedDiamondCard',
  title: 'Shared — Diamond Card',
  type: 'document',
  fieldsets: [lockedFieldset],
  fields: [
    lockedField('routeKey', 'Route Key', 'Read by every results page.'),
    defineField({ name: 'titleLead', title: 'Title', type: 'string' }),
    defineField({
      name: 'titleNoJeweler',
      title: 'Title — No Jeweler Variant',
      type: 'string',
      description: 'Used when the visitor has no matched jeweler.',
    }),
    defineField({ name: 'ctaLabel', title: 'Button Label', type: 'string' }),
    defineField({
      name: 'accordion',
      title: 'Terms Accordion',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'title', title: 'Accordion Title', type: 'string' }),
        defineField({ name: 'introTitle', title: 'How to Redeem — Title', type: 'string' }),
        defineField({
          name: 'introItems',
          title: 'How to Redeem — Steps',
          type: 'array',
          of: [defineArrayMember({ type: 'funnelListItem' })],
        }),
        defineField({ name: 'savingsTitle', title: 'Savings Scale — Title', type: 'string' }),
        defineField({
          name: 'savingsTiers',
          title: 'Savings Scale — Rows',
          type: 'array',
          of: [defineArrayMember({ type: 'string' })],
          description: 'e.g. "$500 off rings $5,000+".',
        }),
        defineField({ name: 'summaryLead', title: 'Summary Line', type: 'string' }),
        defineField({ name: 'whyTitle', title: '"Why So Generous" Title', type: 'string' }),
        defineField({
          name: 'whyBody',
          title: '"Why So Generous" Body',
          type: 'text',
          rows: 4,
          description: 'Use {jewelerName} where the store name should appear.',
        }),
        defineField({ name: 'finePrintTitle', title: 'Fine Print — Title', type: 'string' }),
        defineField({ name: 'finePrint', title: 'Fine Print', type: 'text', rows: 5 }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Shared — Diamond Card' }) },
})


/** The footer on every funnel page. */
export const sharedFooter = defineType({
  name: 'sharedFooter',
  title: 'Shared — Footer',
  type: 'document',
  fieldsets: [lockedFieldset],
  fields: [
    lockedField('routeKey', 'Route Key', 'Read by every funnel page.'),
    defineField({ name: 'tagline', title: 'Tagline', type: 'string' }),
    defineField({ name: 'privacyLabel', title: 'Privacy Label', type: 'string' }),
    defineField({ name: 'termsLabel', title: 'Terms Label', type: 'string' }),
    defineField({ name: 'accessibilityLabel', title: 'Accessibility Label', type: 'string' }),
    defineField({ name: 'privacyChoicesLabel', title: 'Privacy Choices Label', type: 'string' }),
    defineField({
      name: 'copyright',
      title: 'Copyright',
      type: 'string',
      description: 'Use {year} to insert the current year automatically.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Shared — Footer' }) },
})

/**
 * Everything a visitor sees when no certified jeweler matches their area. Shown by three of the
 * four results pages, so it lives here rather than inside any one funnel.
 */
export const sharedOutOfTerritory = defineType({
  name: 'sharedOutOfTerritory',
  title: 'Shared — Out of Territory',
  type: 'document',
  fieldsets: [lockedFieldset],
  fields: [
    lockedField('routeKey', 'Route Key', 'Read by the out-of-territory screens.'),
    defineField({
      name: 'guide',
      title: 'Guide Section',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'eyebrowDesktop', title: 'Eyebrow (Desktop)', type: 'string' }),
        defineField({ name: 'eyebrowMobileLead', title: 'Eyebrow (Mobile)', type: 'string' }),
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'subtitle', title: 'Subtitle', type: 'text', rows: 2 }),
        defineField({ name: 'ctaLabel', title: 'Button Label', type: 'string' }),
        defineField({ name: 'tabletImageAlt', title: 'Tablet Image Alt Text', type: 'string' }),
      ],
    }),
    defineField({
      name: 'guidePitch',
      title: 'Guide Pitch Section',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'titleLead', title: 'Title — Opening', type: 'string' }),
        defineField({ name: 'titleAccent', title: 'Title — Accent Phrase', type: 'string' }),
        defineField({ name: 'body', title: 'Body', type: 'text', rows: 5 }),
        defineField({ name: 'ctaLabel', title: 'Button Label', type: 'string' }),
      ],
    }),
    defineField({
      name: 'localJewelers',
      title: 'Local Jewelers Section',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'body', title: 'Body', type: 'text', rows: 4 }),
        defineField({ name: 'zipPrefix', title: 'Zip Prefix', type: 'string' }),
        defineField({ name: 'zipHint', title: 'Zip Hint', type: 'string' }),
      ],
    }),
    defineField({
      name: 'localJewelersHero',
      title: 'Local Jewelers Hero (Find a Jeweler only)',
      type: 'object',
      description:
        'Find a Jeweler has no matched jeweler out of territory, so its hero cannot render — this section opens the page instead.',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'body', title: 'Body', type: 'text', rows: 4 }),
      ],
    }),
    defineField({
      name: 'jewelerResults',
      title: 'Nearby Jeweler Results',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'radiusLabel', title: 'Radius Label', type: 'string' }),
        defineField({
          name: 'radiusValue',
          title: 'Radius Value Template',
          type: 'string',
          description: 'Use {radius}.',
        }),
        defineField({ name: 'radiusScaleMin', title: 'Radius Scale — Minimum', type: 'string' }),
        defineField({ name: 'radiusScaleMax', title: 'Radius Scale — Maximum', type: 'string' }),
        defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'subtext', title: 'Subtext', type: 'text', rows: 3 }),
        defineField({
          name: 'optionSingular',
          title: 'Option — Singular',
          type: 'string',
          description: 'Used with {options} in the subtext.',
        }),
        defineField({ name: 'optionPlural', title: 'Option — Plural', type: 'string' }),
        defineField({ name: 'searching', title: 'Searching Message', type: 'string' }),
        defineField({ name: 'emptySubtext', title: 'Empty — Subtext', type: 'string' }),
        defineField({ name: 'emptyState', title: 'Empty — Message', type: 'string' }),
        defineField({ name: 'noJewelersSubtext', title: 'No Jewelers — Message', type: 'string' }),
        defineField({ name: 'disclaimerLead', title: 'Disclaimer — Lead', type: 'string' }),
        defineField({ name: 'disclaimerBody', title: 'Disclaimer — Body', type: 'text', rows: 4 }),
        defineField({
          name: 'distance',
          title: 'Distance Template',
          type: 'string',
          description: 'Use {distance}.',
        }),
        defineField({ name: 'directionsLabel', title: 'Directions Link Label', type: 'string' }),
        defineField({ name: 'websiteLabel', title: 'Website Link Label', type: 'string' }),
        defineField({ name: 'openNowSignal', title: 'Open Now Signal', type: 'string' }),
        defineField({ name: 'closedNowSignal', title: 'Closed Now Signal', type: 'string' }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Shared — Out of Territory' }) },
})

export const sharedResultsDocumentTypes = [
  sharedJewelerSection,
  sharedDiamondCard,
  sharedFooter,
  sharedOutOfTerritory,
]
