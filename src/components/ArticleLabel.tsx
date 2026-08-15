import { svgPaths } from '../lib/assets'

type ArticleLabelProps = {
  label: string
  color?: string
  background?: string
  className?: string
}

/**
 * A post-selected label rendered consistently on guide cards and article heroes.
 * The label text is authored in Sanity; the icon treatment stays part of the
 * established Ring Society visual system.
 */
export default function ArticleLabel({
  label,
  color = '#fff',
  background = 'rgba(155,155,155,0.28)',
  className = '',
}: ArticleLabelProps) {
  const isMostLoved = label.trim().toLowerCase().replace(/[-_]+/g, ' ') === 'most loved'

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 backdrop-blur-sm ${className}`} style={{ background }}>
      <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
        {isMostLoved ? (
          <path clipRule="evenodd" d={svgPaths.p206fd380} fill={color} fillRule="evenodd" />
        ) : (
          <g>
            <path d={svgPaths.pf5a4280} fill={color} />
            <path d={svgPaths.p2026f000} fill={color} />
            <path d={svgPaths.p3b71c800} fill={color} />
            <path d={svgPaths.p122a5800} fill={color} />
          </g>
        )}
      </svg>
      <span className="text-[11px] font-semibold uppercase tracking-[2px]" style={{ color }}>
        {label}
      </span>
    </span>
  )
}
