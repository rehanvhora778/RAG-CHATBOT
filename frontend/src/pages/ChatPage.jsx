import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { chatAPI } from '../api/chat'
import { documentsAPI } from '../api/documents'
import {
  Plus, Send, Trash2, Download, MessageSquare,
  BookOpen, Search, X, Bot, User,
} from 'lucide-react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import Modal from '../components/common/Modal'
import { PageLoader } from '../components/common/LoadingSpinner'

function CitationBadge({ citation }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 px-2 py-0.5 rounded-full border border-primary-100 dark:border-primary-800">
      <BookOpen size={9} />
      {citation.document_name} · p.{citation.page_number}
    </span>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 mb-5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        isUser ? 'bg-gradient-to-br from-primary-500 to-violet-600' : 'bg-zinc-100 dark:bg-zinc-800'
      }`}>
        {isUser ? <User size={13} className="text-white" /> : <Bot size={13} className="text-zinc-500 dark:text-zinc-400" />}
      </div>

      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-gradient-to-br from-primary-600 to-violet-600 text-white rounded-tr-md shadow-glow-sm'
            : 'bg-white dark:bg-zinc-800/80 border border-zinc-100 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-tl-md shadow-sm'
        }`}>
          {isUser ? (
            <p>{msg.content}</p>
          ) : (
            <div className="prose-chat">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && msg.sources?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5 px-1">
            {msg.sources.map((c, i) => <CitationBadge key={i} citation={c} />)}
          </div>
        )}

        <span className="text-[10px] text-zinc-400 px-1">
          {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </span>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { sessionId } = useParams()
  const navigate      = useNavigate()

  const [sessions,  setSessions]  = useState([])
  const [current,   setCurrent]   = useState(null)
  const [messages,  setMessages]  = useState([])
  const [question,  setQuestion]  = useState('')
  const [sending,   setSending]   = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [newChatOpen, setNewChatOpen] = useState(false)
  const [docs,      setDocs]      = useState([])
  const [selectedDocs, setSelectedDocs] = useState([])
  const [chatTitle, setChatTitle] = useState('')
  const [searchQ,   setSearchQ]   = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

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

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

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
      setMessages(m => [...m, { role: 'assistant', content: answer, sources: citations, created_at: new Date().toISOString() }])
      loadSessions()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to get response.')
      setMessages(m => m.slice(0, -1))
    } finally { setSending(false); inputRef.current?.focus() }
  }

  const deleteSession = async id => {
    if (!confirm('Delete this chat session?')) return
    try { await chatAPI.deleteSession(id); toast.success('Session deleted.'); loadSessions(); if (sessionId === id) navigate('/chat') }
    catch { toast.error('Delete failed.') }
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
    <div key={s.id} onClick={() => navigate(`/chat/${s.id}`)}
      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
        sessionId === s.id
          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
      }`}>
      <div className="min-w-0 flex-1">
        <p className="text-sm truncate font-medium">{s.title}</p>
        <p className="text-xs text-zinc-400 mt-0.5">{s.message_count} messages</p>
      </div>
      <button onClick={e => { e.stopPropagation(); deleteSession(s.id) }}
        className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-all">
        <Trash2 size={12} />
      </button>
    </div>
  )

  return (
    <div className="flex h-full -m-6 overflow-hidden">

      {/* Session sidebar */}
      <div className="w-64 border-r border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 flex flex-col shrink-0">
        <div className="p-3 border-b border-zinc-100 dark:border-zinc-800/80 space-y-2">
          <button onClick={openNewChat} className="btn-primary w-full">
            <Plus size={14} /> New Chat
          </button>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input className="input-field pl-9 text-xs py-2" placeholder="Search chats…" value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            {searchQ && (
              <button onClick={() => setSearchQ('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {searchQ ? (
            searching ? (
              <p className="text-xs text-zinc-400 text-center py-6">Searching…</p>
            ) : searchResults.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-6">No results for "{searchQ}"</p>
            ) : searchResults.map(s => <SessionItem key={s.id} s={s} />)
          ) : (
            sessions.length === 0
              ? <p className="text-xs text-zinc-400 text-center py-10">No sessions yet</p>
              : sessions.map(s => <SessionItem key={s.id} s={s} />)
          )}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        {!sessionId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-glow mb-5">
              <MessageSquare size={28} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Start a conversation</h3>
            <p className="text-sm text-zinc-400 mt-2 max-w-xs">
              Choose a session from the sidebar or create a new chat with your documents.
            </p>
            <button onClick={openNewChat} className="btn-primary mt-6">
              <Plus size={15} /> New Chat
            </button>
          </div>
        ) : loading ? <PageLoader /> : (
          <>
            {/* Chat header */}
            <div className="shrink-0 h-14 border-b border-zinc-100 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-between px-5">
              <div className="min-w-0">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm truncate">{current?.title}</h3>
                <p className="text-xs text-zinc-400 truncate">{current?.document_names?.join(', ')}</p>
              </div>
              <button onClick={exportPDF} className="btn-secondary text-xs py-1.5 gap-1.5">
                <Download size={13} /> Export PDF
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {messages.length === 0 && (
                <div className="text-center py-16 text-zinc-400">
                  <Bot size={36} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Ask anything about your documents</p>
                  <p className="text-xs mt-1">I'll search through your files and answer with citations.</p>
                </div>
              )}
              {messages.map((msg, i) => <Message key={i} msg={msg} />)}
              {sending && (
                <div className="flex gap-3 mb-5">
                  <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={13} className="text-zinc-500" />
                  </div>
                  <div className="bg-white dark:bg-zinc-800/80 border border-zinc-100 dark:border-zinc-700 px-4 py-3 rounded-2xl rounded-tl-md shadow-sm">
                    <div className="flex gap-1 items-center">
                      {[0, 150, 300].map(d => (
                        <div key={d} className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-zinc-100 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-4">
              <div className="flex gap-3 items-end">
                <textarea ref={inputRef} className="input-field flex-1 resize-none" rows={2}
                  placeholder="Ask a question about your documents…"
                  value={question} onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                />
                <button onClick={sendMessage} disabled={!question.trim() || sending} className="btn-primary self-end h-[52px] px-5">
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1.5">Enter to send · Shift+Enter for new line</p>
            </div>
          </>
        )}
      </div>

      {/* New Chat Modal */}
      <Modal open={newChatOpen} onClose={() => setNewChatOpen(false)} title="New Chat Session" size="md">
        <div className="space-y-4">
          <div>
            <label className="label">Chat Title</label>
            <input className="input-field" placeholder="e.g. Research Paper Analysis"
              value={chatTitle} onChange={e => setChatTitle(e.target.value)} />
          </div>
          <div>
            <label className="label">Select Documents ({selectedDocs.length} selected)</label>
            <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl max-h-48 overflow-y-auto">
              {docs.length === 0 ? (
                <p className="text-sm text-zinc-400 p-5 text-center">No completed documents. Upload and process one first.</p>
              ) : docs.map(d => (
                <label key={d.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                  <input type="checkbox" checked={selectedDocs.includes(d.id)}
                    onChange={e => setSelectedDocs(prev => e.target.checked ? [...prev, d.id] : prev.filter(id => id !== d.id))}
                    className="rounded border-zinc-300 accent-primary-600" />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">{d.original_filename}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button onClick={() => setNewChatOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={createSession} className="btn-primary">Create Session</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
