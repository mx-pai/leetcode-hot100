#!/usr/bin/env node
/**
 * Rebuild per-problem guide links from open-source indexes.
 * Requires local clones (optional) or uses CDN mirrors.
 * Usage: node scripts/build-guides.mjs
 *
 * Current data lives in public/leetcode_data.json under each problem's `guides`.
 * Re-run the Python collector in scripts/ when refreshing sources.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const problems = JSON.parse(readFileSync(resolve(root, 'public/leetcode_data.json'), 'utf8'))
const missing = problems.filter((p) => !Array.isArray(p.guides) || p.guides.length === 0)
const counts = problems.map((p) => (p.guides || []).length)
console.log(JSON.stringify({
  total: problems.length,
  withGuides: problems.length - missing.length,
  missing: missing.map((p) => p.slug),
  min: Math.min(...counts),
  max: Math.max(...counts),
  avg: Number((counts.reduce((a, b) => a + b, 0) / counts.length).toFixed(2)),
}, null, 2))
if (missing.length) process.exit(1)
