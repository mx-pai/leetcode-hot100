import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp'
import objectivec from 'react-syntax-highlighter/dist/esm/languages/prism/objectivec'
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python'
import swift from 'react-syntax-highlighter/dist/esm/languages/prism/swift'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Language } from './types'

SyntaxHighlighter.registerLanguage('python', python)
SyntaxHighlighter.registerLanguage('swift', swift)
SyntaxHighlighter.registerLanguage('objectivec', objectivec)
SyntaxHighlighter.registerLanguage('cpp', cpp)

const prismLang: Record<Language, string> = {
  python: 'python',
  swift: 'swift',
  oc: 'objectivec',
  cpp: 'cpp',
}

type Props = {
  code: string
  language: Language
}

export default function CodeBlock({ code, language }: Props) {
  return (
    <SyntaxHighlighter
      language={prismLang[language]}
      style={oneDark}
      customStyle={{
        margin: 0,
        padding: '22px 25px',
        minHeight: 330,
        maxHeight: 520,
        overflow: 'auto',
        background: '#20201f',
        borderRadius: 0,
        fontSize: 12,
        lineHeight: 1.75,
        fontFamily: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      }}
      codeTagProps={{
        style: {
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
        },
      }}
      showLineNumbers={false}
      wrapLongLines={false}
    >
      {code}
    </SyntaxHighlighter>
  )
}
