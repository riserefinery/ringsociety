import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Quiz funnels.
 *
 * Each quiz is one document and owns its own questions. There is deliberately no shared
 * question library: editing a question here changes this funnel only, which keeps every
 * funnel independently editable — the point of moving this content into the CMS.
 */

/** Route keys bind a document to the funnel it drives. Locked, because the app matches on them. */
export const QUIZ_ROUTE_KEYS = [
  { title: 'Find Your Ring — /quiz/find-your-ring', value: 'find-your-ring' },
  { title: 'Design Your Ring — /quiz/design-your-ring', value: 'design-your-ring' },
  { title: 'Find a Jeweler — /quiz/find-a-jeweler', value: 'find-a-jeweler' },
]

export const RESULTS_ROUTE_KEYS = [
  { title: 'Find Your Ring — /results/find-ring', value: 'find-ring' },
  { title: 'Design Your Ring — /results/design-ring', value: 'design-ring' },
  { title: 'Find a Jeweler — /results/find-jeweler', value: 'find-jeweler' },
  { title: 'Diamond Card — /results/diamond-card', value: 'diamond-card' },
]

/**
 * Ordering rules the branching logic depends on. Reordering is free everywhere else; these
 * pairs must keep their relative order or the funnel branches incorrectly.
 */
const ORDER_CONSTRAINTS: { before: string; after: string; reason: string }[] = [
  {
    before: 'q7',
    after: 'q7b',
    reason:
      'The timeline question only appears when the budget question is skipped, so it must stay after the budget question.',
  },
  {
    before: 'q8',
    after: 'q10',
    reason:
      'The territory check runs on the zip step and decides whether the Diamond Card phone step is shown, so zip must stay before phone.',
  },
  {
    before: 'q3',
    after: 'q5',
    reason:
      'Find a Jeweler runs its zip step as q3 and the ring funnels run it as q8; the zip step must stay before the contact step.',
  },
]

const validateStepOrder = (steps: unknown) => {
  if (!Array.isArray(steps)) return true

  const ids = steps
    .map((step) => (step as { stepId?: string } | undefined)?.stepId)
    .filter((id): id is string => Boolean(id))

  for (const rule of ORDER_CONSTRAINTS) {
    const beforeIndex = ids.indexOf(rule.before)
    const afterIndex = ids.indexOf(rule.after)

    // Only relevant when both steps exist in this quiz.
    if (beforeIndex === -1 || afterIndex === -1) continue

    if (beforeIndex > afterIndex) {
      return `${rule.before} must come before ${rule.after}. ${rule.reason}`
    }
  }

  return true
}

export const quiz = defineType({
  name: 'quiz',
  title: 'Quiz Funnel',
  type: 'document',
  fieldsets: [
    {
      name: 'locked',
      title: 'LOCKED — set by the app, do not change',
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Funnel Name',
      type: 'string',
      description: 'For your reference only, e.g. "Find Your Ring".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'routeKey',
      title: 'Route Key',
      type: 'string',
      readOnly: true,
      fieldset: 'locked',
      options: { list: QUIZ_ROUTE_KEYS },
      description:
        'Binds this document to its funnel. The application matches on this value, so it is locked.',
    }),
    defineField({
      name: 'intro',
      title: 'Landing Screen',
      type: 'quizIntro',
    }),
    defineField({
      name: 'steps',
      title: 'Questions',
      type: 'array',
      of: [defineArrayMember({ type: 'quizStep' })],
      description:
        'Drag to reorder. Turn a question off to hide it without deleting it. Questions marked ORDER LOCKED must keep their position relative to the question named on them.',
      validation: (Rule) => Rule.custom(validateStepOrder).warning(),
    }),
    defineField({
      name: 'results',
      title: 'Results Page Copy',
      type: 'quizResults',
      description:
        'The fixed wording on this funnel\u2019s results page. Matched-jeweler data is delivered live.',
    }),
    defineField({
      name: 'phoneCapture',
      title: 'Diamond Card Step',
      type: 'phoneCaptureCopy',
      description: 'The phone step shown after email on the two ring funnels.',
    }),
    defineField({ name: 'seo', title: 'Search & Sharing', type: 'pageSeo' }),
  ],
  preview: {
    select: { title: 'title', routeKey: 'routeKey', steps: 'steps' },
    prepare: ({ title, routeKey, steps }) => ({
      title: title || 'Untitled quiz',
      subtitle: [
        routeKey,
        Array.isArray(steps) ? `${steps.length} questions` : null,
      ]
        .filter(Boolean)
        .join(' · '),
    }),
  },
})
