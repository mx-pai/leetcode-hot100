import { Check, Search, X } from 'lucide-react'
import { categories, type Problem } from './types'

type Props = {
  problems: Problem[]; allProblems: Problem[]; current: number; category: string; query: string; difficulty: string
  completed: Set<string>; open: boolean
  onCurrent: (index: number) => void; onCategory: (value: string) => void
  onQuery: (value: string) => void; onDifficulty: (value: string) => void; onClose: () => void
}

export default function ProblemNav(props: Props) {
  return <aside className={`problem-nav ${props.open ? 'is-open' : ''}`}>
    <div className='nav-mobile-head'><strong>题目导航</strong><button onClick={props.onClose} aria-label='关闭导航'><X size={18}/></button></div>
    <div className='brand-block'><span className='brand-mark'>H100</span><div><strong>背题训练场</strong><small>RECALL · REPEAT · MASTER</small></div></div>
    <div className='progress-panel'>
      <div><span>完成进度</span><b>{props.completed.size}<i>/100</i></b></div>
      <div className='progress-track'><span style={{ width: `${props.completed.size}%` }}/></div>
    </div>
    <label className='search-box'><Search size={16}/><input value={props.query} onChange={e=>props.onQuery(e.target.value)} placeholder='搜索题号、名称或 slug'/></label>
    <div className='difficulty-filter'>
      {['全部','简单','中等','困难'].map(v=><button key={v} className={props.difficulty===v?'active':''} onClick={()=>props.onDifficulty(v)}>{v}</button>)}
    </div>
    <div className='category-list' aria-label='分类导航'>
      {categories.map(c=><button key={c} className={props.category===c?'active':''} onClick={()=>props.onCategory(c)}><span>{c}</span><em>{c==='全部'?props.allProblems.length:props.allProblems.filter(p=>p.category===c).length}</em></button>)}
    </div>
    <div className='problem-list'>
      {props.problems.map((p,i)=><button key={p.number} className={i===props.current?'active':''} onClick={()=>props.onCurrent(i)}>
        <span className={`status-dot ${props.completed.has(p.slug)?'done':''}`}>{props.completed.has(p.slug)&&<Check size={11}/>}</span>
        <span className='problem-label'><strong>{p.number}. {p.title}</strong><small>{p.en_name}</small></span>
        <i className={`difficulty ${p.difficulty}`}>{p.difficulty.slice(0,1)}</i>
      </button>)}
      {!props.problems.length&&<p className='empty-state'>没有匹配的题目</p>}
    </div>
  </aside>
}
