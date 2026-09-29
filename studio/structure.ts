import type { StructureResolver } from 'sanity/structure'

const singleton = (S: Parameters<StructureResolver>[0], type: string, title: string) =>
  S.listItem().title(title).id(type).child(S.document().schemaType(type).documentId(type).title(title))

/**
 * The three quizzes are fixed funnels, so each gets its own named entry rather than an
 * undifferentiated list. The document ids match the route keys seeded by the app.
 */
const quizzes = (S: Parameters<StructureResolver>[0]) =>
  S.list()
    .title('Quizzes')
    .items([
      singleton(S, 'quiz-find-your-ring', 'Find Your Ring'),
      singleton(S, 'quiz-design-your-ring', 'Design Your Ring'),
      singleton(S, 'quiz-find-a-jeweler', 'Find a Jeweler'),
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
