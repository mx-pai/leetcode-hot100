import { Check, CheckCircle2, ChevronLeft, ChevronRight, Clipboard, ExternalLink, Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import CodeBlock from './CodeBlock'
import GuideLinks from './GuideLinks'
import MarkdownContent from './MarkdownContent'
import TypePractice from './TypePractice'
import { formatRecall } from './recall'
import { languages, primaryLanguages, type CodeMode, type Language, type Problem } from './types'

type Props = {
  problem: Problem
  position: number
  total: number
  completed: boolean
  onToggle: () => void
  onPrev: () => void
  onNext: () => void
  onMenu: () => void
}

/** Drop leading file-header comments so practice focuses on the algorithm body. */
function practiceTarget(code: string) {
  return code
    .replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '')
    .replace(/^(?:\s*\/\/[^\n]*\n)+/, '')
    .trim()
}

export default function StudyWorkspace({
  problem: p,
  position,
  total,
  completed,
  onToggle,
  onPrev,
  onNext,
  onMenu,
}: Props) {
  const [language, setLanguage] = useState<Language>('python')
  const [mode, setMode] = useState<CodeMode>('leetcode')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 800px)')
    const sync = () => {
      if (mq.matches && mode === 'practice') setMode('leetcode')
    }
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [mode])

  const viewCode = mode === 'acm' || mode === 'practice' ? p.acm_templates[language] : p.solutions[language]
  // 跟敲 = ACM 模板（含 IO），去掉文件头注释
  const practiceCode = practiceTarget(p.acm_templates[language] || '')
  const recall = formatRecall(p.core_logic, p.title, p.tags)
  const copy = async () => {
    await navigator.clipboard.writeText(mode === 'practice' ? practiceCode : viewCode)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <main className='study-workspace'>
      <section className='problem-heading'>
        <div className='problem-kicker'>
          <span className={`pill ${p.difficulty}`}>{p.difficulty}</span>
          <span>{p.category}</span>
          <span>#{p.number}</span>
          <span className='progress-inline'>
            {position + 1} / {total}
          </span>
        </div>
        <div className='title-row'>
          <div>
            <h1>{p.title}</h1>
            <p>{p.en_name}</p>
          </div>
          <button className={`complete-button ${completed ? 'done' : ''}`} onClick={onToggle}>
            {completed ? <CheckCircle2 size={18} /> : <span className='empty-check' />}
            {completed ? '已掌握' : '标记掌握'}
          </button>
        </div>
        <div className='heading-links'>
          <a className='official-link' href={p.link} target='_blank' rel='noreferrer'>
            查看 LeetCode 原题 <ExternalLink size={14} />
          </a>
          <GuideLinks problem={p} />
        </div>
      </section>

      {Boolean(p.description) && (
        <section className='description-card'>
          <span className='eyebrow'>PROBLEM</span>
          <h2>题目描述</h2>
          <MarkdownContent content={p.description} />
        </section>
      )}

      <section className='recall-card'>
        <div className='card-number'>01</div>
        <div className='recall-body'>
          <span className='eyebrow'>CORE RECALL</span>
          <h2>核心思路</h2>
          <MarkdownContent className='recall-md' content={recall || p.core_logic} />
          {Boolean(p.complexity) && (
            <div className='complexity-inline'>
              <span>复杂度</span>
              <MarkdownContent content={p.complexity} />
            </div>
          )}
        </div>
      </section>

      <section className='code-card'>
        <div className='code-toolbar'>
          <div className='mode-tabs'>
            <button className={mode === 'leetcode' ? 'active' : ''} onClick={() => setMode('leetcode')}>
              LeetCode
            </button>
            <button className={mode === 'acm' ? 'active' : ''} onClick={() => setMode('acm')}>
              ACM 标准输入
            </button>
            <button
              className={`practice-tab${mode === 'practice' ? ' active' : ''}`}
              onClick={() => setMode('practice')}
              title='对照 ACM 模板跟敲（Shift+Enter 偷看一行）'
            >
              跟敲 ACM
            </button>
          </div>
          {mode !== 'practice' && (
            <button className='copy-button' onClick={copy}>
              {copied ? <Check size={15} /> : <Clipboard size={15} />} {copied ? '已复制' : '复制代码'}
            </button>
          )}
        </div>
        <div className='language-tabs'>
          {languages.map((l) => (
            <button
              key={l.key}
              className={`${language === l.key ? 'active' : ''}${primaryLanguages.some((x) => x.key === l.key) ? '' : ' secondary'}`}
              onClick={() => setLanguage(l.key)}
            >
              {l.label}
            </button>
          ))}
        </div>
        {(mode === 'acm' || mode === 'practice') && (
          <div className='protocol-note'>
            <strong>输入协议</strong>
            <MarkdownContent content={p.acm_protocols[language]} />
          </div>
        )}
        {mode === 'practice' ? (
          <TypePractice code={practiceCode} resetKey={`${p.number}-${language}`} />
        ) : (
          <CodeBlock code={viewCode} language={language} />
        )}
      </section>

      <div className='study-dock' role='navigation' aria-label='题目切换'>
        <button type='button' className='dock-menu' onClick={onMenu}>
          <Menu size={16} />
          题库
        </button>
        <div className='dock-nav'>
          <button type='button' onClick={onPrev} disabled={position === 0}>
            <ChevronLeft size={16} />
            上一题
          </button>
          <span>
            {position + 1} / {total}
          </span>
          <button type='button' onClick={onNext} disabled={position === total - 1}>
            下一题
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </main>
  )
}
