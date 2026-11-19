// FILE: client/src/pages/members/MemberImport.jsx
// ─────────────────────────────────────────────────────────────────────────────
// "Upload your member list and everyone is added."
//   1. pick a PDF / Excel / Word / CSV file (or drag it in)
//   2. we read it and show who is ready — and fix any column we guessed wrong
//   3. one click adds everybody. Nothing is saved before step 3.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, AlertTriangle, Download } from 'lucide-react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const MAX_BYTES  = 6.5 * 1024 * 1024
const ACCEPT     = '.pdf,.xlsx,.xlsm,.docx,.csv,.tsv,.txt'
const GOOD       = 'var(--success, #059669)'

const FIELD_LABELS = {
  name:          'Full name',
  firstName:     'First name(s)',
  lastName:      'Surname',
  phone:         'Phone',
  email:         'Email',
  gender:        'Gender',
  dateOfBirth:   'Date of birth',
  maritalStatus: 'Marital status',
  memberStatus:  'Member status',
  occupation:    'Occupation',
  address:       'Address',
}

const PREVIEW_COLS = [
  ['gender', 'Gender'], ['dateOfBirth', 'Date of birth'], ['email', 'Email'],
  ['maritalStatus', 'Marital'], ['occupation', 'Occupation'], ['address', 'Address'],
]

const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload  = () => resolve(String(reader.result).split(',')[1] || '')
  reader.onerror = () => reject(new Error('Could not read that file.'))
  reader.readAsDataURL(file)
})

const csvCell = (v) => {
  let s = String(v ?? '')
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const download = (filename, text) => {
  const url = URL.createObjectURL(new Blob(['\uFEFF' + text], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const fmtDate = (iso) => (iso ? iso.split('-').reverse().join('/') : '')
const cap     = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')

const SAMPLE_CSV = [
  ['Full Name', 'Phone', 'Gender', 'Date of Birth', 'Email', 'Address', 'Occupation', 'Marital Status'],
  ['Kwame Mensah', '0244123456', 'Male', '14/03/1985', 'kwame@example.com', 'East Legon, Accra', 'Teacher', 'Married'],
  ['Ama Serwaa', '0201234567', 'Female', '02/11/1992', '', 'Madina, Accra', 'Nurse', 'Single'],
].map(r => r.map(csvCell).join(',')).join('\r\n')

const box = (extra = {}) => ({
  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-3)', ...extra,
})

export default function MemberImport({ api, onClose, onDone }) {
  const [step, setStep]         = useState('pick')       // pick | reading | review | importing | done
  const [error, setError]       = useState('')
  const [fileName, setFileName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [busy, setBusy]         = useState(false)        // re-checking after a column change

  const [table, setTable]       = useState({ rows: [], headerRow: -1 })
  const [mapping, setMapping]   = useState([])
  const [review, setReview]     = useState(null)
  const [detectedHeader, setDetectedHeader] = useState(0)
  const [result, setResult]     = useState(null)
  const inputRef = useRef(null)

  const reset = () => {
    setStep('pick'); setError(''); setFileName(''); setReview(null); setResult(null)
    setTable({ rows: [], headerRow: -1 }); setMapping([])
  }

  // ── 1. read the file ──
  const handleFile = async (file) => {
    if (!file) return
    setError('')
    if (file.size > MAX_BYTES) { setError('That file is too large (max 6 MB). Try splitting it into two files.'); return }
    if (!/\.(pdf|xlsx|xlsm|docx|csv|tsv|txt)$/i.test(file.name)) {
      setError('Please choose a PDF, Excel (.xlsx), Word (.docx) or CSV file.'); return
    }

    setFileName(file.name)
    setStep('reading')
    try {
      const data = await toBase64(file)
      const res  = await api('/members/import/preview', {
        method: 'POST',
        body: JSON.stringify({ filename: file.name, data }),
      })
      if (!res.success) { setError(res.message || 'We could not read that file.'); setStep('pick'); return }

      setTable({ rows: res.rows, headerRow: res.headerRow })
      setDetectedHeader(res.headerRow >= 0 ? res.headerRow : 0)
      setMapping(res.mapping)
      setReview(res)
      setStep('review')
    } catch (err) {
      setError(err.message || 'We could not read that file.')
      setStep('pick')
    }
  }

  // ── 2. re-check after the user fixes a column / the header row ──
  const recheck = async (nextMapping, nextHeaderRow) => {
    setBusy(true); setError('')
    try {
      const res = await api('/members/import/preview', {
        method: 'POST',
        body: JSON.stringify({ rows: table.rows, mapping: nextMapping, headerRow: nextHeaderRow }),
      })
      if (!res.success) { setError(res.message || 'Could not update the preview.'); return }
      setMapping(nextMapping)
      setTable(t => ({ ...t, headerRow: nextHeaderRow }))
      setReview(r => ({ ...r, ...res, rows: undefined }))
    } catch (err) {
      setError(err.message || 'Could not update the preview.')
    } finally {
      setBusy(false)
    }
  }

  const changeColumn = (index, field) => {
    const next = mapping.map((f, i) => (i === index ? field : (field && f === field ? '' : f)))  // a field can only be in one column
    recheck(next, table.headerRow)
  }

  const toggleHeader = (hasHeader) => recheck(mapping, hasHeader ? detectedHeader : -1)

  // ── 3. save everybody ──
  const commit = async () => {
    setStep('importing'); setError('')
    try {
      const res = await api('/members/import/commit', {
        method: 'POST',
        body: JSON.stringify({ rows: table.rows, mapping, headerRow: table.headerRow, filename: fileName }),
      })
      if (!res.success) { setError(res.message || 'The import failed.'); setStep('review'); return }
      setResult({ ...res.result, plan: res.plan })
      setStep('done')
    } catch (err) {
      setError(err.message || 'The import failed.')
      setStep('review')
    }
  }

  const downloadSkipped = () => {
    const lines = [['Line', 'Name', 'Phone', 'Why it was skipped'], ...review.skipped.map(s => [s.row, s.name, s.phone, s.reason])]
    download('skipped-members.csv', lines.map(r => r.map(csvCell).join(',')).join('\r\n'))
  }

  const banner = (text, tone = 'danger') => (
    <div style={{
      display: 'flex', gap: 8, alignItems: 'flex-start', padding: 'var(--space-3)',
      borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-sm)',
      background: tone === 'danger' ? '#FEE2E2' : '#FEF3C7',
      color:      tone === 'danger' ? '#991B1B' : '#92400E',
    }}>
      <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} /> <span>{text}</span>
    </div>
  )

  // ════════════════ PICK ════════════════
  if (step === 'pick') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {error && banner(error)}

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]) }}
          style={{
            border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
            background: dragOver ? 'rgba(5,150,105,0.06)' : 'transparent',
            borderRadius: 'var(--radius-sm)', padding: 'var(--space-8, 40px) var(--space-4)',
            textAlign: 'center', cursor: 'pointer',
          }}
        >
          <Upload size={32} style={{ color: 'var(--primary)' }} />
          <p style={{ fontWeight: 700, marginTop: 'var(--space-2)', color: 'var(--text-primary)' }}>
            Drop your member list here, or click to choose a file
          </p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 4 }}>
            PDF, Excel (.xlsx), Word (.docx) or CSV · up to 6 MB
          </p>
          <input
            ref={inputRef} type="file" accept={ACCEPT} style={{ display: 'none' }}
            onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = '' }}
          />
        </div>

        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>• We read the columns for you and show everything <strong>before</strong> anything is saved.</span>
          <span>• Each person needs a <strong>name</strong> and a <strong>phone number</strong>. Everything else is optional.</span>
          <span>• People already in MinistryOS (same phone number) are skipped automatically, so it is safe to upload again.</span>
          <span>• Scanned photos of a list can't be read — use the Excel / Word file or a PDF exported from one.</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <button type="button" className="btn-outline" onClick={() => download('members-template.csv', SAMPLE_CSV)}>
            <Download size={14} /> Download a sample file
          </button>
          <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    )
  }

  // ════════════════ READING / IMPORTING ════════════════
  if (step === 'reading')   return <LoadingSpinner message={`Reading ${fileName}…`} />
  if (step === 'importing') return <LoadingSpinner message="Adding your members…" />

  // ════════════════ DONE ════════════════
  if (step === 'done') {
    const skippedTotal = result.skipped
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', textAlign: 'center', padding: 'var(--space-4) 0' }}>
        <CheckCircle size={44} style={{ color: GOOD, margin: '0 auto' }} />
        <h3 style={{ color: 'var(--text-primary)' }}>
          {result.created} member{result.created === 1 ? '' : 's'} added
        </h3>

        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {skippedTotal > 0 && (
            <span>
              {skippedTotal} skipped
              {result.alreadyMembers   > 0 && ` · ${result.alreadyMembers} already members`}
              {result.duplicatesInFile > 0 && ` · ${result.duplicatesInFile} repeated in the file`}
              {result.noPhone          > 0 && ` · ${result.noPhone} had no phone number`}
              {result.invalidPhone     > 0 && ` · ${result.invalidPhone} had an invalid phone number`}
              {result.noName           > 0 && ` · ${result.noName} had no name`}
            </span>
          )}
          {result.failed > 0 && <span>{result.failed} could not be saved — please upload the file again to retry them.</span>}
        </div>

        {result.overLimit > 0 && banner(
          `Your plan's member limit was reached, so ${result.overLimit} more were not added. Upgrade your plan, then upload the same file again — the ones already added will be skipped.`,
          'warning'
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn-outline" onClick={reset}>Import another file</button>
          <button type="button" className="btn-primary" onClick={() => onDone(result.created)}>Done</button>
        </div>
      </div>
    )
  }

  // ════════════════ REVIEW ════════════════
  const s       = review.summary
  const plan    = review.plan
  const hasHdr  = table.headerRow >= 0
  const overPlan = plan && plan.remaining !== null && s.ready > plan.remaining
  const cols    = PREVIEW_COLS.filter(([key]) => review.preview.some(p => p[key]))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', opacity: busy ? 0.7 : 1 }}>
      {error && banner(error)}

      {/* Summary */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <div style={box({ flex: 1, minWidth: 160, borderColor: GOOD })}>
          <div style={{ fontSize: 28, fontWeight: 800, color: GOOD }}>{s.ready}</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>ready to add</div>
        </div>
        {s.skipped > 0 && (
          <div style={box({ flex: 1, minWidth: 160 })}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#B45309' }}>{s.skipped}</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>will be skipped</div>
          </div>
        )}
        <div style={box({ flex: 2, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8 })}>
          <FileText size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <div style={{ fontSize: 'var(--text-sm)', minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</div>
            {review.branch && <div style={{ color: 'var(--text-muted)' }}>Adding to <strong>{review.branch.name}</strong></div>}
          </div>
        </div>
      </div>

      {overPlan && banner(
        `Your plan allows ${plan.limit} members and you have ${plan.current}. Only the first ${plan.remaining} of these will be added.`,
        'warning'
      )}

      {/* Preview */}
      {review.preview.length > 0 && (
        <div>
          <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 6, color: 'var(--text-primary)' }}>
            Here's how the first {review.preview.length} will look
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  {['Name', 'Phone', ...cols.map(c => c[1])].map(h => (
                    <th key={h} style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--text-secondary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {review.preview.map(p => (
                  <tr key={p.row} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 600 }}>{`${p.firstName} ${p.lastName}`.trim()}</td>
                    <td style={{ padding: '6px 8px' }}>{p.phone}</td>
                    {cols.map(([key]) => (
                      <td key={key} style={{ padding: '6px 8px' }}>
                        {key === 'dateOfBirth' ? fmtDate(p[key]) : key === 'gender' || key === 'maritalStatus' ? cap(p[key]) : p[key] || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Column matching */}
      <details open={s.ready === 0}>
        <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
          {s.ready === 0 ? 'We couldn\'t match your columns — please choose them below' : 'Something look wrong? Check how we matched your columns'}
        </summary>

        <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)' }}>
            <input type="checkbox" checked={hasHdr} onChange={(e) => toggleHeader(e.target.checked)} disabled={busy} />
            My list has a row of column titles (Name, Phone, …)
          </label>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--text-secondary)' }}>In your file</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--text-secondary)' }}>Examples</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--text-secondary)' }}>It is the member's…</th>
                </tr>
              </thead>
              <tbody>
                {review.columns.map(col => (
                  <tr key={col.index} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 600 }}>{col.header || `Column ${col.index + 1}`}</td>
                    <td style={{ padding: '6px 8px', color: 'var(--text-muted)' }}>{col.samples.join(' · ') || '—'}</td>
                    <td style={{ padding: '6px 8px' }}>
                      <select
                        className="form-input" value={mapping[col.index] || ''} disabled={busy}
                        onChange={(e) => changeColumn(col.index, e.target.value)}
                      >
                        <option value="">Don't import</option>
                        {review.fields.map(f => <option key={f} value={f}>{FIELD_LABELS[f]}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>

      {/* Skipped */}
      {s.skipped > 0 && (
        <details>
          <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 'var(--text-sm)', color: '#B45309' }}>
            {s.skipped} will be skipped
            {s.alreadyMembers   > 0 && ` · ${s.alreadyMembers} already members`}
            {s.noPhone          > 0 && ` · ${s.noPhone} no phone`}
            {s.invalidPhone     > 0 && ` · ${s.invalidPhone} invalid phone`}
            {s.duplicatesInFile > 0 && ` · ${s.duplicatesInFile} repeated`}
            {s.noName           > 0 && ` · ${s.noName} no name`}
          </summary>
          <div style={{ marginTop: 'var(--space-2)', maxHeight: 200, overflowY: 'auto', fontSize: 'var(--text-sm)' }}>
            {review.skipped.slice(0, 50).map(k => (
              <div key={k.row} style={{ display: 'flex', gap: 8, padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', minWidth: 54 }}>Line {k.row}</span>
                <span style={{ flex: 1, fontWeight: 600 }}>{k.name || '—'}</span>
                <span style={{ color: 'var(--text-muted)' }}>{k.reason}</span>
              </div>
            ))}
            {review.skipped.length > 50 && (
              <p style={{ color: 'var(--text-muted)', padding: '6px 0' }}>…and {review.skipped.length - 50} more.</p>
            )}
          </div>
          <button type="button" className="btn-outline" style={{ marginTop: 'var(--space-2)' }} onClick={downloadSkipped}>
            <Download size={14} /> Download the skipped list
          </button>
        </details>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="btn-outline" onClick={reset} disabled={busy}>Choose a different file</button>
        <button type="button" className="btn-primary" onClick={commit} disabled={busy || s.ready === 0}>
          <Upload size={16} /> Add {overPlan ? plan.remaining : s.ready} member{(overPlan ? plan.remaining : s.ready) === 1 ? '' : 's'}
        </button>
      </div>
    </div>
  )
}
