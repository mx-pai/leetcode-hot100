import { Eye, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'

type Props = {
  code: string
  resetKey: string
}

function normalizeTarget(code: string) {
  return code.replace(/\r\n/g, '\n').replace(/\t/g, '    ').replace(/\s+$/g, '')
}

export default function TypePractice({ code, resetKey }: Props) {
  const target = useMemo(() => normalizeTarget(code), [code])
  const [cursor, setCursor] = useState(0)
  const [wrong, setWrong] = useState(false)
  const [peekAt, setPeekAt] = useState(-1)
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCursor(0)
    setWrong(false)
    setPeekAt(-1)
  }, [resetKey, target])

  useEffect(() => {
    stageRef.current?.focus()
  }, [resetKey, target])

  const done = cursor >= target.length && target.length > 0
  const progress = target.length ? Math.min(100, Math.round((cursor / target.length) * 100)) : 0

  const peekLine = () => {
    if (done || !target) return
    const from = cursor
    let end = target.indexOf('\n', from)
    if (end < 0) end = target.length
    else end += 1
    setPeekAt(end)
    setCursor(end)
    setWrong(false)
  }

  const reset = () => {
    setCursor(0)
    setWrong(false)
    setPeekAt(-1)
    stageRef.current?.focus()
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      reset()
      return
    }
    // Shift+Enter → 偷看一行
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      peekLine()
      return
    }
    if (done) return
    if (e.key === 'Tab') {
      e.preventDefault()
      let n = 0
      while (target[cursor + n] === ' ' && n < 8) n++
      if (n > 0) {
        setCursor(cursor + n)
        setWrong(false)
      } else {
        setWrong(true)
      }
      return
    }
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (cursor > 0) {
        setCursor(cursor - 1)
        setWrong(false)
        if (peekAt >= 0 && cursor - 1 < peekAt) setPeekAt(-1)
      }
      return
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return
    if (e.key === 'Enter') {
      e.preventDefault()
      if (target[cursor] === '\n') {
        setCursor(cursor + 1)
        setWrong(false)
      } else {
        setWrong(true)
      }
      return
    }
    if (e.key.length !== 1) return
    e.preventDefault()
    if (target[cursor] === e.key) {
      setCursor(cursor + 1)
      setWrong(false)
    } else {
      setWrong(true)
    }
  }

  const typed = target.slice(0, cursor)
  const current = target[cursor] ?? ''
  const rest = target.slice(cursor + (current ? 1 : 0))

  return (
    <div className='type-practice'>
      <div className='type-practice-bar'>
        <span className='type-practice-progress'>
          {done ? '完成' : `${progress}%`}
          <i style={{ width: `${progress}%` }} />
        </span>
        <div className='type-practice-actions'>
          <button type='button' onClick={peekLine} disabled={done} title='Shift+Enter'>
            <Eye size={14} /> 偷看一行
            <kbd>⇧↵</kbd>
          </button>
          <button type='button' onClick={reset}>
            <RotateCcw size={14} /> 重置
          </button>
        </div>
      </div>
      <div
        ref={stageRef}
        className={`type-practice-stage${wrong ? ' is-wrong' : ''}${done ? ' is-done' : ''}`}
        tabIndex={0}
        role='textbox'
        aria-label='跟敲练习区，直接打字'
        onKeyDown={onKeyDown}
      >
        <pre>
          <span className='typed'>{typed}</span>
          {!done && (
            <span className={`caret${wrong ? ' bad' : ''}`}>{current === '\n' ? '↵\n' : current || ' '}</span>
          )}
          <span className='ghost'>{rest}</span>
        </pre>
        {!target && <p className='type-practice-empty'>本题暂无该语言 ACM 模板</p>}
      </div>
      <p className='type-practice-hint'>ACM 题解跟敲 · Tab 缩进 · Enter 换行 · Shift+Enter 偷看一行 · Esc 重置</p>
    </div>
  )
}
