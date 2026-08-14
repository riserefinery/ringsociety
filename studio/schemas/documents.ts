import { defineArrayMember, defineField, defineType } from 'sanity'

const standardBlock = defineArrayMember({
  type: 'block',
  styles: [
    { title: 'Normal', value: 'normal' },
    { title: 'Section Heading', value: 'h2' },
  ],
  lists: [],
})

const articleImage = defineArrayMember({
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({ name: 'alt', title: 'Alt Text', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'caption', title: 'Caption', type: 'string' }),
    defineField({ name: 'note', title: 'Image Note', type: 'string' }),
  ],
})

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({ name: 'siteTitle', title: 'Site Title', type: 'string', initialValue: 'Ring Society' }),
    defineField({ name: 'helloBarText', title: 'Hello Bar Text', description: 'Short message shown in the green bar above the site navigation.', type: 'string', initialValue: 'Your trusted guide to the perfect Engagement ring', validation: (Rule) => Rule.required().max(120) }),
    defineField({ name: 'defaultSeo', title: 'Default SEO', type: 'pageSeo' }),
    defineField({ name: 'socialLinks', title: 'Social Links', type: 'array', of: [defineArrayMember({ type: 'url' })] }),
    defineField({ name: 'supportEmail', title: 'Support Email', type: 'string' }),
  ],
  preview: { prepare: () => ({ title: 'Ring Society Site Settings' }) },
})

export const publicationSettings = defineType({
  name: 'publicationSettings',
  title: 'Ring Society Byline',
  type: 'document',
  fields: [
    defineField({ name: 'displayName', title: 'Published By', type: 'string', initialValue: 'Ring Society', validation: (Rule) => Rule.required() }),
    defineField({ name: 'organizationBio', title: 'Optional Editorial Bio', type: 'text', rows: 3 }),
    defineField({ name: 'mark', title: 'Organization Mark', type: 'image', options: { hotspot: true } }),
  ],
  preview: { select: { title: 'displayName', media: 'mark' } },
})

export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: (Rule) => Rule.required() }),
    defineField({
      name: 'filterKey',
      title: 'Resources Filter',
      type: 'string',
      options: {
        list: [
          { title: 'Finding a Jeweler', value: 'jeweler' },
          { title: 'Trends', value: 'trends' },
          { title: 'Perspectives', value: 'perspectives' },
          { title: 'Diamonds', value: 'diamonds' },
        ],
      },
    }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
    defineField({ name: 'sortOrder', title: 'Sort Order', type: 'number' }),
  ],
  preview: { select: { title: 'title', subtitle: 'filterKey' } },
})

export const post = defineType({
  name: 'post',
  title: 'Post or Guide',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'media', title: 'Media' },
    { name: 'discovery', title: 'Discovery' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', group: 'content', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', group: 'content', options: { source: 'title', maxLength: 96 }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'excerpt', title: 'Excerpt', type: 'text', group: 'content', rows: 3, validation: (Rule) => Rule.required().max(240) }),
    defineField({ name: 'contentType', title: 'Content Type', type: 'string', group: 'content', initialValue: 'Guide', options: { list: ['Guide', 'Article', 'Trends', 'Perspectives'] } }),
    defineField({ name: 'intro', title: 'Article Introduction', type: 'array', group: 'content', of: [standardBlock] }),
    defineField({ name: 'body', title: 'Article Body', type: 'array', group: 'content', of: [standardBlock, articleImage, defineArrayMember({ type: 'callout' }), defineArrayMember({ type: 'definitionList' })] }),
    defineField({ name: 'heroImage', title: 'Hero Image', type: 'responsiveImage', group: 'media', validation: (Rule) => Rule.required() }),
    defineField({ name: 'bigFeatureImage', title: 'Big Feature Image', description: 'Wide background artwork for this post when it appears on the Top Guides page. Leave blank to use Hero Image.', type: 'responsiveImage', group: 'media' }),
    defineField({ name: 'categories', title: 'Categories', type: 'array', group: 'discovery', of: [defineArrayMember({ type: 'reference', to: [{ type: 'category' }] })] }),
    defineField({ name: 'isMostLoved', title: 'Most-Loved Guide', type: 'boolean', group: 'discovery', initialValue: false }),
    defineField({ name: 'topGuidesBadge', title: 'Top Guides Badge', description: 'Optional label shown when this post is selected for Top Guides.', type: 'string', group: 'discovery', options: { list: [{ title: 'None', value: 'none' }, { title: 'Featured', value: 'featured' }, { title: 'Most Loved', value: 'mostLoved' }] }, initialValue: 'none' }),
    defineField({ name: 'topGuidesTextTone', title: 'Top Guides Overlay Text', description: 'Choose the text color that remains legible over this post’s Big Feature Image.', type: 'string', group: 'discovery', options: { list: [{ title: 'Light text', value: 'light' }, { title: 'Dark text', value: 'dark' }] }, initialValue: 'light' }),
    defineField({ name: 'keywordTags', title: 'Keyword Tags', type: 'array', group: 'discovery', of: [defineArrayMember({ type: 'string' })], options: { layout: 'tags' } }),
    defineField({ name: 'relatedPosts', title: 'Related Posts', type: 'array', group: 'discovery', of: [defineArrayMember({ type: 'reference', to: [{ type: 'post' }] })] }),
    defineField({
      name: 'sidebarCta',
      title: 'Sidebar CTA',
      type: 'object',
      group: 'discovery',
      fields: [
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'label', title: 'Label', type: 'string' }),
        defineField({ name: 'image', title: 'Image', type: 'responsiveImage' }),
        defineField({ name: 'background', title: 'Background Color', type: 'string' }),
        defineField({ name: 'to', title: 'Destination Path', type: 'string' }),
      ],
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'pageSeo', group: 'seo' }),
  ],
  preview: { select: { title: 'title', subtitle: 'contentType', media: 'heroImage.mainImage' } },
})

export const blogLanding = defineType({
  name: 'blogLanding',
  title: 'All Resources',
  type: 'document',
  fields: [
    defineField({ name: 'headline', title: 'Headline', type: 'string', initialValue: 'All Resources' }),
    defineField({ name: 'introduction', title: 'Introduction', type: 'text', rows: 3 }),
    defineField({ name: 'heroImage', title: 'Hero Image and Alignment', type: 'responsiveImage', description: 'Set the image crop with Focal Alignment.' }),
    defineField({ name: 'featuredPost', title: 'Featured Post', type: 'reference', to: [{ type: 'post' }] }),
    defineField({ name: 'seo', title: 'SEO', type: 'pageSeo' }),
  ],
  preview: { prepare: () => ({ title: 'All Resources' }) },
})

export const topGuidesLanding = defineType({
  name: 'topGuidesLanding',
  title: 'Top Guides',
  type: 'document',
  fields: [
    defineField({ name: 'headline', title: 'Headline', type: 'string', initialValue: 'Top Guides' }),
    defineField({ name: 'introduction', title: 'Introduction', type: 'text', rows: 3 }),
    defineField({ name: 'heroImage', title: 'Hero Image and Alignment', type: 'responsiveImage', description: 'Set the image crop with Focal Alignment.' }),
    defineField({ name: 'selectedPosts', title: 'Top Guides Order', description: 'Add posts or guides, then drag to control their display order. Each row uses the selected post’s title, excerpt, Big Feature Image, badge, and overlay text setting.', type: 'array', of: [defineArrayMember({ type: 'reference', to: [{ type: 'post' }] })] }),
    defineField({ name: 'seo', title: 'SEO', type: 'pageSeo' }),
  ],
  preview: { prepare: () => ({ title: 'Top Guides' }) },
})

export const missionPage = defineType({
  name: 'missionPage',
  title: 'Our Mission',
  type: 'document',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string', initialValue: 'The #1 resource for finding your engagement ring' }),
    defineField({ name: 'headline', title: 'Headline', type: 'string' }),
    defineField({ name: 'introduction', title: 'Introduction', type: 'text', rows: 3 }),
    defineField({ name: 'heroImage', title: 'Hero Image and Alignment', type: 'responsiveImage', description: 'Use Center Center for an even vertical crop when the viewport changes.' }),
    defineField({ name: 'seo', title: 'SEO', type: 'pageSeo' }),
  ],
  preview: { prepare: () => ({ title: 'Our Mission' }) },
})

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Contact',
  type: 'document',
  fields: [
    defineField({ name: 'headline', title: 'Headline', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'introduction', title: 'Introduction', type: 'text', rows: 3 }),
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string', initialValue: 'Get In Touch' }),
    defineField({ name: 'heroImage', title: 'Hero Image and Alignment', type: 'responsiveImage', description: 'Set the image crop with Focal Alignment.' }),
    defineField({ name: 'supportEmail', title: 'Support Email', type: 'string', initialValue: 'hello@ringsociety.com' }),
    defineField({ name: 'responseTime', title: 'Response Time', type: 'string', initialValue: 'Within 1–2 business days' }),
    defineField({ name: 'seo', title: 'SEO', type: 'pageSeo' }),
  ],
  preview: { prepare: () => ({ title: 'Contact' }) },
})

export const legalPage = defineType({
  name: 'legalPage',
  title: 'Legal Page',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'body', title: 'Legal Copy', type: 'array', of: [standardBlock], validation: (Rule) => Rule.required() }),
    defineField({ name: 'seo', title: 'SEO', type: 'pageSeo' }),
  ],
  preview: { select: { title: 'title', subtitle: 'slug.current' } },
})
