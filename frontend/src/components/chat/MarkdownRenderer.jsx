import { useState, memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, Lightbulb, Info, AlertTriangle, AlertCircle } from 'lucide-react'

/* ── Register only the languages we care about (keeps the bundle small) ── */
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python'
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript'
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx'
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx'
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash'
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json'
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql'
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java'
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css'
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup'
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp'
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c'
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp'
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go'
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust'
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml'

const LANGS = { python, javascript, typescript, jsx, tsx, bash, json, sql, java, css, markup, cpp, c, csharp, go, rust, yaml }
Object.entries(LANGS).forEach(([name, def]) => SyntaxHighlighter.registerLanguage(name, def))
const ALIASES = { py: python, js: javascript, ts: typescript, sh: bash, shell: bash, html: markup, xml: markup, 'c++': cpp, cs: csharp, yml: yaml }
Object.entries(ALIASES).forEach(([name, def]) => SyntaxHighlighter.registerLanguage(name, def))

const MONO = "'JetBrains Mono','Geist Mono',ui-monospace,SFMono-Regular,Menlo,monospace"

/* ── Fenced code block with language label + copy button ── */
function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* clipboard unavailable */ }
  }
  return (
    <div className="my-3.5 overflow-hidden rounded-xl border border-white/10 bg-[#0b0b12] shadow-sm">
      <div className="flex items-center justify-between border-b border-white/[0.07] bg-white/[0.03] px-3.5 py-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">{language || 'code'}</span>
        <button
          onClick={copy}
          className="export-hide inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100"
        >
          {copied ? <><Check size={12} className="text-success-400" /> Copied</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{ margin: 0, background: 'transparent', padding: '0.95rem 1.05rem', fontSize: '0.8rem', lineHeight: 1.65 }}
        codeTagProps={{ style: { fontFamily: MONO } }}
        PreTag="div"
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
}

/* ── Recursively pull plain text out of markdown children ── */
function nodeText(node) {
  if (node == null) return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join('')
  if (node.props?.children) return nodeText(node.props.children)
  return ''
}

const CALLOUTS = {
  tip:       { Icon: Lightbulb,     border: 'border-emerald-400/60', bg: 'bg-emerald-500/[0.07]', icon: 'text-emerald-400' },
  note:      { Icon: Info,          border: 'border-sky-400/60',     bg: 'bg-sky-500/[0.07]',     icon: 'text-sky-400' },
  info:      { Icon: Info,          border: 'border-sky-400/60',     bg: 'bg-sky-500/[0.07]',     icon: 'text-sky-400' },
  warning:   { Icon: AlertTriangle, border: 'border-amber-400/60',   bg: 'bg-amber-500/[0.07]',   icon: 'text-amber-400' },
  caution:   { Icon: AlertTriangle, border: 'border-amber-400/60',   bg: 'bg-amber-500/[0.07]',   icon: 'text-amber-400' },
  important: { Icon: AlertCircle,   border: 'border-primary-400/60', bg: 'bg-primary-500/[0.08]',  icon: 'text-primary-400' },
}

/* ── Blockquote → smart callout (Tip / Note / Warning / Important) ── */
function Callout({ children }) {
  const text = nodeText(children).trim().toLowerCase()
  const key = Object.keys(CALLOUTS).find(k => text.startsWith(k))
  const cfg = key ? CALLOUTS[key] : { Icon: Info, border: 'border-primary-400/50', bg: 'bg-white/[0.04]', icon: 'text-primary-400' }
  const { Icon } = cfg
  return (
    <blockquote className={`my-3.5 rounded-xl border-l-4 ${cfg.border} ${cfg.bg} py-2.5 pl-3.5 pr-4`}>
      <div className="flex gap-2.5">
        <Icon size={16} className={`mt-0.5 shrink-0 ${cfg.icon}`} />
        <div className="callout-body min-w-0 flex-1">{children}</div>
      </div>
    </blockquote>
  )
}

const COMPONENTS = {
  pre({ children }) {
    const codeEl = Array.isArray(children) ? children[0] : children
    const className = codeEl?.props?.className || ''
    const match = /language-(\w+)/.exec(className)
    const raw = codeEl?.props?.children
    const value = (Array.isArray(raw) ? raw.join('') : String(raw ?? '')).replace(/\n$/, '')
    return <CodeBlock language={match?.[1]?.toLowerCase() || ''} value={value} />
  },
  code({ children, ...props }) {
    return <code {...props}>{children}</code>
  },
  table({ children }) {
    return (
      <div className="my-3.5 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full border-collapse text-left text-sm">{children}</table>
      </div>
    )
  },
  blockquote({ children }) {
    return <Callout>{children}</Callout>
  },
  a({ children, href }) {
    return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
  },
}

function MarkdownRenderer({ content }) {
  return (
    <div className="prose-chat">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
        {content || ''}
      </ReactMarkdown>
    </div>
  )
}

export default memo(MarkdownRenderer)
