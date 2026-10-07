import { defineArrayMember, defineField, defineType } from 'sanity';

/**
 * The Diamond Card Terms & Eligibility content shown in the modal.
 *
 * This is the legal wording behind the "*Restrictions apply" line and the
 * "Terms & Eligibility" links. It is held once for the whole site, so the landing
 * page modal, the results pages and the footer links all show the same thing.
 *
 * The block types mirror exactly what the app already renders, so the existing
 * wording did not have to be reworked to become editable. Text fields accept
 * **bold** around a phrase, the same convention the current copy uses.
 *
 * Kept separate from the "Diamond Card Terms" document, which holds the results
 * accordion copy. That one may be retired later.
 */

const previewText = (fallback: string) => ({
  select: { text: 'text' },
  prepare: ({ text }: { text?: string }) => ({
    title: text || fallback,
  }),
});

export const dctHeading = defineType({
  name: 'dctHeading',
  title: 'Section Heading',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Heading',
      type: 'string',
      description:
        'A numbered section heading, e.g. "3. Diamond Card Savings Amounts".',
    }),
  ],
  preview: previewText('Section Heading'),
});

export const dctSubheading = defineType({
  name: 'dctSubheading',
  title: 'Subheading',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Subheading',
      type: 'string',
      description: 'A minor heading within a section.',
    }),
  ],
  preview: previewText('Subheading'),
});

export const dctParagraph = defineType({
  name: 'dctParagraph',
  title: 'Paragraph',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      rows: 4,
      description: 'Wrap a phrase in **double asterisks** to make it bold.',
    }),
  ],
  preview: previewText('Paragraph'),
});

export const dctCallout = defineType({
  name: 'dctCallout',
  title: 'Callout Box',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Lead Line',
      type: 'string',
      description: 'Optional semibold line above the callout text.',
    }),
    defineField({ name: 'text', title: 'Text', type: 'text', rows: 3 }),
  ],
  preview: {
    select: { text: 'text', heading: 'heading' },
    prepare: ({ text, heading }: { text?: string; heading?: string }) => ({
      title: heading || text || 'Callout',
      subtitle: heading ? text : undefined,
    }),
  },
});

export const dctList = defineType({
  name: 'dctList',
  title: 'Bulleted List',
  type: 'object',
  fields: [
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
  ],
  preview: {
    select: { items: 'items' },
    prepare: ({ items }: { items?: string[] }) => ({
      title: items?.length ? items[0] : 'Bulleted List',
      subtitle: `${items?.length ?? 0} item(s)`,
    }),
  },
});

export const dctTable = defineType({
  name: 'dctTable',
  title: 'Table',
  type: 'object',
  fields: [
    defineField({
      name: 'headers',
      title: 'Column Headers',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description:
        'Keep this to two columns so the table stays readable on a phone.',
    }),
    defineField({
      name: 'rows',
      title: 'Rows',
      type: 'array',
      description: 'Each row needs one cell per column header.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'dctTableRow',
          title: 'Row',
          fields: [
            defineField({
              name: 'cells',
              title: 'Cells',
              type: 'array',
              of: [defineArrayMember({ type: 'string' })],
            }),
          ],
          preview: {
            select: { cells: 'cells' },
            prepare: ({ cells }: { cells?: string[] }) => ({
              title: cells?.join('  ·  ') || 'Row',
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { headers: 'headers', rows: 'rows' },
    prepare: ({ headers, rows }: { headers?: string[]; rows?: unknown[] }) => ({
      title: headers?.length ? headers.join('  |  ') : 'Table',
      subtitle: `${rows?.length ?? 0} row(s)`,
    }),
  },
});

export const diamondCardTermsEligibility = defineType({
  name: 'diamondCardTermsEligibility',
  title: 'Diamond Card Terms & Eligibility (Modal)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Modal Title',
      type: 'string',
      description: 'Shown at the top of the terms modal.',
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'string',
      description: 'Shown under the title, e.g. "Last updated: October 2026".',
    }),
    defineField({
      name: 'blocks',
      title: 'Content',
      type: 'array',
      description: 'Drag to reorder. These appear in the modal in this order.',
      of: [
        defineArrayMember({ type: 'dctHeading' }),
        defineArrayMember({ type: 'dctSubheading' }),
        defineArrayMember({ type: 'dctParagraph' }),
        defineArrayMember({ type: 'dctCallout' }),
        defineArrayMember({ type: 'dctList' }),
        defineArrayMember({ type: 'dctTable' }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Diamond Card Terms & Eligibility (Modal)' }),
  },
});
