import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c'
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp'
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go'
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java'
import objectivec from 'react-syntax-highlighter/dist/esm/languages/prism/objectivec'
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python'
import swift from 'react-syntax-highlighter/dist/esm/languages/prism/swift'
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Language } from './types'

SyntaxHighlighter.registerLanguage('python', python)
SyntaxHighlighter.registerLanguage('swift', swift)
SyntaxHighlighter.registerLanguage('objectivec', objectivec)
SyntaxHighlighter.registerLanguage('cpp', cpp)
SyntaxHighlighter.registerLanguage('c', c)
SyntaxHighlighter.registerLanguage('java', java)
SyntaxHighlighter.registerLanguage('go', go)
SyntaxHighlighter.registerLanguage('typescript', typescript)

const prismLang: Record<Language, string> = {
  python: 'python',
  swift: 'swift',
  oc: 'objectivec',
  cpp: 'cpp',
  c: 'c',
  java: 'java',
  go: 'go',
  typescript: 'typescript',
}

const wrapStyle = {
  whiteSpace: 'pre-wrap' as const,
  wordBreak: 'break-word' as const,
  overflowWrap: 'anywhere' as const,
}

/** Soft-break very long lines (esp. comment headers) so the panel never needs horizontal scroll. */
function softWrapCode(code: string, width = 88) {
  return code
    .split('\n')
    .map((line) => {
      if (line.length <= width) return line
      const chunks: string[] = []
      let rest = line
      const isStar = /^\s*\*/.test(line)
      const isSlash = /^\s*\/\//.test(line)
      while (rest.length > width) {
        let cut = rest.lastIndexOf(' ', width)
        if (cut < Math.floor(width * 0.45)) cut = width
        chunks.push(rest.slice(0, cut).trimEnd())
        const leftover = rest.slice(cut).trimStart()
        if (isStar) rest = ' * ' + leftover
        else if (isSlash) rest = '// ' + leftover
        else rest = leftover
      }
      if (rest) chunks.push(rest)
      return chunks.join('\n')
    })
    .join('\n')
}

type Props = {
  code: string
  language: Language
}

export default function CodeBlock({ code, language }: Props) {
  const display = softWrapCode(code)
  return (
    <div className='code-block-wrap'>
      <SyntaxHighlighter
        language={prismLang[language]}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '22px 25px',
          minHeight: 330,
          maxHeight: 520,
          overflow: 'auto',
          overflowX: 'hidden',
          background: '#20201f',
          borderRadius: 0,
          fontSize: 12,
          lineHeight: 1.75,
          fontFamily: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          ...wrapStyle,
        }}
        codeTagProps={{
          style: {
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            ...wrapStyle,
          },
        }}
        lineProps={{ style: wrapStyle }}
        showLineNumbers={false}
        wrapLongLines
        wrapLines
      >
        {display}
      </SyntaxHighlighter>
    </div>
  )
}
