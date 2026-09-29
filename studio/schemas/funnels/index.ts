import {
  funnelImage,
  funnelListItem,
  funnelListSection,
  phoneCaptureCopy,
  quizIntro,
  quizOption,
  quizResults,
  quizStep,
} from './objects'
import { quiz } from './quizzes'
import { bookingPage, diamondCardPage, diamondCardTerms, funnelShared, hintPage } from './pages'
import { sharedResultsDocumentTypes } from './results'

export const funnelObjectTypes = [
  funnelImage,
  funnelListItem,
  funnelListSection,
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
  ...sharedResultsDocumentTypes,
]
