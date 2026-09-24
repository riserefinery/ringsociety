import { defineArrayMember, defineField, defineType } from 'sanity'

export const pageSeo = defineType({
  name: 'pageSeo',
  title: 'Search & Sharing',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Share Title Override', description: 'Leave blank to use the article title. Use this only when the shared-link title should differ from the page title.', type: 'string', validation: (Rule) => Rule.max(110).warning('Keep this concise when possible so it is not truncated in a social preview.') }),
    defineField({ name: 'description', title: 'Share Description Override', description: 'Leave blank to use the article excerpt. Use this only when the shared-link description should differ from the page description.', type: 'text', rows: 3, validation: (Rule) => Rule.max(160) }),
    defineField({ name: 'canonicalPath', title: 'Canonical URL Override', description: 'Usually leave blank: the public Permalink is used automatically. Example override: /guides/how-to-buy-an-engagement-ring', type: 'string', validation: (Rule) => Rule.custom((value) => !value || String(value).startsWith('/') || 'Use a relative path beginning with /.') }),
    defineField({ name: 'openGraphImage', title: 'Share Image Override', description: 'Leave blank to use this guide’s Hero Image as the social share image.', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'noIndex', title: 'Prevent Search Indexing', type: 'boolean', initialValue: false }),
  ],
})

export const responsiveImage = defineType({
  name: 'responsiveImage',
  title: 'Responsive Editorial Image',
  type: 'object',
  fields: [
    defineField({ name: 'mainImage', title: 'Main Image', type: 'image', options: { hotspot: true }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'alt', title: 'Alt Text', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'mobileImage', title: 'Mobile Image Override', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'tabletImage', title: 'Tablet Image Override', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'xlImage', title: 'XL Desktop Image Override', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'focalPoint',
      title: 'Focal Alignment',
      type: 'string',
      initialValue: 'center center',
      options: {
        list: [
          { title: 'Top Left', value: 'left top' },
          { title: 'Top Center', value: 'center top' },
          { title: 'Top Right', value: 'right top' },
          { title: 'Center Left', value: 'left center' },
          { title: 'Center Center', value: 'center center' },
          { title: 'Center Right', value: 'right center' },
          { title: 'Bottom Left', value: 'left bottom' },
          { title: 'Bottom Center', value: 'center bottom' },
          { title: 'Bottom Right', value: 'right bottom' },
        ],
      },
    }),
  ],
  preview: { select: { title: 'alt', media: 'mainImage' } },
})

export const callout = defineType({
  name: 'callout',
  title: 'Editorial Callout',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Label', type: 'string', initialValue: 'Key advice' }),
    defineField({ name: 'text', title: 'Message', type: 'text', rows: 3, validation: (Rule) => Rule.required() }),
  ],
  preview: { select: { title: 'label', subtitle: 'text' } },
})

export const definitionList = defineType({
  name: 'definitionList',
  title: 'Definition List',
  type: 'object',
  fields: [
    defineField({
      name: 'items',
      title: 'Terms',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'term', title: 'Term', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'definition', title: 'Definition', type: 'text', rows: 2, validation: (Rule) => Rule.required() }),
          ],
          preview: { select: { title: 'term', subtitle: 'definition' } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Definition List' }) },
})
