/* ---------------------------------------------------------------
   Shared UI primitives used across every page.
----------------------------------------------------------------*/
export const serif = "'Instrument Serif', serif"

export function Eyebrow({ children, tone = 'muted' }: { children: string; tone?: 'muted' | 'light' }) {
  return (
    <p
      className="text-[11px] font-semibold uppercase tracking-[2px]"
      style={{ color: tone === 'light' ? '#a0a0a0' : 'var(--muted)' }}
    >
      {children}
    </p>
  )
}

/** Text label with a line that morphs into an arrow on hover (desktop); rests as arrow on touch. */
export function CtaLine({ label, tone = 'dark' }: { label: string; tone?: 'dark' | 'light' }) {
  const color = tone === 'light' ? '#fff' : '#000'
  return (
    <span className="group inline-flex items-center gap-2 cursor-pointer">
      <span className="text-[13px] font-semibold uppercase leading-[1.5] tracking-[1.4px] md:tracking-[2px]" style={{ color }}>
        {label}
      </span>
      <span className="relative flex h-[9px] w-[19px] shrink-0 items-center transition-all duration-300 ease-out md:w-7 md:group-hover:w-[19px]">
        <span className="h-px w-full transition-all duration-300" style={{ background: color }} />
        <span
          className="absolute right-0 top-1/2 h-[7px] w-[7px] -translate-y-1/2 rotate-45 opacity-100 transition-all duration-300 ease-out md:translate-x-[3px] md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100"
          style={{ borderTop: `1px solid ${color}`, borderRight: `1px solid ${color}` }}
        />
      </span>
    </span>
  )
}

export function SolidButton({
  children,
  variant = 'dark',
  className = '',
  disabled = false,
}: {
  children: string
  variant?: 'dark' | 'light'
  className?: string
  disabled?: boolean
}) {
  const dark = variant === 'dark'
  // hover fades each button to its exact inverse — no lift, no shadow
  const tones = dark
    ? 'border border-black bg-black text-[#fbf9f7] hover:bg-white hover:text-black'
    : 'border border-transparent bg-white text-black hover:bg-black hover:text-white'
  return (
    <button
      disabled={disabled}
      className={`h-[45px] rounded-lg px-6 text-[13px] font-semibold uppercase tracking-[1.5px] transition-colors duration-500 ease-out ${tones} ${className}`}
    >
      {children}
    </button>
  )
}

export function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="6.5" cy="6.5" r="5" stroke="black" strokeWidth="1.5" />
      <line x1="10.2" y1="10.2" x2="15" y2="15" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
