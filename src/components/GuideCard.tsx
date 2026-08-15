import { Eyebrow, CtaLine } from './ui'
import { Link, useViewTransitionState } from 'react-router'
import ResponsiveImage from './ResponsiveImage'
import ArticleLabel from './ArticleLabel'
import type { CmsResponsiveImage } from '../sanity/types'

/**
 * Universal guide/blog card. The STRUCTURE is fixed across pages —
 * image, category eyebrow, title, morphing CTA. Only the `card`
 * content changes depending on the post/guide being linked to.
 */
export type Card = {
  category: string
  title: string
  cta: string
  image: string
  alt: string
  dark?: boolean
  to?: string
  responsiveImage?: CmsResponsiveImage
  /** Optional post-level label selected in Sanity. */
  badge?: string
}

export default function GuideCard({ card }: { card: Card }) {
  const isTransitioning = useViewTransitionState(card.to ?? '/')
  const articleSlug = card.to?.match(/^\/guides\/([^/?#]+)/)?.[1]
  const imageTransitionName = articleSlug && isTransitioning ? `article-image-${articleSlug}` : undefined

  const cardContent = (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-lg transition-transform duration-300 hover:-translate-y-1"
      style={{ background: 'var(--cream)' }}
    >
      <div
        className="relative h-[288px] overflow-hidden"
        style={{ background: card.dark ? '#000' : '#e7ded4', viewTransitionName: imageTransitionName }}
      >
        <ResponsiveImage
          image={card.responsiveImage}
          fallbackSrc={card.image}
          alt={card.alt}
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
          sizes="(min-width: 768px) 33vw, 100vw"
        />
        {card.badge && (
          <div className="absolute right-4 top-4 md:bottom-4 md:left-4 md:right-auto md:top-auto">
            <ArticleLabel label={card.badge} />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-12 px-[30px] pb-7 pt-12">
        <Eyebrow>{card.category}</Eyebrow>
        <div className="flex flex-col gap-6">
          <h3 className="text-[24px] font-medium leading-[1.3] text-black">{card.title}</h3>
          <CtaLine label={card.cta} />
        </div>
      </div>
    </article>
  )

  return card.to ? (
    <Link
      to={card.to}
      className="block h-full"
      aria-label={`${card.title}: ${card.cta}`}
      prefetch="intent"
      viewTransition
    >
      {cardContent}
    </Link>
  ) : (
    cardContent
  )
}
