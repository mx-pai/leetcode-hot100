export type Language = 'python' | 'swift' | 'oc' | 'cpp'
export type CodeMode = 'leetcode' | 'acm'

export interface GuideLink {
  label: string
  note: string
  url: string
}

export interface Problem {
  number: string
  title: string
  en_name: string
  slug: string
  difficulty: '简单' | '中等' | '困难'
  link: string
  category: string
  tags: string[]
  core_logic: string
  description?: string
  complexity: string
  acm_protocol: string
  acm_protocols: Record<Language, string>
  solutions: Record<Language, string>
  acm_templates: Record<Language, string>
  guides?: GuideLink[]
}

export const categories = ['全部', '哈希', '双指针', '滑动窗口', '子串', '普通数组', '矩阵', '链表', '二叉树', '图论', '回溯', '二分查找', '栈', '堆', '贪心', '动态规划', '多维动态规划', '技巧'] as const

const categoryAliases: Record<string, string> = {
  哈希表: '哈希',
  数组: '普通数组',
  图: '图论',
  '图/BFS/DFS': '图论',
  BFS: '图论',
  DFS: '图论',
  二分: '二分查找',
  DP: '动态规划',
  二维动态规划: '多维动态规划',
  位运算: '技巧',
}

export function normalizeCategory(value: string) {
  const key = value.trim()
  return categoryAliases[key] ?? key
}

export const languages: { key: Language; label: string }[] = [
  { key: 'python', label: 'Python' }, { key: 'swift', label: 'Swift' },
  { key: 'oc', label: 'Objective-C' }, { key: 'cpp', label: 'C++' },
]
