import { imageUrl } from './image'
import type { CmsResponsiveImage } from './types'

const validObjectPositions = new Set([
  'left top',
  'center top',
  'right top',
  'left center',
  'center center',
  'right center',
  'left bottom',
  'center bottom',
  'right bottom',
])

function focalAlignment(value: string | undefined) {
  return value && validObjectPositions.has(value) ? value : 'center center'
}

export function resolvePageHero(hero: CmsResponsiveImage | undefined, fallbackImage: string, fallbackAlt: string) {
  return {
    image: imageUrl(hero?.mainImage, 2400) ?? fallbackImage,
    mobileImage: imageUrl(hero?.mobileImage ?? hero?.mainImage, 900) ?? fallbackImage,
    alt: hero?.alt ?? fallbackAlt,
    imagePosition: focalAlignment(hero?.focalPoint),
  }
}
