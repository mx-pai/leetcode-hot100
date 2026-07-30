import { Check, CheckCircle2, ChevronLeft, ChevronRight, Clipboard, ExternalLink, Menu } from 'lucide-react'
import { useState } from 'react'
import CodeBlock from './CodeBlock'
import GuideLinks from './GuideLinks'
import MarkdownContent from './MarkdownContent'
import { languages, primaryLanguages, type CodeMode, type Language, type Problem } from './types'

type Props = { problem: Problem; position: number; total: number; completed: boolean; onToggle:()=>void; onPrev:()=>void; onNext:()=>void; onMenu:()=>void }

export default function StudyWorkspace({problem:p, position, total, completed, onToggle, onPrev, onNext, onMenu}:Props){
  const [language,setLanguage]=useState<Language>('python')
  const [mode,setMode]=useState<CodeMode>('leetcode')
  const [copied,setCopied]=useState(false)
  const code=mode==='leetcode'?p.solutions[language]:p.acm_templates[language]
  const copy=async()=>{await navigator.clipboard.writeText(code);setCopied(true);window.setTimeout(()=>setCopied(false),1400)}
  return <main className='study-workspace'>
    <header className='study-header'>
      <button className='mobile-menu' onClick={onMenu} aria-label='打开导航'><Menu size={19}/></button>
      <div><span>LEETCODE HOT 100</span><strong>{position + 1} / {total}</strong></div>
      <nav><button onClick={onPrev} disabled={position===0}><ChevronLeft size={17}/>上一题</button><button onClick={onNext} disabled={position===total-1}>下一题<ChevronRight size={17}/></button></nav>
    </header>
    <section className='problem-heading'>
      <div className='problem-kicker'><span className={`pill ${p.difficulty}`}>{p.difficulty}</span><span>{p.category}</span><span>#{p.number}</span></div>
      <div className='title-row'><div><h1>{p.title}</h1><p>{p.en_name}</p></div><button className={`complete-button ${completed?'done':''}`} onClick={onToggle}>{completed?<CheckCircle2 size={18}/>:<span className='empty-check'/>}{completed?'已掌握':'标记掌握'}</button></div>
      <div className='heading-links'>
        <a className='official-link' href={p.link} target='_blank' rel='noreferrer'>查看 LeetCode 原题 <ExternalLink size={14}/></a>
        <GuideLinks problem={p}/>
      </div>
    </section>
    {Boolean(p.description)&&<section className='description-card'><span className='eyebrow'>PROBLEM</span><h2>题目描述</h2><MarkdownContent content={p.description}/></section>}
    <section className='recall-card'>
      <div className='card-number'>01</div><div><span className='eyebrow'>CORE RECALL</span><h2>核心思路</h2><MarkdownContent content={p.core_logic}/></div>
      <div className='complexity'><span>复杂度</span><MarkdownContent content={p.complexity}/></div>
    </section>
    <section className='code-card'>
      <div className='code-toolbar'>
        <div className='mode-tabs'><button className={mode==='leetcode'?'active':''} onClick={()=>setMode('leetcode')}>LeetCode</button><button className={mode==='acm'?'active':''} onClick={()=>setMode('acm')}>ACM 标准输入</button></div>
        <button className='copy-button' onClick={copy}>{copied?<Check size={15}/>:<Clipboard size={15}/>} {copied?'已复制':'复制代码'}</button>
      </div>
      <div className='language-tabs'>
        {languages.map((l) => (
          <button
            key={l.key}
            className={`${language === l.key ? 'active' : ''}${primaryLanguages.some((p) => p.key === l.key) ? '' : ' secondary'}`}
            onClick={() => setLanguage(l.key)}
          >
            {l.label}
          </button>
        ))}
      </div>
      {mode==='acm'&&<div className='protocol-note'><strong>输入协议</strong><MarkdownContent content={p.acm_protocols[language]}/></div>}
      <CodeBlock code={code} language={language}/>
    </section>
    <footer className='workspace-footer'><span>{p.tags.join(' · ')}</span><span>数据已本地保存</span></footer>
  </main>
}
