import { imageUrl } from '../sanity/image'
import type { CmsResponsiveImage } from '../sanity/types'

type ResponsiveImageProps = {
  image?: CmsResponsiveImage
  fallbackSrc: string
  alt: string
  className?: string
  sizes?: string
}

/** This preserves the current image layouts while allowing intentional editorial crops. */
export default function ResponsiveImage({ image, fallbackSrc, alt, className, sizes }: ResponsiveImageProps) {
  const mobile = imageUrl(image?.mobileImage, 900)
  const tablet = imageUrl(image?.tabletImage, 1200)
  const xl = imageUrl(image?.xlImage, 2400)
  const main = imageUrl(image?.mainImage, 1800) ?? fallbackSrc
  const objectPosition = image?.focalPoint ?? 'center center'

  return (
    <picture>
      {xl && <source media="(min-width: 1536px)" srcSet={xl} />}
      {tablet && <source media="(min-width: 768px)" srcSet={tablet} />}
      {mobile && <source media="(max-width: 767px)" srcSet={mobile} />}
      <img src={main} alt={image?.alt ?? alt} className={className} sizes={sizes} style={{ objectPosition }} />
    </picture>
  )
}
