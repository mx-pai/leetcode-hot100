#!/usr/bin/env python3
"""Slim ACM templates: keep solution + minimal IO helpers only."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'public' / 'leetcode_data.json'

PY_LIST_NODE = '''class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next
'''

PY_BUILD_LIST = '''def build_list(values):
    dummy = ListNode()
    cur = dummy
    for value in values:
        cur.next = ListNode(value)
        cur = cur.next
    return dummy.next
'''

PY_DUMP_LIST = '''def dump_list(node):
    out, seen = [], set()
    while node and id(node) not in seen:
        seen.add(id(node))
        out.append(node.val)
        node = node.next
    return out
'''

PY_TREE_NODE = '''class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right
'''

PY_BUILD_TREE = '''def build_tree(values):
    if not values:
        return None
    from collections import deque
    it = iter(values)
    root_val = next(it)
    if root_val is None:
        return None
    root = TreeNode(root_val)
    queue = deque([root])
    for left in it:
        node = queue.popleft()
        if left is not None:
            node.left = TreeNode(left)
            queue.append(node.left)
        try:
            right = next(it)
        except StopIteration:
            break
        if right is not None:
            node.right = TreeNode(right)
            queue.append(node.right)
    return root
'''

PY_DUMP_TREE = '''def dump_tree(root):
    if not root:
        return []
    from collections import deque
    out, queue = [], deque([root])
    while queue:
        node = queue.popleft()
        if node is None:
            out.append(None)
            continue
        out.append(node.val)
        queue.extend((node.left, node.right))
    while out and out[-1] is None:
        out.pop()
    return out
'''

PY_NODE = '''class Node:
    def __init__(self, val=0, next=None, random=None):
        self.val, self.next, self.random = val, next, random
'''


def slim_python(code: str) -> str:
    pay = code.find('\npayload=')
    if pay < 0:
        pay = code.find('\npayload =')
    sol_idxs = [
        m.start() + 1
        for m in re.finditer(r'\nclass (Solution|LRUCache|MinStack|Trie|MedianFinder)\b', code)
        if pay < 0 or m.start() + 1 < pay
    ]
    # LRU-style helper Node (key/val), distinct from random-list Node in boilerplate
    for m in re.finditer(r'\nclass Node\b', code):
        if pay >= 0 and m.start() + 1 >= pay:
            continue
        snippet = code[m.start() : m.start() + 160]
        if 'key' in snippet and 'random' not in snippet:
            sol_idxs.append(m.start() + 1)
    if not sol_idxs:
        return code
    sol_start = min(sol_idxs)
    body = code[sol_start:pay if pay >= 0 else len(code)]
    main = (code[pay + 1:] if pay >= 0 else '').lstrip()
    body = re.sub(r'(?m)^# Definition for.*\n(?:#.*\n)*', '', body)
    body = re.sub(r'(?m)^# Your .* object will be instantiated.*\n(?:#.*\n)*', '', body)
    body = body.strip() + '\n'
    chunk = body + '\n' + main

    typing_names = [n for n in ('List', 'Optional', 'Dict', 'DefaultDict', 'Tuple', 'Set', 'Any') if n + '[' in body]
    imports: list[str] = []
    if typing_names:
        imports.append('from typing import ' + ', '.join(typing_names))
    if re.search(r'\bdeque\b|\bdefaultdict\b|\bCounter\b', body):
        cols = [n for n in ('deque', 'defaultdict', 'Counter') if n in body]
        imports.append('from collections import ' + ', '.join(cols))
    if 'heapq' in body:
        imports.append('import heapq')
    if 'bisect' in body:
        imports.append('import bisect')
    if re.search(r'\bmath\.', body):
        imports.append('import math')
    if '@cache' in body or 'lru_cache' in body or 'functools' in body:
        imports.append('from functools import cache, lru_cache')
    imports.extend(['import json', 'import sys'])

    parts = ['\n'.join(dict.fromkeys(imports)) + '\n\n']
    need_list_node = 'ListNode' in body or 'build_list' in chunk or 'dump_list' in chunk
    if need_list_node:
        parts.append(PY_LIST_NODE + '\n')
    if 'build_list' in chunk:
        parts.append(PY_BUILD_LIST + '\n')
    if 'dump_list' in chunk:
        parts.append(PY_DUMP_LIST + '\n')
    need_tree_node = 'TreeNode' in body or 'build_tree' in chunk or 'dump_tree' in chunk
    if need_tree_node:
        parts.append(PY_TREE_NODE + '\n')
    if 'build_tree' in chunk:
        parts.append(PY_BUILD_TREE + '\n')
    if 'dump_tree' in chunk:
        parts.append(PY_DUMP_TREE + '\n')
    if re.search(r'\bNode\b', body) and 'random' in body and 'class Node' not in body:
        parts.append(PY_NODE + '\n')
    parts.append(body)
    if main:
        parts.append('\n' + main.rstrip() + '\n')
    return ''.join(parts)


CPP_HEAD = '#include <bits/stdc++.h>\nusing namespace std;\n'
CPP_LIST = 'struct ListNode{int val;ListNode*next;ListNode(int x=0,ListNode*n=nullptr):val(x),next(n){}};\n'
CPP_TREE = 'struct TreeNode{int val;TreeNode*left,*right;TreeNode(int x=0):val(x),left(nullptr),right(nullptr){}};\n'
CPP_NODE = 'struct Node{int val;Node*next,*random;Node(int x=0):val(x),next(nullptr),random(nullptr){}};\n'
CPP_READ_VEC = 'template<class T> vector<T> readVec(){int n;cin>>n;vector<T>a(n);for(auto&x:a)cin>>x;return a;}\n'
CPP_READ_MAT = 'vector<vector<int>> readMatrix(){int r,c;cin>>r>>c;vector<vector<int>>a(r,vector<int>(c));for(auto&x:a)for(auto&y:x)cin>>y;return a;}\n'
CPP_READ_CMAT = 'vector<vector<char>> readCharMatrix(){int r,c;cin>>r>>c;vector<vector<char>>a(r,vector<char>(c));for(auto&x:a)for(auto&y:x)cin>>y;return a;}\n'
CPP_READ_LIST = 'ListNode* readList(){auto a=readVec<int>();ListNode d,*p=&d;for(int x:a)p=p->next=new ListNode(x);return d.next;}\n'
CPP_READ_TREE = 'TreeNode* readTree(){int n;cin>>n;if(!n)return nullptr;vector<string>a(n);for(auto&s:a)cin>>s;if(a[0]=="null")return nullptr;auto*r=new TreeNode(stoi(a[0]));queue<TreeNode*>q;q.push(r);int i=1;while(i<n){auto*p=q.front();q.pop();if(i<n&&a[i]!="null")q.push(p->left=new TreeNode(stoi(a[i])));i++;if(i<n&&a[i]!="null")q.push(p->right=new TreeNode(stoi(a[i])));i++;}return r;}\n'
CPP_PRINT = (
    'void printValue(int x){cout<<x;}\n'
    'void printValue(long long x){cout<<x;}\n'
    'void printValue(double x){cout<<x;}\n'
    'void printValue(bool x){cout<<(x?"true":"false");}\n'
    'void printValue(const string& s){cout<<s;}\n'
    'template<class T> void printValue(const vector<T>& a){cout<<"[";for(int i=0;i<(int)a.size();i++){if(i)cout<<",";printValue(a[i]);}cout<<"]";}\n'
)
CPP_PRINT_LIST = 'void printValue(ListNode* p){vector<int> a;while(p){a.push_back(p->val);p=p->next;}printValue(a);}\n'
CPP_PRINT_TREE = (
    'void printValue(TreeNode* p){if(!p){cout<<"[]";return;}vector<string> a;queue<TreeNode*> q;q.push(p);'
    'while(!q.empty()){auto* x=q.front();q.pop();if(!x){a.push_back("null");continue;}'
    'a.push_back(to_string(x->val));q.push(x->left);q.push(x->right);}'
    'while(!a.empty()&&a.back()=="null")a.pop_back();cout<<"[";for(int i=0;i<(int)a.size();i++){if(i)cout<<",";cout<<a[i];}cout<<"]";}\n'
)


def slim_cpp(code: str) -> str:
    m = None
    for pat in [
        r'class Solution\b',
        r'class LRUCache\b',
        r'class MinStack\b',
        r'class Trie\b',
        r'class MedianFinder\b',
    ]:
        found = list(re.finditer(pat, code))
        if found:
            m = found[-1]
            break
    if not m:
        return code
    body = code[m.start():]
    body = re.sub(r'/\*\*\s*\n\s*\* Your [\s\S]*?\*/\s*', '', body)
    main_m = re.search(r'\nint main\s*\(', body)
    if not main_m:
        return CPP_HEAD + '\n' + body
    sol = body[: main_m.start()].rstrip() + '\n'
    main = body[main_m.start() + 1 :]
    sol = re.sub(r'/\*\*[\s\S]*?Definition for[\s\S]*?\*/\s*', '', sol)

    parts = [CPP_HEAD]
    if 'ListNode' in sol or 'readList' in main:
        parts.append(CPP_LIST)
    if 'TreeNode' in sol or 'readTree' in main:
        parts.append(CPP_TREE)
    if re.search(r'\bNode\b', sol) and 'random' in sol:
        parts.append(CPP_NODE)
    if 'readVec' in main or 'readList' in main:
        parts.append(CPP_READ_VEC)
    if 'readMatrix' in main:
        parts.append(CPP_READ_MAT)
    if 'readCharMatrix' in main:
        parts.append(CPP_READ_CMAT)
    if 'readList' in main:
        parts.append(CPP_READ_LIST)
    if 'readTree' in main:
        parts.append(CPP_READ_TREE)
    if 'printValue' in main:
        parts.append(CPP_PRINT)
        if 'ListNode' in sol:
            parts.append(CPP_PRINT_LIST)
        if re.search(r'TreeNode\s*\*', sol) and 'readTree' in main:
            # return type tree
            ret = sol.split('{', 1)[0]
            if 'TreeNode' in ret and 'vector' not in ret:
                parts.append(CPP_PRINT_TREE)
    return ''.join(parts) + '\n' + sol + main


SWIFT_LIST = '''final class ListNode {
    var val: Int
    var next: ListNode?
    init(_ val: Int = 0, _ next: ListNode? = nil) { self.val = val; self.next = next }
}
func buildList(_ a: [Int]) -> ListNode? {
    let d = ListNode(0); var p = d
    for x in a { p.next = ListNode(x); p = p.next! }
    return d.next
}
func dumpList(_ head: ListNode?) -> [Int] {
    var out: [Int] = [], p = head
    while let n = p { out.append(n.val); p = n.next }
    return out
}
'''

SWIFT_TREE = '''final class TreeNode {
    var val: Int
    var left: TreeNode?
    var right: TreeNode?
    init(_ val: Int = 0) { self.val = val }
}
func buildTree(_ a: [Any]) -> TreeNode? {
    guard !a.isEmpty, !(a[0] is NSNull) else { return nil }
    let root = TreeNode((a[0] as! NSNumber).intValue)
    var q = [root], head = 0, i = 1
    while head < q.count && i < a.count {
        let n = q[head]; head += 1
        if !(a[i] is NSNull) { n.left = TreeNode((a[i] as! NSNumber).intValue); q.append(n.left!) }
        i += 1
        if i < a.count && !(a[i] is NSNull) { n.right = TreeNode((a[i] as! NSNumber).intValue); q.append(n.right!) }
        i += 1
    }
    return root
}
'''


def _strip_block_comments(code: str) -> str:
    return re.sub(r'/\*[\s\S]*?\*/', '', code)


def _swift_class_end(code: str, start: int) -> int:
    i = code.find('{', start)
    if i < 0:
        return len(code)
    depth = 0
    for j in range(i, len(code)):
        ch = code[j]
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                return j + 1
    return len(code)


def slim_swift(code: str) -> str:
    original = code
    cleaned = _strip_block_comments(code)
    class_m = None
    for pat in [
        r'final class Solution\b',
        r'class Solution\b',
        r'final class LRUCache\b',
        r'class LRUCache\b',
        r'final class MinStack\b',
        r'final class Trie\b',
        r'final class MedianFinder\b',
        r'class ReverseLinkedList\b',
        r'final class ReverseLinkedList\b',
        r'class [A-Z][A-Za-z0-9_]+\b',
    ]:
        ms = list(re.finditer(pat, cleaned))
        # skip helper classes
        ms = [m for m in ms if m.group(0).split()[-1] not in {'ListNode', 'TreeNode', 'Node', 'LRUCacheNode'}]
        if ms:
            class_m = ms[-1]
            break
    if not class_m:
        return original

    # Map position from cleaned back approximately by searching the class signature in original without comments
    sig = class_m.group(0)
    # Find in cleaned and extract
    class_end = _swift_class_end(cleaned, class_m.start())
    body = cleaned[class_m.start():class_end].rstrip() + '\n'
    after = cleaned[class_end:].strip()

    helper_blocks: list[str] = []
    while True:
        hm = re.search(r'(?m)^(final |fileprivate )?class [A-Z][A-Za-z0-9_]*\b', after)
        if not hm:
            break
        end = _swift_class_end(after, hm.start())
        helper_blocks.append(after[hm.start():end].strip())
        after = (after[: hm.start()] + after[end:]).strip()

    uses_list = 'buildList' in after or 'dumpList' in after
    uses_tree = 'buildTree' in after or 'dumpTree' in after

    parts = ['import Foundation\n\n']
    if uses_list:
        parts.append(SWIFT_LIST + '\n')
    elif re.search(r'\bListNode\b', body):
        parts.append(
            'final class ListNode {\n'
            '    var val: Int\n'
            '    var next: ListNode?\n'
            '    init(_ val: Int = 0, _ next: ListNode? = nil) { self.val = val; self.next = next }\n'
            '}\n\n'
        )
    if uses_tree:
        parts.append(SWIFT_TREE + '\n')
    elif re.search(r'\bTreeNode\b', body):
        parts.append(
            'final class TreeNode {\n'
            '    var val: Int\n'
            '    var left: TreeNode?\n'
            '    var right: TreeNode?\n'
            '    init(_ val: Int = 0) { self.val = val }\n'
            '}\n\n'
        )
    for hb in helper_blocks:
        parts.append(hb + '\n\n')

    parts.append(body)
    io = [
        'let input = FileHandle.standardInput.readDataToEndOfFile()',
        'let payload = try! JSONSerialization.jsonObject(with: input) as! [String: Any]',
    ]
    if after:
        for line in after.splitlines():
            s = line.strip()
            if not s:
                continue
            if s.startswith('import ') or s.startswith('final class ListNode') or s.startswith('final class TreeNode') or s.startswith('func build'):
                continue
            if 'FileHandle.standardInput' in s or 'JSONSerialization.jsonObject' in s:
                continue
            io.append(s)
    parts.append('\n' + '\n'.join(io) + '\n')
    return ''.join(parts)


def slim_oc(code: str) -> str:
    # Keep includes + real code; drop English problem narratives and stats footers.
    lines = code.splitlines()
    out: list[str] = []
    skipping = False
    for line in lines:
        s = line.strip()
        if skipping:
            if '*/' in s:
                skipping = False
            continue
        if s.startswith('/*') and not s.endswith('*/'):
            # keep short technical notes, drop long problem statements
            skipping = True
            continue
        if s.startswith('/*') and s.endswith('*/'):
            continue
        if s.startswith('Difficulty:') or s.startswith('Total Accepted:') or s.startswith('Total Submissions:') or s.startswith('Companies '):
            continue
        out.append(line)
    text = '\n'.join(out)
    # Remove #if 0 ... #else brute-force blocks, keep #else branch content loosely
    text = re.sub(r'#if\s+0[\s\S]*?#else\s*', '', text)
    text = re.sub(r'#endif\s*', '', text)
    # Collapse excess blank lines
    text = re.sub(r'\n{3,}', '\n\n', text).strip() + '\n'
    return text


def main() -> None:
    problems = json.loads(DATA.read_text())
    stats = {}
    for lang, fn in [('python', slim_python), ('cpp', slim_cpp), ('swift', slim_swift), ('oc', slim_oc)]:
        before = sum(len(p['acm_templates'][lang]) for p in problems)
        for p in problems:
            p['acm_templates'][lang] = fn(p['acm_templates'][lang])
        after = sum(len(p['acm_templates'][lang]) for p in problems)
        stats[lang] = (before, after)

    DATA.write_text(json.dumps(problems, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for lang, (b, a) in stats.items():
        print(f'{lang}: {b} -> {a} ({a * 100 // b}%)')

    sample = next(p for p in problems if p['slug'] == 'two-sum')
    print('\n=== python two-sum ===\n', sample['acm_templates']['python'])
    print('\n=== cpp two-sum ===\n', sample['acm_templates']['cpp'])


if __name__ == '__main__':
    main()
