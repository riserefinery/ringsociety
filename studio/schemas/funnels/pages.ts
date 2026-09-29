import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * The non-quiz funnel pages. Each is a singleton bound to its route by a locked route key, so
 * editors always know which live page a document controls.
 */

const lockedFieldset = {
  name: 'locked',
  title: 'LOCKED — set by the app, do not change',
  options: { collapsible: true, collapsed: true },
}

const lockedField = (name: string, title: string, description: string, type = 'string') =>
  defineField({ name, title, type, readOnly: true, fieldset: 'locked', description })

/** VIP Gift Card landing page and its results page — /get-diamond-card. */
export const diamondCardPage = defineType({
  name: 'diamondCardPage',
  title: 'VIP Gift Card Funnel',
  type: 'document',
  fieldsets: [lockedFieldset],
  fields: [
    lockedField(
      'routeKey',
      'Route Key',
      'Binds this document to /get-diamond-card. The application matches on this value.',
    ),
    defineField({
      name: 'landing',
      title: 'Landing Page',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
        defineField({ name: 'heroTitle', title: 'Headline', type: 'string', validation: (Rule) => Rule.required() }),
        defineField({ name: 'heroCta', title: 'Hero Button Label', type: 'string' }),
        defineField({ name: 'heroDisclaimer', title: 'Hero Disclaimer', type: 'text', rows: 3 }),
        defineField({ name: 'formTitle', title: 'Form Title', type: 'string' }),
        defineField({ name: 'formSubtitle', title: 'Form Subtitle', type: 'string' }),
        defineField({ name: 'formBody', title: 'Form Body', type: 'text', rows: 3 }),
        defineField({ name: 'namePlaceholder', title: 'Name Field Placeholder', type: 'string' }),
        defineField({ name: 'zipPlaceholder', title: 'Zip Field Placeholder', type: 'string' }),
        defineField({ name: 'emailPlaceholder', title: 'Email Field Placeholder', type: 'string' }),
        defineField({ name: 'phonePlaceholder', title: 'Phone Field Placeholder', type: 'string' }),
        defineField({ name: 'submitLabel', title: 'Submit Button Label', type: 'string' }),
        defineField({ name: 'formDisclaimer', title: 'Form Disclaimer', type: 'text', rows: 4 }),
        defineField({ name: 'footerTagline', title: 'Footer Tagline', type: 'string' }),
        defineField({
          name: 'errors',
          title: 'Form Error Messages',
          type: 'object',
          description:
            'Shown when a submission is rejected. The wording matters — a failed submission must never look like a success.',
          fields: [
            defineField({ name: 'missingFields', title: 'Missing Fields', type: 'string' }),
            defineField({ name: 'invalidZip', title: 'Invalid Zip', type: 'string' }),
            defineField({ name: 'invalidPhone', title: 'Invalid Phone', type: 'string' }),
          ],
        }),
        defineField({ name: 'handImage', title: 'Hero Image', type: 'funnelImage' }),
      ],
    }),
    defineField({
      name: 'results',
      title: 'Results Page Copy',
      type: 'quizResults',
      description:
        'Fixed wording on /results/diamond-card. Jeweler details and card value are delivered live.',
    }),
  ],
  preview: { prepare: () => ({ title: 'VIP Gift Card Funnel' }) },
})

/** The Diamond Card terms accordion, referenced from the landing page. */
export const diamondCardTerms = defineType({
  name: 'diamondCardTerms',
  title: 'Diamond Card Terms',
  type: 'document',
  fieldsets: [lockedFieldset],
  fields: [
    lockedField('routeKey', 'Route Key', 'Referenced by the gift card funnel.'),
    defineField({ name: 'title', title: 'Accordion Title', type: 'string' }),
    defineField({
      name: 'introTitle',
      title: 'How to Redeem — Title',
      type: 'string',
      description: 'e.g. "How to redeem your savings".',
    }),
    defineField({
      name: 'introItems',
      title: 'How to Redeem — Steps',
      type: 'array',
      of: [defineArrayMember({ type: 'funnelListSection' })],
      description:
        'The redemption steps. Use the bold phrase field to emphasise part of a step, such as "60 days to attend your consultation".',
    }),
    defineField({
      name: 'savingsTitle',
      title: 'Savings Scale — Title',
      type: 'string',
      description: 'e.g. "Your savings scale with your ring".',
    }),
    defineField({
      name: 'savingsItems',
      title: 'Savings Scale — Rows',
      type: 'array',
      of: [defineArrayMember({ type: 'funnelListSection' })],
      description: 'e.g. "$500 off rings $5,000+".',
    }),
    defineField({ name: 'summaryLead', title: 'Summary Line', type: 'string', description: 'e.g. "Most couples save $500 to $1,500."' }),
    defineField({ name: 'summaryRest', title: 'Validity Line', type: 'string', description: 'e.g. "Valid for 60 days, one-time use."' }),
    defineField({ name: 'finePrintTitle', title: 'Fine Print — Title', type: 'string' }),
    defineField({ name: 'finePrint', title: 'Fine Print', type: 'text', rows: 6 }),
  ],
  preview: { prepare: () => ({ title: 'Diamond Card Terms' }) },
})

/** Drop a Hint — /drop-a-hint. */
export const hintPage = defineType({
  name: 'hintPage',
  title: 'Drop a Hint',
  type: 'document',
  fieldsets: [lockedFieldset],
  fields: [
    lockedField('routeKey', 'Route Key', 'Binds this document to /drop-a-hint.'),
    defineField({ name: 'pageTitle', title: 'Page Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'banner',
      title: 'Banner',
      type: 'object',
      fields: [
        defineField({ name: 'prefix', title: 'Banner — Opening', type: 'string' }),
        defineField({ name: 'suffix', title: 'Banner — Closing', type: 'string' }),
      ],
    }),
    defineField({
      name: 'ring',
      title: 'Fallback Ring',
      type: 'object',
      description:
        'Used when the shared link is missing its ring details. The jeweler label is intentionally left blank when unknown — naming a store the sender was never matched with would be a false claim.',
      fields: [
        defineField({ name: 'name', title: 'Ring Name', type: 'string' }),
        defineField({
          name: 'jewelerLabelTemplate',
          title: 'Jeweler Label Template',
          type: 'string',
          description: 'Use {jewelerName} where the store name should appear.',
        }),
        defineField({ name: 'image', title: 'Ring Image', type: 'funnelImage' }),
      ],
    }),
    defineField({
      name: 'form',
      title: 'Form',
      type: 'object',
      fields: [
        defineField({ name: 'namePlaceholder', title: 'Your Name Placeholder', type: 'string' }),
        defineField({ name: 'partnerNamePlaceholder', title: 'Partner Name Placeholder', type: 'string' }),
        defineField({ name: 'partnerEmailPlaceholder', title: 'Partner Email Placeholder', type: 'string' }),
        defineField({ name: 'subjectDefault', title: 'Default Subject', type: 'string' }),
        defineField({
          name: 'messageTemplate',
          title: 'Default Message',
          type: 'text',
          rows: 5,
          description:
            'Sent as written when the sender leaves the message blank. Placeholders in braces are filled in automatically.',
        }),
        defineField({
          name: 'messageTemplateWithoutLocation',
          title: 'Default Message — No Location',
          type: 'text',
          rows: 5,
          description: 'Used when the shared link carries a jeweler but no location.',
        }),
        defineField({
          name: 'messageTemplateWithoutJeweler',
          title: 'Default Message — No Jeweler',
          type: 'text',
          rows: 5,
          description:
            'Used when the shared link carries no jeweler. It deliberately never names a store the sender was not matched with.',
        }),
        defineField({ name: 'submitLabel', title: 'Submit Button Label', type: 'string' }),
      ],
    }),
    defineField({
      name: 'success',
      title: 'Success Screen',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'leadTemplate', title: 'Lead Line', type: 'text', rows: 2, description: 'Use {partnerName} for the recipient.' }),
        defineField({ name: 'fallbackPartnerName', title: 'Fallback Recipient Name', type: 'string' }),
        defineField({ name: 'tagline', title: 'Tagline', type: 'string' }),
        defineField({ name: 'nextStepTemplate', title: 'Next Step Line', type: 'text', rows: 2, description: 'Use {jewelerName} for the store.' }),
        defineField({ name: 'questionsLead', title: 'Questions Lead-in', type: 'string' }),
      ],
    }),
    defineField({
      name: 'errors',
      title: 'Form Error Messages',
      type: 'object',
      description: 'A failed submission must never look like a success.',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'missingFields', title: 'Missing Fields', type: 'string' }),
        defineField({ name: 'invalidPartnerEmail', title: 'Invalid Partner Email', type: 'string' }),
        defineField({ name: 'partnerEmailSameAsSender', title: 'Partner Email Matches Sender', type: 'string' }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Drop a Hint' }) },
})

/** Consultation scheduling and the booking confirmation screen. */
export const bookingPage = defineType({
  name: 'bookingPage',
  title: 'Booking & Confirmation',
  type: 'document',
  fieldsets: [lockedFieldset],
  fields: [
    lockedField('routeKey', 'Route Key', 'Covers /schedule-consultation and /booking/confirmed.'),
    defineField({
      name: 'picker',
      title: 'Scheduling Screen',
      type: 'object',
      fields: [
        defineField({
          name: 'headlineLines',
          title: 'Headline Lines',
          type: 'array',
          of: [defineArrayMember({ type: 'string' })],
          description: 'Each line renders on its own row.',
        }),
        defineField({ name: 'headlineAccent', title: 'Headline — Accent Line', type: 'string' }),
        defineField({ name: 'bodyLead', title: 'Body — Opening', type: 'text', rows: 2 }),
        defineField({
          name: 'bodyRest',
          title: 'Body — Continuation',
          type: 'text',
          rows: 2,
          description: 'Use {jewelerName} for the store.',
        }),
        defineField({ name: 'pickerTitle', title: 'Picker Title', type: 'string' }),
        defineField({ name: 'pickerSubtitle', title: 'Picker Subtitle', type: 'string', description: 'e.g. "Reserve now. Reschedule anytime!"' }),
        defineField({ name: 'chooseDayLabel', title: 'Day Picker Label', type: 'string' }),
        defineField({ name: 'chooseTimeLabel', title: 'Time Picker Label', type: 'string' }),
        defineField({ name: 'visitDescription', title: 'What the Visit Is', type: 'text', rows: 4 }),
        defineField({ name: 'confirmationNote', title: 'Confirmation Note', type: 'text', rows: 3 }),
        defineField({ name: 'scheduleCta', title: 'Primary Button Label', type: 'string' }),
        defineField({ name: 'phonePlaceholder', title: 'Phone Field Placeholder', type: 'string' }),
        defineField({ name: 'footerTitle', title: 'Footer Question', type: 'text', rows: 2 }),
        defineField({ name: 'footerLead', title: 'Footer Lead-in', type: 'string' }),
        defineField({ name: 'heroBackground', title: 'Hero Background', type: 'funnelImage' }),
      ],
    }),
    defineField({
      name: 'confirmation',
      title: 'Confirmation Screen',
      type: 'object',
      fields: [
        defineField({ name: 'heroTitleLead', title: 'Headline', type: 'string' }),
        defineField({ name: 'consultationEyebrow', title: 'Consultation Eyebrow', type: 'string' }),
        defineField({ name: 'confirmedLead', title: 'Confirmed Lead-in', type: 'string' }),
        defineField({ name: 'arrivalLead', title: 'Arrival Lead-in', type: 'string' }),
        defineField({ name: 'locationEyebrow', title: 'Location Eyebrow', type: 'string' }),
        defineField({ name: 'bookingCta', title: 'Booking Button Label', type: 'string' }),
        defineField({ name: 'confirmedCta', title: 'Confirmed Button Label', type: 'string' }),
        defineField({
          name: 'whatHappensNext',
          title: 'What Happens Next',
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string' }),
            defineField({ name: 'bodyLead', title: 'Body — Opening', type: 'text', rows: 2 }),
            defineField({ name: 'bodyEmphasis', title: 'Body — Emphasised Word', type: 'string' }),
            defineField({ name: 'bodyTail', title: 'Body — Continuation', type: 'text', rows: 3 }),
          ],
        }),
        defineField({
          name: 'whatToExpect',
          title: 'What to Expect',
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string' }),
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 5 }),
          ],
        }),
        defineField({
          name: 'whatToBring',
          title: 'What to Bring',
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string' }),
            defineField({ name: 'intro', title: 'Intro Line', type: 'string' }),
            defineField({
              name: 'items',
              title: 'Items',
              type: 'array',
              of: [defineArrayMember({ type: 'string' })],
            }),
          ],
        }),
        defineField({
          name: 'diamondCardReminder',
          title: 'Diamond Card Reminder',
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string' }),
            defineField({ name: 'instruction', title: 'Instruction', type: 'text', rows: 2 }),
            defineField({ name: 'footerNote', title: 'Footer Note', type: 'text', rows: 2 }),
          ],
        }),
        defineField({
          name: 'contact',
          title: 'Contact Block',
          type: 'object',
          fields: [
            defineField({ name: 'titleLead', title: 'Title — Opening', type: 'string' }),
            defineField({ name: 'titleTail', title: 'Title — Closing', type: 'string' }),
            defineField({ name: 'textLead', title: 'Text Lead-in', type: 'string' }),
          ],
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Booking & Confirmation' }) },
})

/** Wording shared across more than one funnel. */
export const funnelShared = defineType({
  name: 'funnelShared',
  title: 'Shared Funnel Wording',
  type: 'document',
  fieldsets: [lockedFieldset],
  fields: [
    lockedField('routeKey', 'Route Key', 'Cross-funnel content.'),
    defineField({ name: 'footerTagline', title: 'Footer Tagline', type: 'string' }),
    defineField({ name: 'whatWeDoTitle', title: 'What We Do — Title', type: 'string' }),
    defineField({ name: 'whatWeDoBody', title: 'What We Do — Body', type: 'text', rows: 5 }),
    defineField({ name: 'giftCardValueNote', title: 'Gift Card Value Note', type: 'text', rows: 3 }),
  ],
  preview: { prepare: () => ({ title: 'Shared Funnel Wording' }) },
})
