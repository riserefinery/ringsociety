import {
  funnelImage,
  funnelListItem,
  funnelListSection,
  metalImage,
  phoneCaptureCopy,
  landingVariant,
  quizIntro,
  landingVariant,
  quizOption,
  quizResults,
  quizStep,
} from './objects'
import { quiz } from './quizzes'
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
  quizResults,
  phoneCaptureCopy,
]

export const funnelDocumentTypes = [
  quiz,
  diamondCardPage,
  diamondCardTerms,
  hintPage,
  bookingPage,
  funnelShared,
  funnelLoadingScreen,
  ...sharedResultsDocumentTypes,
]
