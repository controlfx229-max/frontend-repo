import { useState, useEffect, useCallback } from 'react'
import useApi from '../../hooks/useApi'
import {
  Users, TrendingUp, Wallet, CalendarCheck,
  ArrowUpRight, ArrowDownRight, Building2,
  Crown, BarChart3, FileDown, TrendingDown
} from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

// ─── HELPERS ─────────────────────────────────
const formatGHS = (amount) =>
  `GHS ${parseFloat(amount || 0).toLocaleString('en-GH', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  })}`

const OFFERING_LABELS = {
  tithe:          'Tithe',
  offering:       'General Offering',
  thanksgiving:   'Thanksgiving',
  building_fund:  'Building Fund',
  pledge_payment: 'Pledge Payment',
  special_seed:   'Special Seed',
  welfare:        'Welfare'
}

const EXPENSE_LABELS = {
  salary:        'Salaries & Stipends',
  utilities:     'Utilities (ECG, Water)',
  maintenance:   'Maintenance & Repairs',
  events:        'Events & Programs',
  welfare:       'Welfare & Benevolence',
  printing:      'Printing & Stationery',
  transport:     'Transport & Fuel',
  equipment:     'Equipment & Supplies',
  rent:          'Rent',
  miscellaneous: 'Miscellaneous'
}

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
  miscellaneous: '#94A3B8'
}

const STATUS_COLORS = {
  active:      { bg: '#D1FAE5', color: '#065F46' },
  inactive:    { bg: '#FEF3C7', color: '#92400E' },
  new_convert: { bg: '#DBEAFE', color: '#1E40AF' },
  visitor:     { bg: '#F1F5F9', color: '#475569' },
  transferred: { bg: '#FEE2E2', color: '#991B1B' },
}

// ─── PDF GENERATOR ────────────────────────────
const generatePDF = ({ overview, finance, attendance, members }) => {
  const doc  = new jsPDF('p', 'mm', 'a4')
  const PAGE_W = 210
  const MARGIN = 14

  // ── Header Banner ──────────────────────────
  doc.setFillColor(79, 70, 229)
  doc.rect(0, 0, PAGE_W, 38, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('MinistryOS', MARGIN, 16)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Church Reports & Analytics', MARGIN, 24)
  doc.text(
    `Generated: ${new Date().toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    MARGIN, 32
  )
  doc.setTextColor(0, 0, 0)

  let y = 48

  // ── Section helper ─────────────────────────
  const sectionTitle = (title) => {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(79, 70, 229)
    doc.text(title, MARGIN, y)
    doc.setTextColor(0, 0, 0)
    y += 2
  }

  // ── 1. OVERVIEW ────────────────────────────
  sectionTitle('OVERVIEW — MEMBERS & SERVICES')
  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value']],
    body: [
      ['Total Members',         overview.members.total],
      ['Active Members',        overview.members.active],
      ['Inactive Members',      overview.members.inactive],
      ['New Converts',          overview.members.newConverts],
      ['Visitors',              overview.members.visitors],
      ['New Members This Month',overview.members.newThisMonth],
      ['Services Recorded',     overview.services.total],
      ['Services This Month',   overview.services.thisMonth],
      ['Departments',           overview.structure.departments],
      ['Cell Groups',           overview.structure.cellGroups],
    ],
    theme: 'striped',
    headStyles:  { fillColor: [79, 70, 229], textColor: 255 },
    styles:      { fontSize: 9 },
    columnStyles:{ 0: { fontStyle: 'bold', cellWidth: 90 } },
    margin:      { left: MARGIN, right: MARGIN },
  })
  y = doc.lastAutoTable.finalY + 10

  // ── 2. FINANCIAL SUMMARY ───────────────────
  sectionTitle('FINANCIAL SUMMARY')
  const net    = finance?.totals?.net    || 0
  const income = finance?.totals?.income || 0
  const expenses = finance?.totals?.expenses || 0

  autoTable(doc, {
    startY: y,
    head: [['', 'Amount (GHS)']],
    body: [
      ['Total Income (All Time)',   formatGHS(income)],
      ['Total Expenses (All Time)', formatGHS(expenses)],
      ['Net Balance',               formatGHS(net)],
    ],
    theme: 'striped',
    headStyles:  { fillColor: [5, 150, 105], textColor: 255 },
    styles:      { fontSize: 9 },
    columnStyles:{ 0: { fontStyle: 'bold', cellWidth: 90 } },
    bodyStyles:  (row) => row.index === 2 ? { fontStyle: 'bold', textColor: net >= 0 ? [5, 150, 105] : [220, 38, 38] } : {},
    margin:      { left: MARGIN, right: MARGIN },
  })
  y = doc.lastAutoTable.finalY + 6

  // Income by type
  if (finance?.byType?.length) {
    autoTable(doc, {
      startY: y,
      head: [['Income Type', 'Transactions', 'Amount (GHS)']],
      body: finance.byType.map(t => [
        OFFERING_LABELS[t.type] || t.type,
        t.count,
        formatGHS(t.total)
      ]),
      theme: 'striped',
      headStyles:  { fillColor: [6, 182, 212], textColor: 255 },
      styles:      { fontSize: 9 },
      margin:      { left: MARGIN, right: MARGIN },
    })
    y = doc.lastAutoTable.finalY + 6
  }

  // Expenses by category
  if (finance?.byCategory?.length) {
    autoTable(doc, {
      startY: y,
      head: [['Expense Category', 'Transactions', 'Amount (GHS)']],
      body: finance.byCategory.map(c => [
        EXPENSE_LABELS[c.category] || c.category,
        c.count,
        formatGHS(c.total)
      ]),
      theme: 'striped',
      headStyles:  { fillColor: [239, 68, 68], textColor: 255 },
      styles:      { fontSize: 9 },
      margin:      { left: MARGIN, right: MARGIN },
    })
    y = doc.lastAutoTable.finalY + 10
  }

  // ── 3. ATTENDANCE ──────────────────────────
  if (y > 240) { doc.addPage(); y = 20 }   // new page if needed

  sectionTitle('ATTENDANCE REPORT')
  if (attendance?.services?.length) {
    autoTable(doc, {
      startY: y,
      head: [['Service', 'Date', 'Type', 'Present', 'Expected', 'Rate %']],
      body: attendance.services.map(s => [
        s.name,
        new Date(s.date).toLocaleDateString('en-GH'),
        s.type,
        s.present,
        s.expected,
        `${s.rate}%`
      ]),
      theme: 'striped',
      headStyles:  { fillColor: [79, 70, 229], textColor: 255 },
      styles:      { fontSize: 8 },
      margin:      { left: MARGIN, right: MARGIN },
    })
    y = doc.lastAutoTable.finalY + 6
  }

  // Avg rate note
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(`Average Attendance Rate: ${attendance?.avgRate || 0}%`, MARGIN, y)
  y += 10

  // ── 4. TOP GIVERS ──────────────────────────
  if (finance?.topGivers?.length) {
    if (y > 240) { doc.addPage(); y = 20 }
    sectionTitle('TOP GIVERS')
    autoTable(doc, {
      startY: y,
      head: [['#', 'Member', 'Total Given (GHS)']],
      body: finance.topGivers.map((g, i) => [i + 1, g.name, formatGHS(g.total)]),
      theme: 'striped',
      headStyles:  { fillColor: [217, 119, 6], textColor: 255 },
      styles:      { fontSize: 9 },
      margin:      { left: MARGIN, right: MARGIN },
    })
    y = doc.lastAutoTable.finalY + 10
  }

  // ── Footer on every page ───────────────────
  const totalPages = doc.internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFontSize(8)
    doc.setTextColor(160, 160, 160)
    doc.text(
      `MinistryOS by EM Control IT Solutions — Page ${p} of ${totalPages}`,
      MARGIN, 290
    )
  }

  doc.save(`MinistryOS-Report-${new Date().toLocaleDateString('en-GH').replace(/\//g, '-')}.pdf`)
}

// ─── OVERVIEW STAT CARD ───────────────────────
function OverviewCard({ label, value, sub, icon: Icon, color, trend }) {
  return (
    <div className="report-stat-card">
      <div className="report-stat-top">
        <div className="report-stat-icon" style={{ background: color + '18' }}>
          <Icon size={18} color={color} />
        </div>
        {trend !== undefined && trend !== 0 && (
          <span className={`stat-trend ${trend >= 0 ? 'up' : 'down'}`}>
            {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="report-stat-value">{value}</p>
      <p className="report-stat-label">{label}</p>
      {sub && <p className="report-stat-sub">{sub}</p>}
    </div>
  )
}

// ─── GROUPED BAR CHART (Income vs Expenses) ──
function GroupedBarChart({ incomeData, expenseData }) {
  const allVals = [
    ...incomeData.map(d => d.total),
    ...expenseData.map(d => d.total)
  ]
  const max = Math.max(...allVals, 1)

  return (
    <div style={{ padding: 'var(--space-4) var(--space-4) 0' }}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--success)' }} />
          Income
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--danger)' }} />
          Expenses
        </div>
      </div>

      {/* Bars */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-2)', height: 160 }}>
        {incomeData.map((item, i) => {
          const incH  = Math.max((item.total / max) * 140, item.total > 0 ? 4 : 0)
          const expH  = Math.max(((expenseData[i]?.total || 0) / max) * 140, (expenseData[i]?.total || 0) > 0 ? 4 : 0)
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              {/* Bar pair */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 140, width: '100%' }}>
                {/* Income bar */}
                <div style={{ flex: 1, height: incH, background: 'var(--success)', borderRadius: '3px 3px 0 0', transition: 'height 0.8s ease', minWidth: 0 }}
                  title={`Income: ${formatGHS(item.total)}`} />
                {/* Expense bar */}
                <div style={{ flex: 1, height: expH, background: 'var(--danger)', borderRadius: '3px 3px 0 0', transition: 'height 0.8s ease', minWidth: 0 }}
                  title={`Expenses: ${formatGHS(expenseData[i]?.total || 0)}`} />
              </div>
              {/* Month label */}
              <p style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2 }}>
                {item.month.split(' ')[0]}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── SIMPLE BAR CHART ─────────────────────────
function BarChart({ data, valueKey, labelKey, color = 'var(--primary)', formatValue }) {
  const max = Math.max(...data.map(d => d[valueKey] || 0), 1)
  return (
    <div className="bar-chart">
      {data.map((item, i) => (
        <div key={i} className="bar-chart-item">
          <div className="bar-chart-bar-wrap">
            <div className="bar-chart-bar"
              style={{ height: `${Math.max((item[valueKey] / max) * 100, 2)}%`, background: color }} />
          </div>
          <p className="bar-chart-value">
            {formatValue ? formatValue(item[valueKey]) : item[valueKey]}
          </p>
          <p className="bar-chart-label">{item[labelKey]}</p>
        </div>
      ))}
    </div>
  )
}

// ─── DONUT CHART ──────────────────────────────
function DonutChart({ data, total }) {
  const colors = ['var(--primary)', 'var(--success)', 'var(--warning)', 'var(--danger)', 'var(--info)', '#7C3AED']
  let cumulative = 0

  const segments = data.map((item, i) => {
    const pct   = total > 0 ? (item.count / total) * 100 : 0
    const start = cumulative
    cumulative += pct
    return { ...item, pct, start, color: colors[i % colors.length] }
  })

  const radius       = 40
  const circumference = 2 * Math.PI * radius

  return (
    <div className="donut-chart-wrap">
      <svg viewBox="0 0 100 100" className="donut-svg">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--border)" strokeWidth="12" />
        {segments.map((seg, i) => (
          <circle key={i} cx="50" cy="50" r={radius}
            fill="none" stroke={seg.color} strokeWidth="12"
            strokeDasharray={`${(seg.pct / 100) * circumference} ${circumference}`}
            strokeDashoffset={`${-((seg.start / 100) * circumference)}`}
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        ))}
        <text x="50" y="46" textAnchor="middle" fontSize="14" fontWeight="bold" fill="var(--text-primary)">{total}</text>
        <text x="50" y="58" textAnchor="middle" fontSize="7" fill="var(--text-muted)">Total</text>
      </svg>
      <div className="donut-legend">
        {segments.map((seg, i) => (
          <div key={i} className="donut-legend-item">
            <div className="donut-legend-dot" style={{ background: seg.color }} />
            <span className="donut-legend-label">
              {seg._id ? seg._id.charAt(0).toUpperCase() + seg._id.slice(1).replace('_', ' ') : 'Unknown'}
            </span>
            <span className="donut-legend-value">{seg.count} ({seg.pct.toFixed(0)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── ATTENDANCE TABLE ─────────────────────────
function AttendanceTable({ services }) {
  return (
    <div className="report-table-wrap">
      <table className="report-table">
        <thead>
          <tr>
            <th>Service</th><th>Date</th><th>Type</th>
            <th>Present</th><th>Expected</th><th>Rate</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>{s.name}</td>
              <td>{new Date(s.date).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
              <td>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  {s.type.charAt(0).toUpperCase() + s.type.slice(1)}
                </span>
              </td>
              <td style={{ color: 'var(--success)', fontWeight: 'var(--weight-semibold)' }}>{s.present}</td>
              <td style={{ color: 'var(--text-secondary)' }}>{s.expected}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 6, background: 'var(--surface-2)', borderRadius: 999, minWidth: 60 }}>
                    <div style={{
                      height: '100%', borderRadius: 999, width: `${s.rate}%`,
                      background: s.rate >= 75 ? 'var(--success)' : s.rate >= 50 ? 'var(--warning)' : 'var(--danger)'
                    }} />
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{s.rate}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── TOP LIST ─────────────────────────────────
function TopList({ items, valueFormatter, emptyMsg }) {
  if (!items?.length) return (
    <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
      {emptyMsg || 'No data available.'}
    </div>
  )
  const max = Math.max(...items.map(i => i.count || i.total || 0), 1)
  return (
    <div className="top-list">
      {items.map((item, i) => {
        const val = item.count || item.total || 0
        const pct = (val / max) * 100
        return (
          <div key={i} className="top-list-item">
            <div className="top-list-rank">{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>{item.name}</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 'var(--weight-semibold)' }}>
                  {valueFormatter ? valueFormatter(val) : val}
                </span>
              </div>
              <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 999 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'var(--primary)', borderRadius: 999, transition: 'width 0.8s ease' }} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── MAIN REPORTS PAGE ────────────────────────
export default function Reports() {
  const [activeTab, setActiveTab]   = useState('overview')
  const [overview, setOverview]     = useState(null)
  const [attendance, setAttendance] = useState(null)
  const [finance, setFinance]       = useState(null)
  const [members, setMembersData]   = useState(null)
  const [loading, setLoading]       = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)

  const TABS = [
    { id: 'overview',   label: 'Overview',   icon: BarChart3     },
    { id: 'members',    label: 'Members',    icon: Users         },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'finance',    label: 'Finance',    icon: Wallet        },
  ]

  const { api, branchReady } = useApi()

  const fetchAll = useCallback(async () => {
    if (!branchReady) return
    setLoading(true)
    try {
      const [oData, aData, fData, mData] = await Promise.all([
        api('/reports/overview'),
        api('/reports/attendance'),
        api('/reports/finance'),
        api('/reports/members'),
      ])
      if (oData.success) setOverview(oData.overview)
      if (aData.success) setAttendance(aData.attendance)
      if (fData.success) setFinance(fData.finance)
      if (mData.success) setMembersData(mData.members)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [api, branchReady])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchAll() }, [fetchAll])

  const handleExportPDF = () => {
    if (!overview || !finance || !attendance || !members) return
    setPdfLoading(true)
    try {
      generatePDF({ overview, finance, attendance, members })
    } finally {
      setPdfLoading(false)
    }
  }

  if (loading) return <LoadingSpinner message="Loading reports..." />

  // Net balance for Finance tab display
  const net      = finance?.totals?.net      || 0
  const isProfit = net >= 0

  return (
    <div className="reports-page">

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Insights across your entire church</p>
        </div>
        <button className="btn-primary" onClick={handleExportPDF} disabled={pdfLoading}>
          <FileDown size={16} />
          {pdfLoading ? 'Generating...' : 'Export PDF'}
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="settings-tabs">
        {TABS.map(tab => (
          <button key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}>
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ══ OVERVIEW TAB ══ */}
      {activeTab === 'overview' && overview && (
        <div className="reports-content">
          <div className="report-stats-grid">
            <OverviewCard label="Total Members"      value={overview.members.total}
              sub={`+${overview.members.newThisMonth} this month`}
              icon={Users} color="var(--primary)" trend={overview.members.growth} />
            <OverviewCard label="Active Members"     value={overview.members.active}
              sub={`${overview.members.inactive} inactive`}
              icon={TrendingUp} color="var(--success)" />
            <OverviewCard label="Income This Year"   value={formatGHS(overview.finance.thisYear)}
              sub={`${formatGHS(overview.finance.thisMonth)} this month`}
              icon={Wallet} color="var(--success)" />
            <OverviewCard label="Expenses This Year" value={formatGHS(overview.finance.expensesYear)}
              sub={`${formatGHS(overview.finance.expensesMonth)} this month`}
              icon={TrendingDown} color="var(--danger)" />
            <OverviewCard label="Net Balance (Year)" value={formatGHS(overview.finance.netYear)}
              sub={overview.finance.netYear >= 0 ? 'Surplus' : 'Deficit'}
              icon={BarChart3} color={overview.finance.netYear >= 0 ? 'var(--info)' : 'var(--danger)'} />
            <OverviewCard label="Services Recorded"  value={overview.services.total}
              sub={`${overview.services.thisMonth} this month`}
              icon={CalendarCheck} color="var(--warning)" />
          </div>

          <div className="reports-grid-2">
            <div className="report-card">
              <div className="report-card-header"><h3>Member Status Breakdown</h3></div>
              {members?.byStatus?.length > 0
                ? <DonutChart data={members.byStatus} total={overview.members.total} />
                : <p style={{ padding: 'var(--space-6)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No data yet.</p>}
            </div>
            <div className="report-card">
              <div className="report-card-header"><h3>Members by Department</h3></div>
              {members?.byDept?.length > 0 ? (
                <div className="top-list">
                  {members.byDept.map((d, i) => (
                    <div key={i} className="top-list-item">
                      <div className="top-list-rank" style={{ background: (d.color || 'var(--primary)') + '22', color: d.color || 'var(--primary)' }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>{d.name || 'Unassigned'}</span>
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 'var(--weight-semibold)' }}>{d.count} members</span>
                        </div>
                        <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 999 }}>
                          <div style={{ height: '100%', width: `${(d.count / overview.members.total) * 100}%`, background: d.color || 'var(--primary)', borderRadius: 999, transition: 'width 0.8s ease' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p style={{ padding: 'var(--space-6)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No departments yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ══ MEMBERS TAB ══ */}
      {activeTab === 'members' && members && (
        <div className="reports-content">
          <div className="reports-grid-2">
            <div className="report-card">
              <div className="report-card-header"><h3>Member Growth (Last 6 Months)</h3></div>
              {members.monthlyJoins?.length > 0
                ? <BarChart data={members.monthlyJoins} valueKey="count" labelKey="month" color="var(--primary)" />
                : <p style={{ padding: 'var(--space-6)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No data yet.</p>}
            </div>
            <div className="report-card">
              <div className="report-card-header"><h3>Members by Gender</h3></div>
              {members.byGender?.length > 0
                ? <DonutChart data={members.byGender} total={members.byGender.reduce((s, g) => s + g.count, 0)} />
                : <p style={{ padding: 'var(--space-6)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No data yet.</p>}
            </div>
            <div className="report-card">
              <div className="report-card-header"><h3>Member Status Distribution</h3></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: 'var(--space-4)' }}>
                {members.byStatus?.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', background: STATUS_COLORS[s._id]?.bg || 'var(--surface-2)' }}>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: STATUS_COLORS[s._id]?.color || 'var(--text-secondary)', textTransform: 'capitalize' }}>
                      {s._id?.replace('_', ' ') || 'Unknown'}
                    </span>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: STATUS_COLORS[s._id]?.color || 'var(--text-primary)' }}>{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="report-card">
              <div className="report-card-header"><h3>Members by Department</h3></div>
              <TopList
                items={members.byDept?.map(d => ({ name: d.name || 'Unassigned', count: d.count }))}
                emptyMsg="No departments set up yet." />
            </div>
          </div>
        </div>
      )}

      {/* ══ ATTENDANCE TAB ══ */}
      {activeTab === 'attendance' && attendance && (
        <div className="reports-content">
          <div className="report-avg-banner">
            <CalendarCheck size={20} color="var(--primary)" />
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>Average Attendance Rate</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Across last {attendance.services?.length} services</p>
            </div>
            <p style={{ marginLeft: 'auto', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)', color: attendance.avgRate >= 75 ? 'var(--success)' : attendance.avgRate >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
              {attendance.avgRate}%
            </p>
          </div>
          <div className="report-card">
            <div className="report-card-header"><h3>Recent Services — Attendance Breakdown</h3></div>
            {attendance.services?.length > 0
              ? <AttendanceTable services={attendance.services} />
              : <p style={{ padding: 'var(--space-6)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No services recorded yet.</p>}
          </div>
          <div className="report-card">
            <div className="report-card-header">
              <h3>Most Consistent Attenders</h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>By number of services attended</p>
            </div>
            <TopList items={attendance.topAttenders?.map(a => ({ name: a.name, count: a.count }))} emptyMsg="No attendance data yet." />
          </div>
        </div>
      )}

      {/* ══ FINANCE TAB ══ */}
      {activeTab === 'finance' && finance && (
        <div className="reports-content">

          {/* ── Net Balance Banner ── */}
              <div className={`report-net-banner ${isProfit ? 'profit' : 'deficit'}`}>


            <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>Total Income</p>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-extrabold)', color: 'var(--success)' }}>
                  {formatGHS(finance.totals?.income)}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>Total Expenses</p>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-extrabold)', color: 'var(--danger)' }}>
                  {formatGHS(finance.totals?.expenses)}
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>
                Net Balance (All Time)
              </p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)', color: isProfit ? 'var(--success)' : 'var(--danger)' }}>
                {formatGHS(net)}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: isProfit ? 'var(--success)' : 'var(--danger)' }}>
                {isProfit ? '▲ Surplus' : '▼ Deficit'}
              </p>
            </div>
          </div>

          {/* ── Income vs Expenses Monthly Chart ── */}
          <div className="report-card">
            <div className="report-card-header">
              <h3>Income vs Expenses — Last 6 Months</h3>
            </div>
            {(finance.monthlyIncome?.some(m => m.total > 0) || finance.monthlyExpenses?.some(m => m.total > 0))
              ? <GroupedBarChart incomeData={finance.monthlyIncome || []} expenseData={finance.monthlyExpenses || []} />
              : <p style={{ padding: 'var(--space-6)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No data yet.</p>}
          </div>

          <div className="reports-grid-2">

            {/* ── Income by Offering Type ── */}
            <div className="report-card">
              <div className="report-card-header">
                <h3>Income Breakdown</h3>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: '#D1FAE5', color: '#065F46' }}>
                  Income
                </span>
              </div>
              {finance.byType?.length > 0 ? (
                <div style={{ padding: '0 var(--space-4)' }}>
                  {finance.byType.map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) 0', borderBottom: i < finance.byType.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>
                          {OFFERING_LABELS[t.type] || t.type}
                        </p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{t.count} transactions</p>
                      </div>
                      <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', color: 'var(--success)' }}>
                        {formatGHS(t.total)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : <p style={{ padding: 'var(--space-6)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No income data yet.</p>}
            </div>

            {/* ── Expenses by Category ── */}
            <div className="report-card">
              <div className="report-card-header">
                <h3>Expense Breakdown</h3>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: '#FEE2E2', color: '#991B1B' }}>
                  Expenses
                </span>
              </div>
              {finance.byCategory?.length > 0 ? (
                <div style={{ padding: '0 var(--space-4)' }}>
                  {finance.byCategory.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) 0', borderBottom: i < finance.byCategory.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: EXPENSE_COLORS[c.category] || '#94A3B8', flexShrink: 0 }} />
                        <div>
                          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>
                            {EXPENSE_LABELS[c.category] || c.category}
                          </p>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{c.count} transactions</p>
                        </div>
                      </div>
                      <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', color: 'var(--danger)' }}>
                        {formatGHS(c.total)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                  No expenses recorded yet.
                  <br />
                  <span style={{ fontSize: 'var(--text-xs)' }}>Start recording expenses in the Finance page.</span>
                </div>
              )}
            </div>

          </div>

          {/* ── Top Givers ── */}
          <div className="report-card">
            <div className="report-card-header">
              <h3>Top Givers</h3>
              <Crown size={16} color="var(--warning)" />
            </div>
            <TopList
              items={finance.topGivers?.map(g => ({ name: g.name, total: g.total }))}
              valueFormatter={(v) => formatGHS(v)}
              emptyMsg="No giving data linked to members yet." />
          </div>

        </div>
      )}

    </div>
  )
}