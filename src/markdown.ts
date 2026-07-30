/** LaTeX-ish tokens from scraped solution notes. */
export function cleanLatex(content: string): string {
  return content
    .replace(/HashMap>/g, 'HashMap')
    .replace(/times/g, '×')
    .replace(/([A-Za-z0-9)])×/g, '$1 ×')
    .replace(/×([A-Za-z0-9(])/g, '× $1')
    .replace(/\bgeq\b/g, '≥')
    .replace(/\bleq\b/g, '≤')
    .replace(/\bge\b/g, '≥')
    .replace(/\ble\b/g, '≤')
    .replace(/\blt\b/g, '<')
    .replace(/\bgt\b/g, '>')
    .replace(/\bdots\b/g, '…')
    .replace(/\binfty\b/g, '∞')
    .replace(/sumi=0\^n-1/g, 'Σ')
    .replace(/max(\d+)\s*≤\s*i\s*<\s*n/g, 'max($1≤i<n)')
}

/** Escape C++/Java generics so micromark won't treat them as HTML. */
export function escapeGenerics(content: string): string {
  // Skip already-escaped \<...\>
  return content.replace(/(?<!\\)<([A-Za-z_][\w\s,:*]*?)(?<!\\)>/g, '\\<$1\\>')
}

export function cleanAlgoText(content: string): string {
  return escapeGenerics(cleanLatex(content))
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Shape scraped prose into markdown-friendly blocks (lists / tables). */
export function normalizeMarkdown(content: string): string {
  let text = cleanAlgoText(content)
  if (!text) return ''

  // Inline pipe-tables → real GFM tables
  text = text
    .replace(/\s+\|\s+\|\s+/g, ' |\n| ')
    .replace(/([：:])\s+(\|[^\n]+)/g, '$1\n\n$2')
    .replace(/\|\s+(?=(最后|因此|然后|接着|返回|其中|注意))/g, '|\n\n')

  // "1. 2. 3." steps glued in one paragraph → ordered list
  text = text
    .replace(/([：:])\s*1\.\s+/g, '$1\n\n1. ')
    .replace(/([。；;])\s*(\d+)\.\s+/g, '$1\n$2. ')
    // Only split numbered steps, not decimals / versions
    .replace(/\s+(\d+)\.\s+(?=[\u4e00-\u9fffA-Za-z])/g, '\n$1. ')

  return text
}
