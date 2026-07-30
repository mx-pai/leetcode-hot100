import { useEffect, useMemo, useState } from 'react'
import ProblemNav from './ProblemNav'
import StudyWorkspace from './StudyWorkspace'
import { normalizeCategory, type Problem } from './types'

const STORE='leetcode-hot100-completed'

function Business() {
  const [data,setData]=useState<Problem[]>([])
  const [error,setError]=useState('')
  const [category,setCategory]=useState('全部')
  const [difficulty,setDifficulty]=useState('全部')
  const [query,setQuery]=useState('')
  const [current,setCurrent]=useState(0)
  const [navOpen,setNavOpen]=useState(false)
  const [completed,setCompleted]=useState<Set<string>>(()=>new Set(JSON.parse(localStorage.getItem(STORE)||'[]')))
  useEffect(()=>{fetch('./leetcode_data.json').then(r=>{if(!r.ok)throw new Error('数据请求失败');return r.json() as Promise<Problem[]>}).then(items=>setData(items.map(item=>({...item,category:normalizeCategory(item.category)})))).catch(()=>setError('题库加载失败，请刷新页面重试。'))},[])
  const visible=useMemo(()=>data.filter(p=>{
    const q=query.trim().toLowerCase()
    return (category==='全部'||p.category===category)&&(difficulty==='全部'||p.difficulty===difficulty)&&(!q||`${p.number} ${p.title} ${p.en_name} ${p.slug}`.toLowerCase().includes(q))
  }),[data,category,difficulty,query])
  useEffect(()=>setCurrent(0),[category,difficulty,query])
  const toggle=()=>{const p=visible[current];if(!p)return;const next=new Set(completed);if(next.has(p.slug)){next.delete(p.slug)}else{next.add(p.slug)}setCompleted(next);localStorage.setItem(STORE,JSON.stringify([...next]))}
  if(error)return <div className='load-state'>{error}</div>
  if(!data.length)return <div className='load-state'>正在整理 100 道题…</div>
  const problem=visible[current]
  return <div className='training-app'>
    <ProblemNav problems={visible} allProblems={data} current={current} category={category} query={query} difficulty={difficulty} completed={completed} open={navOpen} onCurrent={i=>{setCurrent(i);setNavOpen(false)}} onCategory={setCategory} onQuery={setQuery} onDifficulty={setDifficulty} onClose={()=>setNavOpen(false)}/>
    {problem?<StudyWorkspace problem={problem} position={current} total={visible.length} completed={completed.has(problem.slug)} onToggle={toggle} onPrev={()=>setCurrent(Math.max(0,current-1))} onNext={()=>setCurrent(Math.min(visible.length-1,current+1))} onMenu={()=>setNavOpen(true)}/>:<div className='no-result'>没有匹配题目，请调整筛选条件。</div>}
    {navOpen?<button className='nav-scrim' onClick={()=>setNavOpen(false)} aria-label='关闭导航'/>:null}
  </div>
}
export default Business
