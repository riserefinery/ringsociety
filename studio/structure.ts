import type { StructureResolver } from 'sanity/structure'

const singleton = (S: Parameters<StructureResolver>[0], type: string, title: string) =>
  S.listItem().title(title).id(type).child(S.document().schemaType(type).documentId(type).title(title))

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Ring Society')
    .items([
      singleton(S, 'siteSettings', 'Site Settings'),
      singleton(S, 'publicationSettings', 'Ring Society Byline'),
      S.divider(),
      S.listItem()
        .title('Pages')
        .child(S.list().title('Pages').items([singleton(S, 'blogLanding', 'All Resources'), singleton(S, 'contactPage', 'Contact')])),
      S.listItem()
        .title('Blog & Guides')
        .child(S.list().title('Blog & Guides').items([S.documentTypeListItem('post').title('All Posts & Guides'), S.documentTypeListItem('category').title('Categories')])),
      S.listItem().title('Legal Pages').child(S.documentTypeList('legalPage').title('Legal Pages')),
    ])
