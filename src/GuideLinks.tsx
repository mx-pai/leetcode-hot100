import { ExternalLink } from 'lucide-react'
import type { Problem } from './types'

type Props = { problem: Problem }

export default function GuideLinks({ problem }: Props) {
  const guides = problem.guides ?? []
  if (!guides.length) return null

  return (
    <section className='guide-card'>
      <div className='card-number'>02</div>
      <div>
        <span className='eyebrow'>OPEN GUIDES</span>
        <h2>开源讲解</h2>
        <p className='guide-lead'>为本题检索到的公开讲解，可直接跳转对照。</p>
        <ul className='guide-list'>
          {guides.map((g) => (
            <li key={g.url}>
              <a href={g.url} target='_blank' rel='noreferrer'>
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
