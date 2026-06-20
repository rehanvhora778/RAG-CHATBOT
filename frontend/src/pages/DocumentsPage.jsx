import { useState, useEffect, useRef, useCallback } from 'react'
import { documentsAPI } from '../api/documents'
import { Upload, Trash2, FileText, RefreshCw, Eye, CheckCircle, Clock, XCircle, Loader, CloudUpload } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageLoader } from '../components/common/LoadingSpinner'
import Modal from '../components/common/Modal'

const STATUS_ICON = {
  completed:  <CheckCircle size={13} className="text-emerald-500" />,
  processing: <Loader size={13} className="text-amber-500 animate-spin" />,
  pending:    <Clock size={13} className="text-zinc-400" />,
  failed:     <XCircle size={13} className="text-red-500" />,
}

const STATUS_BADGE = {
  completed:  'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  processing: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  pending:    'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
  failed:     'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
}

export default function DocumentsPage() {
  const [docs, setDocs]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver]   = useState(false)
  const [selected, setSelected]   = useState(null)
  const [summary, setSummary]     = useState(null)
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
      if (Array.isArray(errs)) errs.forEach(e => toast.error(e))
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

  if (loading) return <PageLoader />

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Documents</h2>
          <p className="page-subtitle">{docs.length} document{docs.length !== 1 ? 's' : ''} in your workspace</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchDocs} className="btn-secondary">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => fileRef.current.click()} disabled={uploading} className="btn-primary">
            <Upload size={14} />
            {uploading ? 'Uploading…' : 'Upload Files'}
          </button>
          <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.txt" onChange={handleUpload} className="hidden" />
        </div>
      </div>

      {/* Drop zone */}
      <div
        className={`card border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? 'border-primary-400 bg-primary-50/50 dark:bg-primary-900/10'
            : 'border-zinc-200 dark:border-zinc-700 hover:border-primary-300 dark:hover:border-primary-700'
        }`}
        onClick={() => fileRef.current.click()}
        onDrop={e => {
          e.preventDefault(); setDragOver(false)
          const input = fileRef.current; input.files = e.dataTransfer.files; handleUpload({ target: input })
        }}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
      >
        <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-colors ${
          dragOver ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-zinc-100 dark:bg-zinc-800'
        }`}>
          <CloudUpload size={26} className={dragOver ? 'text-primary-500' : 'text-zinc-400'} />
        </div>
        <p className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm">
          {dragOver ? 'Release to upload' : 'Drop files here or click to browse'}
        </p>
        <p className="text-xs text-zinc-400 mt-1.5">PDF, DOCX, TXT — up to 50 MB each, max 10 files</p>
      </div>

      {/* Document table */}
      {docs.length === 0 ? (
        <div className="card p-16 text-center">
          <FileText className="mx-auto text-zinc-200 dark:text-zinc-700 mb-3" size={44} />
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">No documents yet. Upload your first file above.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">All Documents</p>
            <span className="badge bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{docs.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                <tr>
                  {['File Name', 'Type', 'Size', 'Pages', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {docs.map(doc => (
                  <tr key={doc.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                          <FileText size={14} className="text-primary-500" />
                        </div>
                        <span className="text-zinc-800 dark:text-zinc-200 truncate max-w-[180px] font-medium" title={doc.original_filename}>
                          {doc.original_filename}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="badge bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 uppercase">
                        {doc.file_type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400 text-xs">{doc.file_size_display}</td>
                    <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400 text-xs tabular-nums">{doc.page_count || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${STATUS_BADGE[doc.status] || ''}`}>
                        {STATUS_ICON[doc.status]}
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        {doc.status === 'completed' && (
                          <button onClick={() => handleViewSummary(doc)} title="View Summary"
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-500 transition-colors">
                            <Eye size={14} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(doc.id)} title="Delete"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Modal */}
      <Modal open={summaryOpen} onClose={() => setSummaryOpen(false)} title={`Summary — ${selected?.original_filename}`} size="lg">
        {summary === null ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-8 h-8 border-2 border-zinc-200 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-xs text-zinc-400">Generating summary…</p>
          </div>
        ) : (
          <div className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
            {summary || 'No summary available.'}
          </div>
        )}
      </Modal>
    </div>
  )
}
