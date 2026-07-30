import { cleanLatex } from './markdown'

/** Turn dense core_logic prose into a memory-friendly markdown block. */
export function formatRecall(raw: string, title: string, tags: string[] = []): string {
  let text = cleanLatex(raw).replace(/[^\S\n]+/g, ' ').trim()
  if (!text) return ''

  text = text.replace(new RegExp(`^${escapeReg(title)}\\s*[：:]\\s*`), '')
  text = text.replace(/^[^：:\n]{1,24}[：:]\s*/, '')

  // Drop worked examples / markdown tables
  text = text
    .replace(/\s*以\s+[\s\S]*?为例[，,]?[\s\S]*?(?=最后|因此|返回|$)/, ' ')
    .replace(/\n?\s*\|[^\n]*\|[\s\S]*$/m, ' ')
    .replace(/[^\S\n]+/g, ' ')
    .trim()

  const method = tags[0]?.trim() || ''
  const mantra = tags[1]?.trim() || ''
  const steps = dedupeSteps(
    extractSteps(text)
      .map(compressStep)
      .filter((s) => s.length >= 4),
  )

  const tip = pickTip(steps)

  const lines: Array<string> = []
  if (method && mantra) lines.push(`**记法**：${method} — ${mantra}`)
  else if (method || mantra) lines.push(`**记法**：${method || mantra}`)
  if (lines.length) lines.push('')

  steps.slice(0, 6).forEach((step, i) => {
    lines.push(`${i + 1}. ${step}`)
  })

  if (tip) {
    lines.push('')
    lines.push(`> 记住：${tip}`)
  }
  return lines.join('\n')
}

function escapeReg(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function extractSteps(text: string): Array<string> {
  // Numbered list already present
  if (/\d+\.\s+\S/.test(text) && (text.match(/\d+\.\s+/g) || []).length >= 2) {
    const body = text.slice(Math.max(0, text.search(/\d+\.\s+/)))
    const items = body
      .split(/\d+\.\s+/)
      .map(tidyStep)
      .filter((s) => s.length >= 4)
    if (items.length >= 2) {
      const lastExtra = text.match(/(?:最后|因此)[^。]{4,40}。?/)
      if (lastExtra) {
        const extra = tidyStep(lastExtra[0])
        if (extra && !items.some((x) => x.includes(extra.slice(0, 10)))) items.push(extra)
      }
      return items.slice(0, 6)
    }
  }

  // Narrative sections + real dash bullets (not "i - 1")
  if (/\s-\s+(?=如果|若|当|否则|若是)/.test(text)) {
    const parts = text.split(/具体[^：:]*[：:]|判断逻辑如下[：:]?/)
    let headSteps = splitProse(parts[0] || '')
    // Merge "枚举 i" + "双指针 j/k" into one recall line when adjacent
    if (headSteps.length >= 2 && /枚举/.test(headSteps[0] + headSteps[1]) && /指针|双指针/.test(headSteps.join(' '))) {
      const merged: Array<string> = []
      for (let i = 0; i < headSteps.length; i++) {
        const a = headSteps[i]
        const b = headSteps[i + 1]
        if (b && /枚举/.test(a) && /指针|双指针|j =/.test(b)) {
          merged.push(compressStep(`${a}；${b}`))
          i++
        } else if (/跳过重复/.test(a)) {
          merged.push(a)
        } else {
          merged.push(a)
        }
      }
      headSteps = merged
    }
    headSteps = headSteps.slice(0, 2)

    const bulletBlock = parts.slice(1).join(' ') || text
    const chunks = bulletBlock
      .split(/\s-\s+(?=如果|若|当|否则|若是)/)
      .map(tidyStep)
      .filter((s) => s.length >= 4)
    // Comparison bullets look like "如果 x < 0 / 否则找到三元组"
    const rules = chunks
      .filter((s) => /^如果 x\b|^否则，?(?:说明)?(?:我们)?找到/.test(s))
      .map((s) =>
        s
          .replace(/^如果 x < 0[\s\S]*$/g, 'x<0 → j++')
          .replace(/^如果 x > 0[\s\S]*$/g, 'x>0 → k--')
          .replace(/^否则[\s\S]*$/g, 'x=0 → 收录并双指针内收去重'),
      )
    const preamble = chunks.find((s) => !/^如果 x\b|^否则，?(?:说明)?(?:我们)?找到/.test(s)) || ''
    const skipBits: Array<string> = []
    if (/nums\[i\] = nums\[i - 1\]/.test(preamble) || /跳过重复/.test(preamble)) skipBits.push('跳过重复 i')
    if (/nums\[i\] > 0/.test(preamble)) skipBits.push('nums[i]>0 结束')
    const skipLine = skipBits.join('；')

    return [...headSteps, ...(skipLine ? [skipLine] : []), ...rules].filter((s) => s.length >= 4).slice(0, 6)
  }

  return splitProse(text)
}

function splitProse(text: string): Array<string> {
  const marked = text
    .replace(/\s*(?=接下来|然后我们|然后，我们|具体|否则，我们|最后|遍历结束后|枚举结束后)/g, '。')
    .replace(/。+/g, '。')

  const parts = marked
    .split(/[。；;]+/)
    .map(tidyStep)
    .filter((s) => s.length >= 6)

  if (!parts.length) return text ? [text] : []
  if (parts.length <= 5) return parts
  return [...parts.slice(0, 4), parts.slice(4).join('；')]
}

function tidyStep(step: string) {
  return step
    .replace(/\|[\s\S]*$/, '')
    .replace(/\s+/g, ' ')
    .replace(/^[，,、\s]+/, '')
    .replace(/[。；;\s]+$/, '')
    .trim()
}

function compressStep(step: string) {
  return step
    // Strip narrative openers first, then subject pronouns
    .replace(/^接下来，?/, '')
    .replace(/^然后，?/, '')
    .replace(/^因此，?/, '')
    .replace(/^注意到，/, '')
    .replace(/注意到，/g, '')
    .replace(/^我们可以/, '')
    .replace(/^我们/, '')
    .replace(/题目不要求我们按照顺序返回三元组，因此我们不妨先/g, '先')
    .replace(/题目不要求[^，]{0,20}，因此[^先]{0,16}先/g, '先')
    .replace(/使用一个/g, '用')
    .replace(/使用两个/g, '用两个')
    .replace(/使用/g, '用')
    .replace(/来存储/g, '存')
    .replace(/存储/g, '存')
    .replace(/及其对应的索引/g, '→下标')
    .replace(/对应的索引/g, '下标')
    .replace(/分别指向/g, '指向')
    .replace(/记录当前待插入的位置/g, '记写入位')
    .replace(/用变量 ans 记录/g, '用 ans 记')
    .replace(/记录容器的最大容量/g, '记最大容量')
    .replace(/初始化为/g, '=')
    .replace(/初始时/g, '初值')
    .replace(/其中 n 是数组的长度[，,]?/g, '')
    .replace(/即 l = 0，而 r = n - 1[，,]?/g, 'l=0, r=n-1，')
    .replace(/对于当前元素 /g, '对 ')
    .replace(/对于每个 i，可以通过维护两个指针/g, '对每个 i，双指针')
    .replace(/我们可以通过维护两个指针/g, '双指针')
    .replace(/可以通过维护两个指针/g, '双指针')
    .replace(/我们首先判断/g, '查')
    .replace(/是否在哈希表 d 中，如果在 d 中，说明 target 值已经找到，返回/g, '已在表中 → 返回')
    .replace(/返回 target - nums\[i\] 的索引和 i 即可/g, '返回两下标')
    .replace(/返回 target - nums\[i\] 的索引和 i/g, '返回两下标')
    .replace(/并将其与 ans 进行比较，将较大值赋给 ans/g, '，更新 ans')
    .replace(/开始进行循环，每次循环中，我们?计算当前容器的容量，即/g, '循环：容量 =')
    .replace(/我们判断 height\[l\] 和 height\[r\] 的大小，如果 height\[l\] < height\[r\]，移动 r 指针不会使得结果变得更好，因为容器的高度由较短的那根垂直线决定，所以我们移动 l 指针/g, '矮边内收：height[l]<height[r] 则 l++，否则 r--')
    .replace(/判断 height\[l\] 和 height\[r\] 的大小，如果 height\[l\] < height\[r\]，移动 r 指针不会使得结果变得更好，因为容器的高度由较短的那根垂直线决定，所以我们移动 l 指针/g, '矮边内收：height[l]<height[r] 则 l++，否则 r--')
    .replace(/这样我们就可以保证/g, '保证')
    .replace(/从而找到满足/g, '找')
    .replace(/题目不要求我们按照顺序返回三元组，因此我们不妨先/g, '先')
    .replace(/不妨先/g, '先')
    .replace(/这样就可以方便地跳过重复的元素/g, '便于去重')
    .replace(/在枚举的过程中，我们需要跳过重复的元素，以避免出现重复的三元组/g, '枚举时跳过重复')
    .replace(/那么下标 i 位置能接的雨水量为/g, '接水量 =')
    .replace(/遍历数组，计算出 left\[i\] 和 right\[i\]，最后答案为/g, '预计算左右最高，答案 =')
    .replace(/定义 left\[i\] 表示下标 i 位置及其左边的最高柱子的高度，定义 right\[i\] 表示下标 i 位置及其右边的最高柱子的高度/g, 'left[i]/leftMax，right[i]/rightMax')
    .replace(/最后答案为/g, '答案 =')
    .replace(/最后返回哈希表的 value 列表即可/g, '返回哈希表的 value 列表')
    .replace(/最后返回答案 ans 即可/g, '返回 ans')
    .replace(/返回答案 ans 即可/g, '返回 ans')
    .replace(/即可得到三元组的答案/g, '得到全部三元组')
    .replace(/反之，我们移动 r 指针；遍历结束后，返回 ans/g, '返回 ans')
    .replace(/反之，移动 r 指针；遍历结束后，返回 ans/g, '返回 ans')
    .replace(/遍历数组 nums，每次遇到一个非零数，就将其与 nums\[k\] 交换，同时将 k 的值加 1/g, '遇非零与 nums[k] 交换，k++')
    .replace(/存入哈希表当中（HashMap>）/g, '存入哈希表')
    .replace(/得到一个新的字符串/g, '得到签名')
    .replace(/对每个字符串按照字符字典序排序/g, '对串内字符排序')
    .replace(/后续遍历得到相同 key 时，将其加入到对应的 value 当中即可。\s*/g, '相同 key 并入列表；')
    .replace(/即可$/, '')
    .replace(/，，/g, '，')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[，,；;\s]+$/, '')
}

function dedupeSteps(steps: Array<string>): Array<string> {
  const out: Array<string> = []
  for (const s of steps) {
    // Drop trailing "返回 ans" if previous step already covered the move rule
    if (/^返回 ans$/.test(s) && out.some((x) => /矮边内收|l\+\+|返回/.test(x))) continue
    if (out.some((x) => x === s || (s.length >= 16 && x.includes(s)) || (x.length >= 16 && s.includes(x)))) {
      const idx = out.findIndex((x) => x !== s && (x.includes(s) || s.includes(x)))
      if (idx >= 0 && s.length > out[idx].length) out[idx] = s
      continue
    }
    out.push(s)
  }
  return out
}

function pickTip(steps: Array<string>): string {
  for (let i = steps.length - 1; i >= 0; i--) {
    const s = steps[i]
    // Only keep crisp endings worth memorizing
    const hit = s.match(/返回(?:两下标|哈希表的 value 列表|ans|答案 ans)|接水量\s*=\s*[^，。；]{6,40}|答案\s*=\s*[^，。；]{6,40}/)
    if (hit) {
      const tip = hit[0].replace(/答案 ans/, 'ans').trim()
      if (tip.length >= 4 && tip.length <= 40) return tip
    }
  }
  return ''
}
