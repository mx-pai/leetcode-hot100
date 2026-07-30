import { ExternalLink } from 'lucide-react'
import type { Problem } from './types'

type Props = { problem: Problem }

export default function GuideLinks({ problem }: Props) {
  const guides = problem.guides ?? []
  if (!guides.length) return null

  return (
    <details className='guide-inline'>
      <summary>
        开源讲解 <em>{guides.length}</em>
      </summary>
      <ul className='guide-inline-list'>
        {guides.map((g) => (
          <li key={g.url}>
            <a href={g.url} target='_blank' rel='noreferrer'>
              <span>
                <strong>{g.label}</strong>
                <small>{g.note}</small>
              </span>
              <ExternalLink size={13} aria-hidden='true' />
            </a>
          </li>
        ))}
      </ul>
    </details>
  )
}
