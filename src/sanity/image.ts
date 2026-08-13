import imageUrlBuilder from '@sanity/image-url'
import { isSanityConfigured } from './client'

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID
const dataset = import.meta.env.VITE_SANITY_DATASET

const builder = isSanityConfigured ? imageUrlBuilder({ projectId, dataset }) : null

export function imageUrl(image: unknown, width: number): string | undefined {
  if (!builder || !image) return undefined

  try {
    return builder.image(image as never).width(width).fit('max').auto('format').url()
  } catch {
    return undefined
  }
}
