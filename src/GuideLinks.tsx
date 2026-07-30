import { ExternalLink } from 'lucide-react'
import type { Problem } from './types'

type Guide = { label: string; note: string; href: string }

function guidesFor(problem: Problem): Guide[] {
  const n = problem.number.replace(/^0+/, '') || '0'
  return [
    {
      label: 'Doocs 题解',
      note: '中文开源题解 · 多语言实现',
      href: `https://leetcode.doocs.org/lc/${n}/`,
    },
    {
      label: 'NeetCode',
      note: '英文讲解 · 思路与复杂度',
      href: `https://neetcode.io/solutions/${problem.slug}`,
    },
    {
      label: 'walkccc.me',
      note: '开源题解站 · 清晰实现',
      href: `https://walkccc.me/LeetCode/problems/${n}/`,
    },
    {
      label: 'LeetCode 题解区',
      note: '社区高赞讲解',
      href: `https://leetcode.cn/problems/${problem.slug}/solutions/`,
    },
  ]
}

type Props = { problem: Problem }

export default function GuideLinks({ problem }: Props) {
  return (
    <section className='guide-card'>
      <div className='card-number'>02</div>
      <div>
        <span className='eyebrow'>OPEN GUIDES</span>
        <h2>开源讲解</h2>
        <p className='guide-lead'>跳转到公开题解站，对照思路与实现。</p>
        <ul className='guide-list'>
          {guidesFor(problem).map((g) => (
            <li key={g.href}>
              <a href={g.href} target='_blank' rel='noreferrer'>
                <span>
                  <strong>{g.label}</strong>
                  <small>{g.note}</small>
                </span>
                <ExternalLink size={14} aria-hidden='true' />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
