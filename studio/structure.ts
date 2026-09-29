import type { StructureResolver } from 'sanity/structure'

/**
 * A singleton entry. `type` is the schema type and `documentId` is the document it opens —
 * these are usually the same, but the quizzes share the `quiz` type across three documents,
 * so they must be passed separately.
 */
const singleton = (
  S: Parameters<StructureResolver>[0],
  type: string,
  title: string,
  documentId: string = type,
) =>
  S.listItem()
    .title(title)
    .id(documentId)
    .child(S.document().schemaType(type).documentId(documentId).title(title))

/**
 * The three quizzes are fixed funnels, so each gets its own named entry rather than an
 * undifferentiated list. The document ids match the route keys seeded by the app.
 */
const quizzes = (S: Parameters<StructureResolver>[0]) =>
  S.list()
    .title('Quizzes')
    .items([
      singleton(S, 'quiz', 'Find Your Ring', 'quiz-find-your-ring'),
      singleton(S, 'quiz', 'Design Your Ring', 'quiz-design-your-ring'),
      singleton(S, 'quiz', 'Find a Jeweler', 'quiz-find-a-jeweler'),
    ])

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Ring Society')
    .items([
      singleton(S, 'siteSettings', 'Site Settings'),
      singleton(S, 'publicationSettings', 'Ring Society Byline'),
      S.divider(),
      S.listItem()
        .title('Pages')
        .child(S.list().title('Pages').items([singleton(S, 'blogLanding', 'All Resources'), singleton(S, 'topGuidesLanding', 'Top Guides'), singleton(S, 'missionPage', 'Our Mission'), singleton(S, 'contactPage', 'Contact')])),
      S.listItem()
        .title('Blog & Guides')
        .child(S.list().title('Blog & Guides').items([S.documentTypeListItem('post').title('All Posts & Guides'), S.documentTypeListItem('articleLabel').title('Article Labels'), S.documentTypeListItem('category').title('Categories')])),
      S.listItem().title('Legal Pages').child(S.documentTypeList('legalPage').title('Legal Pages')),
      S.divider(),
      S.listItem()
        .title('Funnels')
        .child(
          S.list()
            .title('Funnels')
            .items([
              S.listItem().title('Quizzes').child(quizzes(S)),
              S.listItem()
                .title('Gift Card')
                .child(
                  S.list()
                    .title('Gift Card')
                    .items([
                      singleton(S, 'diamondCardPage', 'VIP Gift Card Funnel'),
                      singleton(S, 'diamondCardTerms', 'Diamond Card Terms'),
                    ]),
                ),
              S.listItem()
                .title('Other Funnel Pages')
                .child(
                  S.list()
                    .title('Other Funnel Pages')
                    .items([
                      singleton(S, 'hintPage', 'Drop a Hint'),
                      singleton(S, 'bookingPage', 'Booking & Confirmation'),
                      singleton(S, 'funnelShared', 'Shared Funnel Wording'),
                    ]),
                ),
            ]),
        ),
    ])
