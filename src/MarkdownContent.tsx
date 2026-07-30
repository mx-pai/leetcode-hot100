import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = {
  content?: string
  className?: string
}

function normalizeMarkdown(content: string) {
  return content
    .replace(/\s+\|\s+\|\s+/g, ' |\n| ')
    .replace(/([：:])\s+(\|[^\n]+)/g, '$1\n\n$2')
    .replace(/([：:])\s*1\.\s+/g, '$1\n\n1. ')
    .replace(/([。；;])\s*(\d+)\.\s+/g, '$1\n$2. ')
    .replace(/\s+(\d+)\.\s+(?=\S)/g, '\n$1. ')
    .replace(/\|\s+(?=(最后|因此|然后|接着|返回|其中|注意))/g, '|\n\n')
}

export default function MarkdownContent({ content = '', className = '' }: Props) {
  return (
    <div className={`markdown-content ${className}`.trim()}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{normalizeMarkdown(content)}</ReactMarkdown>
    </div>
  )
}
