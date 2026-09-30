import { defineArrayMember, defineField, defineType } from 'sanity'
import { metalImage } from './objects'

/**
 * The cards shown while the match is being prepared.
 *
 * Find Your Ring returns three rings, so it shows three cards. Design Your Ring returns one, so it
 * shows one — it previously showed three because the funnel was cloned, which implied results that
 * never arrive.
 *
 * Only the placeholder content lives here. The rings are deliberately indistinct: the screen puts a
 * heavily veiled, blurred overlay over them so nobody mistakes a placeholder for their result.
 */
export const loadingCard = defineType({
  name: 'loadingCard',
  title: 'Loading Card',
  type: 'object',
  fields: [
    defineField({
      name: 'badge',
      title: 'Number Badge',
      type: 'string',
      description: 'The small number in the card’s corner, e.g. 01.',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Placeholder product name shown under the card.',
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description:
        'Shown under the title. Use {metal} to insert the metal the visitor chose, e.g. "Round Brilliant – {metal}". Leave it out and the words stay exactly as typed.',
    }),
    defineField({
      name: 'images',
      title: 'Images by Metal',
      type: 'array',
      of: [defineArrayMember({ type: 'metalImage' })],
      description:
        'The same card shown in each metal. The visitor sees the one matching the metal they chose. If none matches, the card renders with no image.',
    }),
  ],
  preview: {
    select: { badge: 'badge', title: 'title', media: 'images.0.image' },
    prepare: ({ badge, title, media }) => ({
      title: `${badge ?? ''} ${title ?? 'Loading card'}`.trim(),
      media,
    }),
  },
})

/**
 * One document holding every loading card.
 *
 * A singleton so the wording exists in one place and the two funnels cannot drift apart.
 */
export const funnelLoadingScreen = defineType({
  name: 'funnelLoadingScreen',
  title: 'Funnel — Loading Screen',
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
      name: 'routeKey',
      title: 'Route Key',
      type: 'string',
      readOnly: true,
      fieldset: 'locked',
      description: 'Read by the loading screen.',
    }),
    defineField({
      name: 'message',
      title: 'Loading Message',
      type: 'string',
      description:
        'Optional. Leave empty to keep the rotating "searching" messages the app already shows.',
    }),
    defineField({
      name: 'matchCards',
      title: 'Find Your Ring — Cards',
      type: 'array',
      of: [defineArrayMember({ type: 'loadingCard' })],
      description:
        'Shown while Find Your Ring is matching. Three cards, matching the three rings this funnel returns. Adding or removing a card changes how many appear.',
    }),
    defineField({
      name: 'singleCard',
      title: 'Design Your Ring — Card',
      type: 'loadingCard',
      description:
        'Shown while Design Your Ring is preparing. Only one, because this funnel returns a single ring.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Funnel — Loading Screen' }) },
})