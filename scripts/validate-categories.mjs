import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const typeSource = readFileSync(resolve(root, 'src/types.ts'), 'utf8')
const match = typeSource.match(/export const categories = \[([^\]]+)] as const/)
if (!match) throw new Error('无法读取前端 categories')

const categoryKeys = [...match[1].matchAll(/'([^']+)'/g)].map(item => item[1]).filter(item => item !== '全部')
const problems = JSON.parse(readFileSync(resolve(root, 'public/leetcode_data.json'), 'utf8'))
const counts = Object.fromEntries(categoryKeys.map(key => [key, problems.filter(problem => problem.category === key).length]))
const unknown = [...new Set(problems.map(problem => problem.category).filter(category => !categoryKeys.includes(category)))]
const missing = categoryKeys.filter(key => counts[key] === 0)

if (problems.length !== 100 || unknown.length || missing.length) {
  console.error({ total: problems.length, counts, unknown, missing })
  process.exit(1)
}

console.log(JSON.stringify({ total: problems.length, counts }, null, 2))
