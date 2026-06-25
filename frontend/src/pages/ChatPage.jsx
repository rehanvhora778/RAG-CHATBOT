import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { chatAPI } from '../api/chat'
import { documentsAPI } from '../api/documents'
import {
  Plus, Send, Trash2, Download, MessageSquare,
  BookOpen, Search, X, Bot, User, Sparkles, Copy, Check,
} from 'lucide-react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import Modal from '../components/common/Modal'
import { PageLoader } from '../components/common/LoadingSpinner'
import AnimatedButton from '../components/ui/AnimatedButton'
import AIThinkingLoader from '../components/ui/AIThinkingLoader'
import ParticleBackground from '../components/ui/ParticleBackground'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* clipboard unavailable */ }
  }
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span key="c" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1 text-success-400">
            <Check size={11} /> Copied
          </motion.span>
        ) : (
          <motion.span key="d" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1">
            <Copy size={11} /> Copy
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

function Avatar({ isUser }) {
  if (isUser) {
    return (
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-600 shadow-glow-sm">
        <User size={13} className="text-white" />
      </div>
    )
  }
  return (
    <div className="relative mt-0.5 h-7 w-7 shrink-0">
      <motion.span
        className="absolute inset-0 rounded-full bg-primary-500/40 blur-sm"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-ink-700 to-ink-800 ring-1 ring-primary-500/30">
        <Bot size={13} className="text-primary-300" />
      </div>
    </div>
  )
}

function StreamingMarkdown({ content, onTick }) {
  const [shown, setShown] = useState('')
  useEffect(() => {
    let i = 0
    const step = Math.max(3, Math.ceil(content.length / 250))
    const id = setInterval(() => {
      i += step
      setShown(content.slice(0, i))
      onTick?.()
      if (i >= content.length) { setShown(content); clearInterval(id) }
    }, 16)
    return () => clearInterval(id)
  }, [content])

  const done = shown.length >= content.length
  return (
    <div className="prose-chat">
      <ReactMarkdown>{shown}</ReactMarkdown>
      {!done && <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-blink rounded-sm bg-primary-400 align-middle" />}
    </div>
  )
}

function CitationBadge({ citation }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary-500/20 bg-primary-500/10 px-2 py-0.5 text-xs text-primary-300">
      <BookOpen size={9} />
      {citation.document_name} · p.{citation.page_number}
    </span>
  )
}

function Message({ msg, scrollToBottom }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`mb-5 flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <Avatar isUser={isUser} />
      <div className={`flex max-w-[78%] flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'rounded-tr-md bg-gradient-to-br from-primary-600 to-accent-600 text-white shadow-glow-sm'
              : 'rounded-tl-md border border-white/[0.07] bg-ink-800/80 text-zinc-200 backdrop-blur-sm'
          }`}
        >
          {isUser ? (
            <p>{msg.content}</p>
          ) : msg._animate ? (
            <StreamingMarkdown content={msg.content} onTick={scrollToBottom} />
          ) : (
            <div className="prose-chat"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
          )}
        </div>

        {!isUser && msg.sources?.length > 0 && (
          <div className="mt-1.5 px-1">
            <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              <BookOpen size={9} /> Sources · {msg.sources.length}
            </p>
            <div className="flex flex-wrap gap-1">
              {msg.sources.map((c, i) => <CitationBadge key={i} citation={c} />)}
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 px-1">
          {!isUser && <CopyButton text={msg.content} />}
          <span className="text-[10px] text-zinc-600">
            {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default function ChatPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [sessions, setSessions] = useState([])
  const [current, setCurrent] = useState(null)
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newChatOpen, setNewChatOpen] = useState(false)
  const [docs, setDocs] = useState([])
  const [selectedDocs, setSelectedDocs] = useState([])
  const [chatTitle, setChatTitle] = useState('')
  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const loadSessions = useCallback(() => {
    chatAPI.listSessions({ page_size: 50 }).then(res => setSessions(res.data.data || []))
  }, [])

  useEffect(() => { loadSessions() }, [loadSessions])

  useEffect(() => {
    if (!sessionId) { setCurrent(null); setMessages([]); return }
    setLoading(true)
    chatAPI.getSession(sessionId)
      .then(res => { setCurrent(res.data.data.session); setMessages(res.data.data.messages) })
      .catch(() => toast.error('Session not found.'))
      .finally(() => setLoading(false))
  }, [sessionId])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  useEffect(() => {
    if (!searchQ.trim()) { setSearchResults([]); return }
    const t = setTimeout(() => {
      setSearching(true)
      chatAPI.search({ q: searchQ, page_size: 10 })
        .then(res => setSearchResults(res.data.data || []))
        .finally(() => setSearching(false))
    }, 400)
    return () => clearTimeout(t)
  }, [searchQ])

  const openNewChat = async () => {
    const res = await documentsAPI.list({ page_size: 100 })
    const completed = (res.data.data || []).filter(d => d.status === 'completed')
    setDocs(completed); setSelectedDocs([]); setChatTitle(''); setNewChatOpen(true)
  }

  const createSession = async () => {
    if (!chatTitle.trim()) { toast.error('Enter a chat title.'); return }
    if (!selectedDocs.length) { toast.error('Select at least one document.'); return }
    try {
      const res = await chatAPI.createSession({ title: chatTitle, document_ids: selectedDocs })
      setNewChatOpen(false); loadSessions(); navigate(`/chat/${res.data.data.id}`)
      toast.success('Chat session created.')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create session.') }
  }

  const sendMessage = async () => {
    if (!question.trim() || sending || !sessionId) return
    const q = question.trim(); setQuestion(''); setSending(true)
    setMessages(m => [...m, { role: 'user', content: q, created_at: new Date().toISOString(), sources: [] }])
    try {
      const res = await chatAPI.sendMessage(sessionId, { question: q })
      const { answer, citations } = res.data.data
      setMessages(m => [...m, { role: 'assistant', content: answer, sources: citations, created_at: new Date().toISOString(), _animate: true }])
      loadSessions()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to get response.')
      setMessages(m => m.slice(0, -1))
    } finally { setSending(false); inputRef.current?.focus() }
  }

  const deleteSession = async id => {
    if (!confirm('Delete this chat session?')) return
    try {
      await chatAPI.deleteSession(id); toast.success('Session deleted.'); loadSessions()
      if (sessionId === id) navigate('/chat')
    } catch { toast.error('Delete failed.') }
  }

  const exportPDF = async () => {
    try {
      const res = await chatAPI.exportPDF(sessionId)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a'); a.href = url; a.download = `${current?.title || 'chat'}.pdf`; a.click()
      URL.revokeObjectURL(url); toast.success('PDF downloaded.')
    } catch { toast.error('Export failed.') }
  }

  const SessionItem = ({ s }) => (
    <div
      onClick={() => navigate(`/chat/${s.id}`)}
      className={`group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 transition-colors ${
        sessionId === s.id
          ? 'border border-primary-500/30 bg-primary-500/15 text-primary-200'
          : 'text-zinc-300 hover:bg-white/5'
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{s.title}</p>
        <p className="mt-0.5 text-xs text-zinc-600">{s.message_count} messages</p>
      </div>
      <button
        onClick={e => { e.stopPropagation(); deleteSession(s.id) }}
        className="flex h-6 w-6 items-center justify-center rounded-lg text-zinc-500 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
      >
        <Trash2 size={12} />
      </button>
    </div>
  )

  return (
    <div className="-m-6 flex h-full overflow-hidden">
      {/* Session sidebar */}
      <div className="flex w-64 shrink-0 flex-col border-r border-white/[0.06] bg-ink-900/60 backdrop-blur-xl">
        <div className="space-y-2 border-b border-white/[0.06] p-3">
          <AnimatedButton onClick={openNewChat} className="w-full">
            <Plus size={14} /> New Chat
          </AnimatedButton>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              className="input-field py-2 pl-9 text-xs"
              placeholder="Search chats…"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
            />
            {searchQ && (
              <button onClick={() => setSearchQ('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {searchQ ? (
            searching ? (
              <p className="py-6 text-center text-xs text-zinc-500">Searching…</p>
            ) : searchResults.length === 0 ? (
              <p className="py-6 text-center text-xs text-zinc-500">No results for &quot;{searchQ}&quot;</p>
            ) : searchResults.map(s => <SessionItem key={s.id} s={s} />)
          ) : sessions.length === 0 ? (
            <p className="py-10 text-center text-xs text-zinc-500">No sessions yet</p>
          ) : (
            sessions.map(s => <SessionItem key={s.id} s={s} />)
          )}
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {!sessionId ? (
          <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden p-10 text-center">
            <ParticleBackground count={22} />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10 mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 shadow-glow"
            >
              <Sparkles size={28} className="text-white" />
            </motion.div>
            <h3 className="relative z-10 font-display text-2xl font-bold">
              <span className="text-gradient-animated">Ask anything</span>
            </h3>
            <p className="relative z-10 mt-2 max-w-xs text-sm text-zinc-400">
              Choose a session from the sidebar or create a new chat grounded in your documents.
            </p>
            <AnimatedButton onClick={openNewChat} className="relative z-10 mt-6">
              <Plus size={15} /> New Chat
            </AnimatedButton>
          </div>
        ) : loading ? (
          <PageLoader label="Loading conversation" />
        ) : (
          <>
            {/* Chat header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] bg-ink-950/50 px-5 backdrop-blur-xl">
              <div className="min-w-0">
                <h3 className="truncate font-display text-sm font-semibold text-white">{current?.title}</h3>
                <p className="truncate text-xs text-zinc-500">{current?.document_names?.join(', ')}</p>
              </div>
              <AnimatedButton variant="secondary" size="sm" onClick={exportPDF}>
                <Download size={13} /> Export PDF
              </AnimatedButton>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {messages.length === 0 && (
                <div className="py-16 text-center text-zinc-500">
                  <Bot size={36} className="mx-auto mb-3 text-zinc-700" />
                  <p className="text-sm font-medium text-zinc-400">Ask anything about your documents</p>
                  <p className="mt-1 text-xs">I&apos;ll search through your files and answer with citations.</p>
                </div>
              )}
              {messages.map((msg, i) => <Message key={i} msg={msg} scrollToBottom={scrollToBottom} />)}
              <AnimatePresence>
                {sending && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-5 flex gap-3"
                  >
                    <Avatar isUser={false} />
                    <div className="rounded-2xl rounded-tl-md border border-white/[0.07] bg-ink-800/80 px-4 py-3 backdrop-blur-sm">
                      <AIThinkingLoader label="Searching your documents" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* Composer — Perplexity-style glowing ask box */}
            <div className="border-t border-white/[0.06] bg-ink-950/50 p-4 backdrop-blur-xl">
              <div className="flow-border rounded-2xl p-[1.5px]">
                <div className="flex items-end gap-2 rounded-2xl bg-ink-850/95 p-2 pl-4">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    className="max-h-40 flex-1 resize-none bg-transparent py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none"
                    placeholder="Ask anything about your documents…"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  />
                  <AnimatedButton
                    onClick={sendMessage}
                    disabled={!question.trim() || sending}
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-xl"
                  >
                    <Send size={16} />
                  </AnimatedButton>
                </div>
              </div>
              <p className="mt-2 text-center text-[10px] text-zinc-600">
                Enter to send · Shift+Enter for new line · Answers are grounded in your documents
              </p>
            </div>
          </>
        )}
      </div>

      {/* New Chat Modal */}
      <Modal open={newChatOpen} onClose={() => setNewChatOpen(false)} title="New Chat Session" size="md">
        <div className="space-y-4">
          <div>
            <label className="label">Chat Title</label>
            <input className="input-field" placeholder="e.g. Research Paper Analysis" value={chatTitle} onChange={e => setChatTitle(e.target.value)} />
          </div>
          <div>
            <label className="label">Select Documents ({selectedDocs.length} selected)</label>
            <div className="max-h-48 overflow-y-auto rounded-xl border border-white/10">
              {docs.length === 0 ? (
                <p className="p-5 text-center text-sm text-zinc-500">No completed documents. Upload and process one first.</p>
              ) : docs.map(d => (
                <label key={d.id} className="flex cursor-pointer items-center gap-3 border-b border-white/[0.05] px-4 py-2.5 last:border-0 hover:bg-white/5">
                  <input
                    type="checkbox"
                    checked={selectedDocs.includes(d.id)}
                    onChange={e => setSelectedDocs(prev => e.target.checked ? [...prev, d.id] : prev.filter(id => id !== d.id))}
                    className="accent-primary-500"
                  />
                  <span className="truncate text-sm text-zinc-300">{d.original_filename}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <AnimatedButton variant="secondary" onClick={() => setNewChatOpen(false)}>Cancel</AnimatedButton>
            <AnimatedButton onClick={createSession}>Create Session</AnimatedButton>
          </div>
        </div>
      </Modal>
    </div>
  )
}
