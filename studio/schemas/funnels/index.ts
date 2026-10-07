import {
  funnelImage,
  funnelListItem,
  funnelListSection,
  metalImage,
  phoneCaptureCopy,
  landingVariant,
  quizIntro,
  quizOption,
  quizResults,
  quizStep,
} from './objects'
import { quiz } from './quizzes'
import {
  diamondCardTermsEligibility,
  dctCallout,
  dctHeading,
  dctList,
  dctParagraph,
  dctSubheading,
  dctTable,
} from './diamondCardTermsEligibility'
import { bookingPage, diamondCardPage, diamondCardTerms, funnelShared, hintPage } from './pages'
import { sharedResultsDocumentTypes } from './results'
import { funnelLoadingScreen, loadingCard } from './loading'

export const funnelObjectTypes = [
  funnelImage,
  funnelListItem,
  funnelListSection,
  metalImage,
  loadingCard,
  quizOption,
  quizStep,
  quizIntro,
  landingVariant,
  quizResults,
  phoneCaptureCopy,
  dctHeading,
  dctSubheading,
  dctParagraph,
  dctCallout,
  dctList,
  dctTable,
]

export const funnelDocumentTypes = [
  quiz,
  diamondCardPage,
  diamondCardTerms,
  diamondCardTermsEligibility,
  hintPage,
  bookingPage,
  funnelShared,
  funnelLoadingScreen,
  ...sharedResultsDocumentTypes,
]
