import { useState, useEffect, useCallback } from 'react'
import useApi from '../../hooks/useApi'
import {
  Plus, Wallet, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, User,
  CreditCard, Smartphone, Banknote,
  CheckCircle, Receipt
} from 'lucide-react'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

// ─── HELPERS ─────────────────────────────────
const formatGHS = (amount) =>
  `GHS ${parseFloat(amount || 0).toLocaleString('en-GH', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  })}`

// ─── INCOME CONSTANTS ─────────────────────────
const OFFERING_TYPES = [
  { value: 'tithe',          label: 'Tithe' },
  { value: 'offering',       label: 'General Offering' },
  { value: 'thanksgiving',   label: 'Thanksgiving' },
  { value: 'building_fund',  label: 'Building Fund' },
  { value: 'pledge_payment', label: 'Pledge Payment' },
  { value: 'special_seed',   label: 'Special Seed' },
  { value: 'welfare',        label: 'Welfare' },
]

const TYPE_COLORS = {
  tithe:          { color: '#4F46E5', bg: '#EEF2FF' },
  offering:       { color: '#0891B2', bg: '#E0F2FE' },
  thanksgiving:   { color: '#D97706', bg: '#FEF3C7' },
  building_fund:  { color: '#DC2626', bg: '#FEE2E2' },
  pledge_payment: { color: '#7C3AED', bg: '#F5F3FF' },
  special_seed:   { color: '#059669', bg: '#D1FAE5' },
  welfare:        { color: '#DB2777', bg: '#FCE7F3' },
}

const PAYMENT_ICONS = {
  cash:          Banknote,
  momo:          Smartphone,
  bank_transfer: CreditCard,
  cheque:        CreditCard,
}

// ─── EXPENSE CONSTANTS ────────────────────────
const EXPENSE_TYPES = [
  { value: 'salary',        label: 'Salaries & Stipends' },
  { value: 'utilities',     label: 'Utilities (ECG, Water)' },
  { value: 'maintenance',   label: 'Maintenance & Repairs' },
  { value: 'events',        label: 'Events & Programs' },
  { value: 'welfare',       label: 'Welfare & Benevolence' },
  { value: 'printing',      label: 'Printing & Stationery' },
  { value: 'transport',     label: 'Transport & Fuel' },
  { value: 'equipment',     label: 'Equipment & Supplies' },
  { value: 'rent',          label: 'Rent' },
  { value: 'miscellaneous', label: 'Miscellaneous' },
]

const EXPENSE_COLORS = {
  salary:        '#EF4444',
  utilities:     '#F97316',
  maintenance:   '#EAB308',
  events:        '#8B5CF6',
  welfare:       '#EC4899',
  printing:      '#06B6D4',
  transport:     '#10B981',
  equipment:     '#3B82F6',
  rent:          '#6366F1',
  miscellaneous: '#94A3B8',
}

// ─── RECORD OFFERING FORM ────────────────────
function RecordOfferingForm({ api, onSuccess, onClose }) {
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [members, setMembers]   = useState([])
  const [services, setServices] = useState([])
  const [form, setForm] = useState({
    offeringType: 'tithe', amount: '', paymentMethod: 'cash',
    momoNetwork: '', reference: '', memberId: '', serviceId: '',
    isAnonymous: false, notes: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, sRes] = await Promise.all([
          api('/members?limit=100'),
          api('/attendance/services')
        ])
        const [mData, sData] = await Promise.all([mRes, sRes])
        if (mData.success) setMembers(mData.members)
        if (sData.success) setServices(sData.services)
      } catch (err) { console.error(err) }
    }
    fetchData()
  }, [api])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Please enter a valid amount.'); return }
    setLoading(true)
    try {
      const data = await api('/finance/offerings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!data.success) { setError(data.message); return }
      onSuccess(data.offering)
    } catch { setError('Cannot connect to server.') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="member-form">
      {error && <div className="form-error">{error}</div>}
      <div className="form-section">
        <p className="form-section-title">Offering Details</p>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Offering Type *</label>
            <select name="offeringType" value={form.offeringType} onChange={handleChange} className="form-input">
              {OFFERING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Amount (GHS) *</label>
            <input name="amount" type="number" step="0.01" min="0"
              value={form.amount} onChange={handleChange} className="form-input" placeholder="0.00" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="form-input">
              <option value="cash">Cash</option>
              <option value="momo">Mobile Money</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
          {form.paymentMethod === 'momo' ? (
            <div className="form-group">
              <label className="form-label">MoMo Network</label>
              <select name="momoNetwork" value={form.momoNetwork} onChange={handleChange} className="form-input">
                <option value="">Select network</option>
                <option value="mtn">MTN MoMo</option>
                <option value="vodafone">Vodafone Cash</option>
                <option value="airteltigo">AirtelTigo Money</option>
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Reference (optional)</label>
              <input name="reference" value={form.reference} onChange={handleChange}
                className="form-input" placeholder="Transaction reference" />
            </div>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Date</label>
          <input name="date" type="date" value={form.date} onChange={handleChange} className="form-input" />
        </div>
      </div>

      <div className="form-section">
        <p className="form-section-title">Member & Service</p>
        <div className="form-group form-group-checkbox">
          <label className="checkbox-label">
            <input name="isAnonymous" type="checkbox" checked={form.isAnonymous} onChange={handleChange} />
            <span>Anonymous offering (don't link to a member)</span>
          </label>
        </div>
        {!form.isAnonymous && (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Member</label>
              <select name="memberId" value={form.memberId} onChange={handleChange} className="form-input">
                <option value="">Select member</option>
                {members.map(m => <option key={m._id} value={m._id}>{m.firstName} {m.lastName} ({m.memberId})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Service (optional)</label>
              <select name="serviceId" value={form.serviceId} onChange={handleChange} className="form-input">
                <option value="">No specific service</option>
                {services.map(s => <option key={s._id} value={s._id}>{s.name} — {new Date(s.date).toLocaleDateString('en-GH')}</option>)}
              </select>
            </div>
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Notes (optional)</label>
          <input name="notes" value={form.notes} onChange={handleChange}
            className="form-input" placeholder="Any additional notes" />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Recording...' : 'Record Offering'}
        </button>
      </div>
    </form>
  )
}

// ─── RECORD EXPENSE FORM ──────────────────────
function RecordExpenseForm({ api, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm] = useState({
    category: 'salary', description: '', amount: '',
    paymentMethod: 'cash', notes: '',
    date: new Date().toISOString().split('T')[0]
  })

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.description.trim()) { setError('Description is required.'); return }
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Please enter a valid amount.'); return }
    setLoading(true)
    try {
      const data = await api('/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!data.success) { setError(data.message); return }
      onSuccess(data.expense)
    } catch { setError('Cannot connect to server.') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="member-form">
      {error && <div className="form-error">{error}</div>}

      <div className="form-section">
        <p className="form-section-title">Expense Details</p>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select name="category" value={form.category} onChange={handleChange} className="form-input">
              {EXPENSE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Amount (GHS) *</label>
            <input name="amount" type="number" step="0.01" min="0"
              value={form.amount} onChange={handleChange} className="form-input" placeholder="0.00" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description *</label>
          <input name="description" value={form.description} onChange={handleChange}
            className="form-input" placeholder="e.g. August ECG bill, Driver fuel allowance" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="form-input">
              <option value="cash">Cash</option>
              <option value="momo">Mobile Money</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input name="date" type="date" value={form.date} onChange={handleChange} className="form-input" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes (optional)</label>
          <input name="notes" value={form.notes} onChange={handleChange}
            className="form-input" placeholder="Any additional notes" />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}
          style={{ background: 'var(--danger)', boxShadow: '0 2px 8px rgba(239,68,68,0.3)' }}>
          {loading ? 'Recording...' : 'Record Expense'}
        </button>
      </div>
    </form>
  )
}

// ─── OFFERING TYPE CARD ───────────────────────
function OfferingTypeCard({ type, totalGHS, count }) {
  const config = TYPE_COLORS[type] || { color: '#64748B', bg: '#F1F5F9' }
  const label  = OFFERING_TYPES.find(t => t.value === type)?.label || type
  return (
    <div className="offering-type-card">
      <div className="offering-type-dot" style={{ background: config.color }} />
      <div className="offering-type-info">
        <p className="offering-type-label">{label}</p>
        <p className="offering-type-count">{count} transactions</p>
      </div>
      <p className="offering-type-amount">{formatGHS(totalGHS)}</p>
    </div>
  )
}

// ─── EXPENSE CATEGORY CARD ────────────────────
function ExpenseCategoryCard({ category, total, count }) {
  const color = EXPENSE_COLORS[category] || '#94A3B8'
  const label = EXPENSE_TYPES.find(t => t.value === category)?.label || category
  return (
    <div className="offering-type-card">
      <div className="offering-type-dot" style={{ background: color }} />
      <div className="offering-type-info">
        <p className="offering-type-label">{label}</p>
        <p className="offering-type-count">{count} transactions</p>
      </div>
      <p className="offering-type-amount" style={{ color: 'var(--danger)' }}>{formatGHS(total)}</p>
    </div>
  )
}

// ─── TRANSACTION ROW (Income) ─────────────────
function TransactionRow({ offering }) {
  const config  = TYPE_COLORS[offering.offeringType] || {}
  const label   = OFFERING_TYPES.find(t => t.value === offering.offeringType)?.label
  const PayIcon = PAYMENT_ICONS[offering.paymentMethod] || Banknote
  const formatDate = (d) => new Date(d).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="transaction-row">
      <div className="transaction-left">
        <div className="transaction-type-dot" style={{ background: (config.color || '#64748B') + '22', color: config.color || '#64748B' }}>
          <Wallet size={14} />
        </div>
        <div>
          <p className="transaction-type">{label}</p>
          <p className="transaction-meta">
            {offering.isAnonymous ? 'Anonymous'
              : offering.memberId ? `${offering.memberId.firstName} ${offering.memberId.lastName}`
              : 'Unknown'}
            {' · '}<PayIcon size={11} style={{ display: 'inline', verticalAlign: 'middle' }} />
            {' '}{offering.paymentMethod.replace('_', ' ')}
            {offering.momoNetwork && ` (${offering.momoNetwork.toUpperCase()})`}
            {' · '}{formatDate(offering.date)}
          </p>
        </div>
      </div>
      <p className="transaction-amount">{formatGHS(offering.amountGHS)}</p>
    </div>
  )
}

// ─── EXPENSE ROW ──────────────────────────────
function ExpenseRow({ expense }) {
  const color   = EXPENSE_COLORS[expense.category] || '#94A3B8'
  const label   = EXPENSE_TYPES.find(t => t.value === expense.category)?.label || expense.category
  const PayIcon = PAYMENT_ICONS[expense.paymentMethod] || Banknote
  const formatDate = (d) => new Date(d).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="transaction-row">
      <div className="transaction-left">
        <div className="transaction-type-dot" style={{ background: color + '22', color }}>
          <Receipt size={14} />
        </div>
        <div>
          <p className="transaction-type">{expense.description}</p>
          <p className="transaction-meta">
            {label}
            {' · '}<PayIcon size={11} style={{ display: 'inline', verticalAlign: 'middle' }} />
            {' '}{expense.paymentMethod.replace('_', ' ')}
            {' · '}{formatDate(expense.date)}
          </p>
        </div>
      </div>
      <p className="transaction-amount" style={{ color: 'var(--danger)' }}>
        {formatGHS(expense.amountGHS)}
      </p>
    </div>
  )
}

// ─── MAIN FINANCE PAGE ────────────────────────
export default function Finance() {
  const { api, branchReady } = useApi()
  const [activeTab, setActiveTab]         = useState('income')
  const [summary, setSummary]             = useState(null)
  const [expenseSummary, setExpenseSummary] = useState(null)
  const [offerings, setOfferings]         = useState([])
  const [expenses, setExpenses]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [showOfferingModal, setShowOfferingModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal]   = useState(false)
  const [successMsg, setSuccessMsg]       = useState('')
  const [typeFilter, setTypeFilter]       = useState('')
  const [expenseFilter, setExpenseFilter] = useState('')

  const fetchData = useCallback(async () => {
    if (!branchReady) return
    setLoading(true)
    try {
      const headers = { }
      const offeringParams = new URLSearchParams()
      if (typeFilter) offeringParams.append('offeringType', typeFilter)
      const expenseParams = new URLSearchParams()
      if (expenseFilter) expenseParams.append('category', expenseFilter)

      // ── Fetch all independently so one failure doesn't kill the rest ──
      const [sumData, offData, expData, expSumData] = await Promise.all([
        api('/finance/summary',                          { headers }),
        api(`/finance/offerings?${offeringParams}&limit=20`, { headers }),
        api(`/expenses?${expenseParams}&limit=20`,       { headers }),
        api('/expenses/summary',                         { headers }),
      ])

      if (sumData?.success)    setSummary(sumData.summary)
      if (offData?.success)    setOfferings(offData.offerings || [])
      if (expData?.success)    setExpenses(expData.expenses || [])
      if (expSumData?.success) setExpenseSummary(expSumData.summary)

  } catch (err) {
    console.error('Finance fetch error:', err)
  } finally {
    setLoading(false)
  }
}, [api, typeFilter, expenseFilter])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData() }, [fetchData])

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const weekVariance = summary?.weekVariance || 0

  // Net balance this month
  const incomeMonth   = summary?.thisMonth   || 0
  const expensesMonth = expenseSummary?.thisMonth || 0
  const netMonth      = incomeMonth - expensesMonth
  const isProfit      = netMonth >= 0

  return (
    <div className="finance-page">

      {/* Success Toast */}
      {successMsg && (
        <div className="success-toast animate-slideUp">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Finance</h1>
          <p className="page-subtitle">Track income, expenses and net balance</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn-outline" onClick={() => setShowExpenseModal(true)}>
            <TrendingDown size={16} />
            Record Expense
          </button>
          <button className="btn-primary" onClick={() => setShowOfferingModal(true)}>
            <Plus size={16} />
            Record Offering
          </button>
        </div>
      </div>

      {/* ── Net Balance Strip ── */}
      <div className={`finance-net-strip ${isProfit ? 'profit' : 'deficit'}`}>


        <div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>Income This Month</p>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-extrabold)', color: 'var(--success)' }}>
            {loading ? '—' : formatGHS(incomeMonth)}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>Expenses This Month</p>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-extrabold)', color: 'var(--danger)' }}>
            {loading ? '—' : formatGHS(expensesMonth)}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>Net Balance This Month</p>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-extrabold)', color: isProfit ? 'var(--success)' : 'var(--danger)' }}>
            {loading ? '—' : `${isProfit ? '+' : ''}${formatGHS(netMonth)}`}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: isProfit ? 'var(--success)' : 'var(--danger)' }}>
            {isProfit ? '▲ Surplus' : '▼ Deficit'}
          </p>
        </div>
      </div>

      {/* Income Summary Cards */}
      <div className="finance-summary-grid">
        {[
          { label: 'Total This Week',  value: formatGHS(summary?.thisWeek),  icon: Wallet,       color: 'var(--primary)', trend: weekVariance, sublabel: 'vs last week' },
          { label: 'Total This Month', value: formatGHS(summary?.thisMonth), icon: TrendingUp,   color: 'var(--success)', sublabel: new Date().toLocaleDateString('en-GH', { month: 'long', year: 'numeric' }) },
          { label: 'Total This Year',  value: formatGHS(summary?.thisYear),  icon: ArrowUpRight, color: 'var(--info)',    sublabel: new Date().getFullYear().toString() },
          { label: 'All Time Total',   value: formatGHS(summary?.allTime),   icon: Wallet,       color: 'var(--accent)',  sublabel: 'Since inception' },
        ].map(({ label, value, icon: Icon, color, trend, sublabel }) => (
          <div className="finance-stat-card" key={label}>
            <div className="finance-stat-top">
              <div className="finance-stat-icon" style={{ background: color + '18' }}>
                <Icon size={18} color={color} />
              </div>
              {trend !== undefined && trend !== 0 && (
                <span className={`stat-trend ${trend >= 0 ? 'up' : 'down'}`}>
                  {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(trend)}%
                </span>
              )}
            </div>
            <p className="finance-stat-value">{loading ? '—' : value}</p>
            <p className="finance-stat-label">{label}</p>
            <p className="finance-stat-sub">{sublabel}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="settings-tabs">
        <button
          className={`settings-tab ${activeTab === 'income' ? 'active' : ''}`}
          onClick={() => setActiveTab('income')}>
          <TrendingUp size={15} /> <span>Income</span>
        </button>
        <button
          className={`settings-tab ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}>
          <TrendingDown size={15} /> <span>Expenses</span>
        </button>
      </div>

      {/* ── INCOME TAB ── */}
      {activeTab === 'income' && (
        <div className="finance-bottom">
          {/* Offering Breakdown */}
          <div className="finance-card">
            <div className="finance-card-header">
              <h3>Offering Breakdown</h3>
              <p className="finance-card-sub">All time by category</p>
            </div>
            {loading ? <LoadingSpinner /> : summary?.byType?.length === 0 ? (
              <EmptyState title="No offerings yet" message="Record your first offering to see the breakdown." />
            ) : (
              <div className="offering-type-list">
                {summary?.byType?.map(t => (
                  <OfferingTypeCard key={t.type} type={t.type} totalGHS={t.totalGHS} count={t.count} />
                ))}
              </div>
            )}
          </div>

          {/* Recent Income Transactions */}
          <div className="finance-card">
            <div className="finance-card-header">
              <h3>Recent Transactions</h3>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                className="filter-select" style={{ fontSize: 'var(--text-xs)' }}>
                <option value="">All Types</option>
                {OFFERING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            {loading ? <LoadingSpinner /> : offerings.length === 0 ? (
              <EmptyState icon={Wallet} title="No transactions yet"
                message="Record an offering to see transactions here."
                action={{ label: '+ Record Offering', onClick: () => setShowOfferingModal(true) }} />
            ) : (
              <div className="transaction-list">
                {offerings.map(o => <TransactionRow key={o._id} offering={o} />)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── EXPENSES TAB ── */}
      {activeTab === 'expenses' && (
        <div className="finance-bottom">
          {/* Expense Breakdown */}
          <div className="finance-card">
            <div className="finance-card-header">
              <h3>Expense Breakdown</h3>
              <p className="finance-card-sub">All time by category</p>
            </div>
            {loading ? <LoadingSpinner /> : expenseSummary?.byCategory?.length === 0 ? (
              <EmptyState title="No expenses yet"
                message="Record your first expense to see the breakdown."
                action={{ label: '+ Record Expense', onClick: () => setShowExpenseModal(true) }} />
            ) : (
              <div className="offering-type-list">
                {expenseSummary?.byCategory?.map(c => (
                  <ExpenseCategoryCard key={c.category} category={c.category} total={c.total} count={c.count} />
                ))}
              </div>
            )}
          </div>

          {/* Recent Expense Transactions */}
          <div className="finance-card">
            <div className="finance-card-header">
              <h3>Recent Expenses</h3>
              <select value={expenseFilter} onChange={(e) => setExpenseFilter(e.target.value)}
                className="filter-select" style={{ fontSize: 'var(--text-xs)' }}>
                <option value="">All Categories</option>
                {EXPENSE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            {loading ? <LoadingSpinner /> : expenses.length === 0 ? (
              <EmptyState icon={Receipt} title="No expenses recorded"
                message="Start recording church expenses here."
                action={{ label: '+ Record Expense', onClick: () => setShowExpenseModal(true) }} />
            ) : (
              <div className="transaction-list">
                {expenses.map(e => <ExpenseRow key={e._id} expense={e} />)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Record Offering Modal */}
      <Modal open={showOfferingModal} onClose={() => setShowOfferingModal(false)} title="Record Offering" size="lg">
        <RecordOfferingForm api={api}
          onSuccess={(offering) => {
            setShowOfferingModal(false)
            showSuccess(`${formatGHS(offering.amount / 100)} ${offering.offeringType} recorded.`)
            fetchData()
          }}
          onClose={() => setShowOfferingModal(false)} />
      </Modal>

      {/* Record Expense Modal */}
      <Modal open={showExpenseModal} onClose={() => setShowExpenseModal(false)} title="Record Expense" size="md">
        <RecordExpenseForm api={api}
          onSuccess={(expense) => {
            setShowExpenseModal(false)
            showSuccess(`Expense of ${formatGHS(expense.amountGHS)} recorded.`)
            fetchData()
          }}
          onClose={() => setShowExpenseModal(false)} />
      </Modal>

    </div>
  )
}