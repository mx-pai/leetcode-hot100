import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { normalizeMarkdown } from './markdown'

type Props = {
  content?: string
  className?: string
}

export default function MarkdownContent({ content = '', className = '' }: Props) {
  return (
    <div className={`markdown-content ${className}`.trim()}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{normalizeMarkdown(content)}</ReactMarkdown>
    </div>
  )
}
