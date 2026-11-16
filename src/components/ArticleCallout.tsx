import { serif } from './ui'

/** Editorial emphasis for article callouts; legacy CMS labels are intentionally not displayed. */
export default function ArticleCallout({ text }: { text: string }) {
  return (
    <div
      role="note"
      className="article-callout border-l-2 border-black py-2 pl-6 text-[26px] font-normal leading-[1.4] text-black"
      style={{ fontFamily: serif }}
    >
      <p>{text}</p>
    </div>
  )
}
