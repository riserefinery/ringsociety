import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { runSearch, popularEntries, type SearchEntry, type SearchGroup } from '../lib/search'
import { SearchIcon, serif } from './ui'

const RECENTS_KEY = 'rs-recent-searches'
const GROUP_ORDER: SearchGroup[] = ['Guides', 'Articles', 'Categories']

function readRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

/** Split a title so the matched query fragment can be emphasized. */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim()
  if (!q) return <>{text}</>
  const lower = text.toLowerCase()
  let idx = lower.indexOf(q.toLowerCase())
  let len = q.length
  if (idx < 0) {
    const first = q.split(/\s+/)[0].toLowerCase()
    idx = lower.indexOf(first)
    len = first.length
  }
  if (idx < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-transparent font-semibold text-black">{text.slice(idx, idx + len)}</mark>
      {text.slice(idx + len)}
    </>
  )
}

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [recents, setRecents] = useState<string[]>([])

  const results = useMemo(() => (query.trim() ? runSearch(query) : popularEntries()), [query])
  // flat list in group order — drives keyboard navigation
  const ordered = useMemo(
    () => GROUP_ORDER.flatMap((g) => results.filter((r) => r.group === g)),
    [results],
  )

  // open/close side effects: focus, scroll lock, reset
  useEffect(() => {
    if (open) {
      setRecents(readRecents())
      setActive(0)
      const t = setTimeout(() => inputRef.current?.focus(), 40)
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        clearTimeout(t)
        document.body.style.overflow = prev
      }
    }
    setQuery('')
  }, [open])

  useEffect(() => setActive(0), [query])

  const pushRecent = (term: string) => {
    const t = term.trim()
    if (!t) return
    const next = [t, ...readRecents().filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, 5)
    try {
      localStorage.setItem(RECENTS_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
    setRecents(next)
  }

  const go = (entry: SearchEntry) => {
    pushRecent(query || entry.title)
    onClose()
    navigate(entry.to)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (ordered.length ? (i + 1) % ordered.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (ordered.length ? (i - 1 + ordered.length) % ordered.length : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const target = ordered[active] ?? ordered[0]
      if (target) go(target)
    }
  }

  if (!open) return null

  const hasQuery = query.trim().length > 0

  return (
    <div className="fixed inset-0 z-[80] flex justify-center px-4 pt-[12vh] md:pt-[14vh]" role="dialog" aria-modal="true">
      {/* backdrop */}
      <button
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[3px] animate-[fadeIn_.2s_ease-out]"
      />

      {/* panel */}
      <div
        className="relative z-[1] flex max-h-[74vh] w-full max-w-[640px] flex-col overflow-hidden rounded-[14px] bg-white shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35)] animate-[panelIn_.22s_ease-out]"
        onKeyDown={onKeyDown}
      >
        {/* input row */}
        <div className="flex items-center gap-3 border-b border-[#ededed] px-5 py-4">
          <span className="text-[#7b7b7b]">
            <SearchIcon size={19} />
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides, articles, topics…"
            className="w-full bg-transparent text-[16px] text-black outline-none placeholder:text-[#a5a5a5]"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden shrink-0 rounded-[6px] border border-[#e5e5e5] px-2 py-1 text-[10px] font-semibold uppercase tracking-[1px] text-[#a5a5a5] md:block">
            Esc
          </kbd>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {/* recents (only before typing) */}
          {!hasQuery && recents.length > 0 && (
            <div className="px-3 pb-2 pt-2">
              <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[1.5px] text-[#a5a5a5]">Recent</p>
              <div className="flex flex-wrap gap-2">
                {recents.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setQuery(r)
                      inputRef.current?.focus()
                    }}
                    className="rounded-full border border-[#abb7b1]/30 bg-[#f9f6f2] px-3 py-1.5 text-[13px] text-[#4a4a4a] transition-colors hover:border-[#244737]/40 hover:text-black"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {ordered.length === 0 ? (
            <div className="px-4 py-14 text-center">
              <p className="text-[22px] leading-[1.3] text-black" style={{ fontFamily: serif }}>
                No results for “{query.trim()}”
              </p>
              <p className="mt-2 text-[14px] text-[#7b7b7b]">
                Try a broader term — like “diamonds”, “budget”, or “settings”.
              </p>
            </div>
          ) : (
            <>
              {!hasQuery && (
                <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-[#a5a5a5]">
                  Most-loved guides
                </p>
              )}
              {GROUP_ORDER.map((group) => {
                const items = results.filter((r) => r.group === group)
                if (!items.length) return null
                return (
                  <div key={group} className="pb-1">
                    {hasQuery && (
                      <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-[#a5a5a5]">
                        {group}
                      </p>
                    )}
                    {items.map((item) => {
                      const i = ordered.indexOf(item)
                      const isActive = i === active
                      return (
                        <button
                          key={item.id}
                          onMouseEnter={() => setActive(i)}
                          onClick={() => go(item)}
                          className={`flex w-full items-center gap-3.5 rounded-[10px] px-3 py-2.5 text-left transition-colors ${
                            isActive ? 'bg-[#f4f1ec]' : ''
                          }`}
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt=""
                              className="h-11 w-11 shrink-0 rounded-[8px] object-cover"
                            />
                          ) : (
                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] bg-[#244737]/8 text-[#244737]">
                              <SearchIcon size={16} />
                            </span>
                          )}
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate text-[15px] leading-[1.35] text-[#333]">
                              <Highlight text={item.title} query={query} />
                            </span>
                            <span className="text-[12px] uppercase tracking-[1px] text-[#a5a5a5]">{item.meta}</span>
                          </span>
                          <span
                            className={`ml-auto shrink-0 text-[#244737] transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* footer hint */}
        <div className="hidden items-center gap-5 border-t border-[#ededed] px-5 py-2.5 text-[11px] text-[#a5a5a5] md:flex">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-[#e5e5e5] px-1.5 py-0.5 font-semibold">↑</kbd>
            <kbd className="rounded border border-[#e5e5e5] px-1.5 py-0.5 font-semibold">↓</kbd>
            to navigate
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-[#e5e5e5] px-1.5 py-0.5 font-semibold">↵</kbd>
            to open
          </span>
        </div>
      </div>
    </div>
  )
}
