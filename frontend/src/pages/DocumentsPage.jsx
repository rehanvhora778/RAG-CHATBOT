import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { documentsAPI } from '../api/documents'
import {
  Upload, Trash2, FileText, RefreshCw, Eye,
  CheckCircle, Clock, XCircle, Loader, CloudUpload, FileType2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/common/Modal'
import AnimatedButton from '../components/ui/AnimatedButton'
import GlassCard from '../components/ui/GlassCard'
import LoadingSkeleton, { SkeletonDocCard } from '../components/ui/LoadingSkeleton'

const STATUS_META = {
  completed:  { icon: <CheckCircle size={12} className="text-success-400" />, badge: 'bg-success-500/15 text-success-400', label: 'completed' },
  processing: { icon: <Loader size={12} className="animate-spin text-amber-400" />, badge: 'bg-amber-500/15 text-amber-400', label: 'processing' },
  pending:    { icon: <Clock size={12} className="text-zinc-400" />, badge: 'bg-white/5 text-zinc-400', label: 'pending' },
  failed:     { icon: <XCircle size={12} className="text-red-400" />, badge: 'bg-red-500/15 text-red-400', label: 'failed' },
}

const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } } }

function DocCard({ doc, onView, onDelete }) {
  const meta = STATUS_META[doc.status] || STATUS_META.pending
  const isProcessing = doc.status === 'processing' || doc.status === 'pending'
  return (
    <motion.div
      layout
      variants={item}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-800/60 p-5 backdrop-blur-xl transition-colors hover:border-primary-500/30"
    >
      {isProcessing && (
        <div className="shimmer pointer-events-none absolute inset-0 rounded-2xl" />
      )}

      <div className="relative flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/10 ring-1 ring-white/10">
          <FileText size={18} className="text-primary-300" />
        </div>
        <span className={`badge ${meta.badge}`}>{meta.icon}{meta.label}</span>
      </div>

      <p className="relative mt-4 truncate text-sm font-semibold text-white" title={doc.original_filename}>
        {doc.original_filename}
      </p>

      <div className="relative mt-2 flex items-center gap-3 text-xs text-zinc-500">
        <span className="inline-flex items-center gap-1 uppercase"><FileType2 size={12} />{doc.file_type}</span>
        <span>•</span>
        <span>{doc.file_size_display}</span>
        {doc.page_count ? (<><span>•</span><span>{doc.page_count} pages</span></>) : null}
      </div>

      <div className="relative mt-4 flex items-center gap-2 border-t border-white/[0.05] pt-3">
        {doc.status === 'completed' && (
          <button
            onClick={() => onView(doc)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary-300 transition-colors hover:bg-primary-500/10"
          >
            <Eye size={13} /> Summary
          </button>
        )}
        <button
          onClick={() => onDelete(doc.id)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </motion.div>
  )
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [selected, setSelected] = useState(null)
  const [summary, setSummary] = useState(null)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const fileRef = useRef()

  const fetchDocs = useCallback(() => {
    documentsAPI.list({ page: 1, page_size: 50 })
      .then(res => setDocs(res.data.data))
      .catch(() => toast.error('Failed to load documents.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchDocs()
    const interval = setInterval(() => {
      if (docs.some(d => ['pending', 'processing'].includes(d.status))) fetchDocs()
    }, 5000)
    return () => clearInterval(interval)
  }, [fetchDocs, docs])

  const handleUpload = async e => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    const fd = new FormData()
    files.forEach(f => fd.append('files', f))
    setUploading(true)
    try {
      const res = await documentsAPI.upload(fd)
      toast.success(res.data.message)
      fetchDocs()
    } catch (err) {
      const errs = err.response?.data?.errors
      if (Array.isArray(errs)) errs.forEach(msg => toast.error(msg))
      else toast.error(err.response?.data?.message || 'Upload failed.')
    } finally {
      setUploading(false)
      fileRef.current.value = ''
    }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this document? This cannot be undone.')) return
    try {
      await documentsAPI.delete(id)
      toast.success('Document deleted.')
      setDocs(d => d.filter(doc => doc.id !== id))
    } catch { toast.error('Delete failed.') }
  }

  const handleViewSummary = async doc => {
    setSummary(null)
    setSelected(doc)
    setSummaryOpen(true)
    try {
      const res = await documentsAPI.getSummary(doc.id)
      setSummary(res.data.data.summary)
    } catch { setSummary('Failed to load summary.') }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <LoadingSkeleton className="h-7 w-40" />
            <LoadingSkeleton className="h-3 w-56" />
          </div>
          <LoadingSkeleton className="h-9 w-32 rounded-xl" />
        </div>
        <LoadingSkeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonDocCard key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Documents</h2>
          <p className="page-subtitle">{docs.length} document{docs.length !== 1 ? 's' : ''} in your workspace</p>
        </div>
        <div className="flex gap-2">
          <AnimatedButton variant="secondary" size="sm" onClick={fetchDocs}>
            <RefreshCw size={14} /> Refresh
          </AnimatedButton>
          <AnimatedButton size="sm" onClick={() => fileRef.current.click()} loading={uploading}>
            {!uploading && <Upload size={14} />} {uploading ? 'Uploading' : 'Upload Files'}
          </AnimatedButton>
          <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.txt" onChange={handleUpload} className="hidden" />
        </div>
      </div>

      {/* Drop zone */}
      <motion.div
        onClick={() => fileRef.current.click()}
        onDrop={e => {
          e.preventDefault(); setDragOver(false)
          const input = fileRef.current; input.files = e.dataTransfer.files; handleUpload({ target: input })
        }}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        animate={{ scale: dragOver ? 1.01 : 1 }}
        className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          dragOver ? 'border-primary-500/70 bg-primary-500/[0.06]' : 'border-white/10 hover:border-primary-500/40'
        }`}
      >
        {(dragOver || uploading) && (
          <div className="shimmer pointer-events-none absolute inset-0" />
        )}
        <motion.div
          animate={dragOver ? { y: [-4, 4, -4] } : { y: [0, -8, 0] }}
          transition={{ duration: dragOver ? 0.6 : 3, repeat: Infinity, ease: 'easeInOut' }}
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${
            dragOver ? 'bg-primary-500/20' : 'bg-white/5'
          }`}
        >
          <CloudUpload size={26} className={dragOver ? 'text-primary-300' : 'text-zinc-400'} />
        </motion.div>
        <p className="text-sm font-semibold text-zinc-200">
          {uploading ? 'Uploading your files…' : dragOver ? 'Release to upload' : 'Drop files here or click to browse'}
        </p>
        <p className="mt-1.5 text-xs text-zinc-500">PDF, DOCX, TXT — up to 50 MB each, max 10 files</p>

        {uploading && (
          <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-white/5">
            <motion.div
              className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary-400 to-transparent"
              animate={{ x: ['-100%', '300%'] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}
      </motion.div>

      {/* Document grid */}
      {docs.length === 0 ? (
        <GlassCard className="p-16 text-center">
          <FileText className="mx-auto mb-3 text-zinc-700" size={44} />
          <p className="text-sm text-zinc-500">No documents yet. Upload your first file above.</p>
        </GlassCard>
      ) : (
        <motion.div
          layout
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence>
            {docs.map(doc => (
              <DocCard key={doc.id} doc={doc} onView={handleViewSummary} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Summary modal */}
      <Modal open={summaryOpen} onClose={() => setSummaryOpen(false)} title={`Summary — ${selected?.original_filename || ''}`} size="lg">
        {summary === null ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <LoadingSkeleton className="h-24 w-full rounded-xl" />
            <p className="text-xs text-zinc-500">Generating summary…</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
            {summary || 'No summary available.'}
          </div>
        )}
      </Modal>
    </div>
  )
}
