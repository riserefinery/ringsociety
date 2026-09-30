import { callout, definitionList, pageSeo, responsiveImage } from './common'
import { articleLabel, blogLanding, category, contactPage, legalPage, missionPage, post, publicationSettings, siteSettings, topGuidesLanding } from './documents'
import { funnelDocumentTypes, funnelObjectTypes } from './funnels'

export const schemaTypes = [
  pageSeo,
  responsiveImage,
  callout,
  definitionList,
  siteSettings,
  publicationSettings,
  articleLabel,
  category,
  post,
  blogLanding,
  topGuidesLanding,
  missionPage,
  contactPage,
  legalPage,
  ...funnelObjectTypes,
  ...funnelDocumentTypes,
]
