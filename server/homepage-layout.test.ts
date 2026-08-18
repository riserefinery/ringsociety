import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '..')

describe('shared full-bleed hero and CTA layout', () => {
  it('aligns the homepage hero’s widened desktop content column with the shared page grid', () => {
    const home = readFileSync(resolve(root, 'src/pages/Home.tsx'), 'utf8')
    const hero = readFileSync(resolve(root, 'src/components/Hero.tsx'), 'utf8')

    expect(home).toContain('fullBleedDesktop')
    expect(home).toContain('alignContentToPageGrid')
    expect(hero).toContain('fullBleedDesktop?: boolean')
    expect(hero).toContain('alignContentToPageGrid?: boolean')
    expect(hero).toContain("fullBleedDesktop ? 'hidden w-full md:block'")
    expect(hero).toContain("width: 'min(656px, calc(100vw - 80px))'")
    expect(hero).toContain("paddingLeft: 'max(40px, calc((100vw - 1440px) / 2 + 40px))'")
    expect(hero).toContain("paddingLeft: 'max(136px, calc((100vw - 1440px) / 2 + 136px))'")
  })

  it('makes the shared CTA full-bleed only at desktop and removes the desktop footer gap', () => {
    const home = readFileSync(resolve(root, 'src/pages/Home.tsx'), 'utf8')
    const newsletter = readFileSync(resolve(root, 'src/components/Newsletter.tsx'), 'utf8')

    expect(newsletter).toContain('md:max-w-none md:px-0')
    expect(newsletter).toContain('rounded-lg md:rounded-none')
    expect(home).toContain('md:pb-0 md:pt-24')
    expect(home).toContain('pb-16 pt-16')
  })

  it('propagates the requested full-bleed desktop surfaces to Resources, Top Guides, and Our Mission only', () => {
    const pageHeader = readFileSync(resolve(root, 'src/components/PageHeader.tsx'), 'utf8')
    const resources = readFileSync(resolve(root, 'src/pages/Resources.tsx'), 'utf8')
    const topGuides = readFileSync(resolve(root, 'src/pages/TopGuides.tsx'), 'utf8')
    const mission = readFileSync(resolve(root, 'src/pages/OurMission.tsx'), 'utf8')

    expect(pageHeader).toContain('fullBleedDesktop?: boolean')
    expect(pageHeader).toContain("fullBleedDesktop ? 'w-full'")
    expect(resources).toContain('fullBleedDesktop')
    expect(topGuides).toContain('fullBleedDesktop')
    expect(mission).toContain('fullBleedDesktop')
    expect(mission).toContain('alignContentToPageGrid')
    expect(resources).toContain('w-full pt-16 md:pt-24')
    expect(topGuides).toContain('w-full pt-16 md:pt-24')
    expect(mission).toContain('w-full pt-16 md:pt-24')
  })

  it('keeps the approved mobile type scale and supplied favicon wired through the shared templates', () => {
    const home = readFileSync(resolve(root, 'src/pages/Home.tsx'), 'utf8')
    const hero = readFileSync(resolve(root, 'src/components/Hero.tsx'), 'utf8')
    const pageHeader = readFileSync(resolve(root, 'src/components/PageHeader.tsx'), 'utf8')
    const feature = readFileSync(resolve(root, 'src/components/GuideFeature.tsx'), 'utf8')
    const header = readFileSync(resolve(root, 'src/components/Header.tsx'), 'utf8')
    const rootShell = readFileSync(resolve(root, 'src/app/Root.tsx'), 'utf8')
    const article = readFileSync(resolve(root, 'src/pages/Article.tsx'), 'utf8')
    const legal = readFileSync(resolve(root, 'src/pages/LegalPage.tsx'), 'utf8')
    const favicon = readFileSync(resolve(root, 'index.html'), 'utf8')

    expect(hero).toContain('text-[44px] leading-[1.1]')
    expect(pageHeader).toContain('text-[44px] leading-[1.1]')
    expect(feature).toContain('text-[36px] leading-[1.18]')
    expect(article).toContain('body-copy')
    expect(legal).toContain('body-copy')
    expect(favicon).toContain('/manus-storage/ring-society-icon-black_6813ccce.svg')
    expect(header).toContain('h-[28.8px] w-[18px]')
    expect(header).toContain('<SearchIcon size={18} />')
    expect(header).toContain('className="flex h-8 w-8 items-center justify-center"')
    expect(header).toContain('COMPACT_HEADER_ENTER_SCROLL_Y = 48')
    expect(header).toContain('COMPACT_HEADER_EXIT_SCROLL_Y = 16')
    expect(header).toContain('wasScrolled ? scrollY > COMPACT_HEADER_EXIT_SCROLL_Y : scrollY > COMPACT_HEADER_ENTER_SCROLL_Y')
    expect(header).toContain('const [helloBarText, setHelloBarText] = useState<string | null>(null)')
    expect(header).toContain('settings?.helloBarText || DEFAULT_HELLO_BAR_TEXT')
    expect(header).toContain("{helloBarText ?? '\\u00a0'}")
    expect(header).toContain("showHelloBar ? 'flex' : 'hidden'")
    expect(header).toContain('md:flex')
    expect(header).toContain('export default memo(Header)')
    expect(rootShell).toContain("const HELLO_BAR_SESSION_KEY = 'ring-society:hello-bar-seen'")
    expect(rootShell).toContain('if (pathname !== initialPathname.current && showHelloBar)')
    expect(rootShell).toContain('<Header showHelloBar={showHelloBar} />')
    expect(article).toContain('const cmsDocForSlug = cmsDoc?.slug === slug ? cmsDoc : null')
    expect(home).not.toContain('<HomeIntro')
    expect(home).toContain('const [heroReady, setHeroReady] = useState(startsWithReducedMotion)')
    expect(home).toContain('requestAnimationFrame(() => setHeroReady(true))')
    expect(home).toContain("initial={startsWithReducedMotion() ? false : { opacity: 0, y: 10 }}")
    expect(home).toContain("transition={{ duration: 0.48, delay: 0.14, ease: [0.23, 1, 0.32, 1] }}")
  })
})
