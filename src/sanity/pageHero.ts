import { imageUrl } from './image'
import type { CmsResponsiveImage } from './types'

export function resolvePageHero(hero: CmsResponsiveImage | undefined, fallbackImage: string, fallbackAlt: string) {
  return {
    image: imageUrl(hero?.mainImage, 2400) ?? fallbackImage,
    mobileImage: imageUrl(hero?.mobileImage ?? hero?.mainImage, 900) ?? fallbackImage,
    alt: hero?.alt ?? fallbackAlt,
    imagePosition: hero?.focalPoint ?? 'center center',
  }
}
