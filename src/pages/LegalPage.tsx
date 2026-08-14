import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Eyebrow, serif } from '../components'

type LegalPageProps = {
  title: string
  document: string
  showPrivacyRequestNote?: boolean
}

export default function LegalPage({ title, document, showPrivacyRequestNote = false }: LegalPageProps) {
  return (
    <section className="w-full bg-[#f9f6f2] px-5 py-14 md:px-10 md:py-24">
      <article className="mx-auto max-w-[860px] rounded-[2px] bg-white px-6 py-10 shadow-[0_12px_48px_rgba(27,33,29,0.06)] md:px-14 md:py-16">
        <header className="border-b border-[rgba(36,71,55,0.14)] pb-8 md:pb-10">
          <Eyebrow>Ring Society</Eyebrow>
          <h1 className="mt-4 text-[40px] leading-[1.05] tracking-[-1.2px] text-[#1b211d] md:text-[60px]" style={{ fontFamily: serif }}>
            {title}
          </h1>
        </header>

        {showPrivacyRequestNote && (
          <aside className="body-copy mt-8 rounded-[2px] border border-[rgba(36,71,55,0.16)] bg-[#f3f7f1] p-5 text-[#314338] md:p-6">
            <h2 className="font-semibold text-[#1b211d]">Making a privacy request</h2>
            <p className="mt-2">
              To submit a request now, email{' '}
              <a className="underline decoration-[#244737]/40 underline-offset-4 hover:text-[#244737]" href="mailto:hello@ringsociety.com?subject=Privacy%20Request">
                hello@ringsociety.com
              </a>{' '}
              with the subject line <strong>Privacy Request</strong>. A dedicated secure request form will be connected before this page is promoted to the public production domain.
            </p>
          </aside>
        )}

        <div className="mt-9 legal-document">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: () => null,
              h2: ({ children }) => <h2 className="mt-12 text-[30px] leading-[1.15] text-[#1b211d] md:text-[38px]" style={{ fontFamily: serif }}>{children}</h2>,
              h3: ({ children }) => <h3 className="mt-8 text-[19px] font-semibold leading-[1.35] text-[#1b211d]">{children}</h3>,
              p: ({ children }) => <p className="body-copy mt-5 text-[#3f4642] md:leading-[1.75]">{children}</p>,
              a: ({ href, children }) => <a href={href} className="text-[#244737] underline decoration-[#244737]/35 underline-offset-4 hover:decoration-[#244737]">{children}</a>,
              strong: ({ children }) => <strong className="font-semibold text-[#1b211d]">{children}</strong>,
              blockquote: ({ children }) => <blockquote className="my-8 border-l-2 border-[#244737] bg-[#f5f7f4] px-5 py-4 text-[#314338] [&>p]:mt-0">{children}</blockquote>,
              ul: ({ children }) => <ul className="body-copy mt-5 list-disc space-y-2 pl-6 text-[#3f4642] md:leading-[1.75]">{children}</ul>,
              ol: ({ children }) => <ol className="body-copy mt-5 list-decimal space-y-2 pl-6 text-[#3f4642] md:leading-[1.75]">{children}</ol>,
              li: ({ children }) => <li className="pl-1">{children}</li>,
              table: ({ children }) => <div className="my-7 overflow-x-auto rounded-[2px] border border-[rgba(36,71,55,0.16)]"><table className="min-w-[660px] w-full border-collapse text-left text-[14px] leading-[1.55] text-[#3f4642]">{children}</table></div>,
              thead: ({ children }) => <thead className="bg-[#eef3ed] text-[#1b211d]">{children}</thead>,
              th: ({ children }) => <th className="border-b border-[rgba(36,71,55,0.16)] px-4 py-3 font-semibold">{children}</th>,
              td: ({ children }) => <td className="border-t border-[rgba(36,71,55,0.11)] px-4 py-3 align-top">{children}</td>,
              hr: () => <hr className="my-10 border-0 border-t border-[rgba(36,71,55,0.16)]" />,
            }}
          >
            {document}
          </ReactMarkdown>
        </div>
      </article>
    </section>
  )
}
