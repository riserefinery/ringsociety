import { defineArrayMember, defineField, defineType } from 'sanity';

/**
 * The Diamond Card Terms & Eligibility content shown in the modal.
 *
 * This is the legal wording behind the "*Restrictions apply" line and the
 * "Terms & Eligibility" links. It is held once for the whole site, so the landing
 * page modal, the results pages and the footer links all show the same thing.
 *
 * Organised as numbered sections. Each section is a collapsed entry in the Studio
 * showing its heading, so ten sections read as ten lines rather than forty blocks
 * in a flat list. Open a section to edit the paragraphs, tables and lists inside
 * it.
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

export const dctSubheading = defineType({
  name: 'dctSubheading',
  title: 'Subheading',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Subheading',
      type: 'string',
      description: 'A minor heading within this section.',
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

/**
 * One numbered part of the terms, e.g. "3. Diamond Card Savings Amounts".
 * Holds its own heading so the list stays readable when collapsed.
 */
export const dctSection = defineType({
  name: 'dctSection',
  title: 'Section',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Section Heading',
      type: 'string',
      description: 'e.g. "3. Diamond Card Savings Amounts".',
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      description: 'Drag to reorder. These appear under this heading.',
      of: [
        defineArrayMember({ type: 'dctSubheading' }),
        defineArrayMember({ type: 'dctParagraph' }),
        defineArrayMember({ type: 'dctCallout' }),
        defineArrayMember({ type: 'dctList' }),
        defineArrayMember({ type: 'dctTable' }),
      ],
    }),
  ],
  preview: {
    select: { heading: 'heading', content: 'content' },
    prepare: ({
      heading,
      content,
    }: {
      heading?: string;
      content?: unknown[];
    }) => ({
      title: heading || 'Untitled section',
      subtitle: `${content?.length ?? 0} block(s)`,
    }),
  },
});

export const diamondCardTermsEligibility = defineType({
  name: 'diamondCardTermsEligibility',
  title: 'Diamond Card Terms & Eligibility',
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
      name: 'sections',
      title: 'Sections',
      type: 'array',
      description:
        'Each section becomes its own numbered part of the terms. Drag to reorder.',
      of: [defineArrayMember({ type: 'dctSection' })],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Diamond Card Terms & Eligibility' }),
  },
});