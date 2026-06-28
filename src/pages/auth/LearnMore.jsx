import { useState, useEffect } from 'react'
import { ArrowRight, Check } from 'lucide-react'

/* ── IMAGE PATHS ──────────────────────────────────────────────────────────────
   Copy all screenshot files to /public/learn/ in your Vite project.
   Rename them to match the keys below.
   The logo (WhatsApp_Image_2026-06-27...) → /public/learn/logo.png
   ──────────────────────────────────────────────────────────────────────────── */
const IMG = {
  logo:           '/learn/logo.png',
  dashboard:      '/learn/dashboard.png',
  dashBranch:     '/learn/dash-branch.png',
  membersList:    '/learn/members-list.png',
  memberProfile:  '/learn/member-profile.png',
  memberAttend:   '/learn/member-attend.png',
  memberGiving:   '/learn/member-giving.png',
  globalSearch:   '/learn/global-search.png',
  attendCreate:   '/learn/attend-create.png',
  attendCheckin:  '/learn/attend-checkin.png',
  attendSearch:   '/learn/attend-search.png',
  departments:    '/learn/departments.png',
  comms:          '/learn/comms.png',
  reportsFinance: '/learn/reports-finance.png',
  reportsAttend:  '/learn/reports-attend.png',
  settingsTeam:   '/learn/settings-team.png',
  settingsAdd:    '/learn/settings-add.png',
  settingsBranch: '/learn/settings-branch.png',
  settingsTheme:  '/learn/settings-theme.png',
  billingPlans:   '/learn/billing-plans.png',
  billingSms:     '/learn/billing-sms.png',
}

/* ── ANNOTATION PILL ─────────────────────────────────────────────────────── */
function Pill({ top, left, right, bottom, color = '#4F46E5', label, delay = 0 }) {
  return (
    <div style={{
      position: 'absolute', top, left, right, bottom,
      background: color, color: '#fff',
      fontSize: 11, fontWeight: 700,
      padding: '4px 10px', borderRadius: 99,
      whiteSpace: 'nowrap',
      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
      zIndex: 10,
      animation: `pill-in 0.5s ease ${delay}s both`,
      pointerEvents: 'none',
    }}>
      {label}
    </div>
  )
}

/* ── BROWSER FRAME ───────────────────────────────────────────────────────── */
function BrowserFrame({ src, alt, pills = [] }) {
  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
      border: '1px solid #E5E7EB', background: '#fff',
    }}>
      <div style={{
        height: 36, background: '#F3F4F6',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex', alignItems: 'center', padding: '0 14px', gap: 6,
      }}>
        {['#FC5858','#FCBA58','#58FC85'].map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
        ))}
        <div style={{
          flex: 1, margin: '0 10px', background: '#fff', borderRadius: 4,
          height: 20, display: 'flex', alignItems: 'center', padding: '0 8px',
        }}>
          <span style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace' }}>
            ministryosapp.com
          </span>
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <img src={src} alt={alt} loading="lazy"
          style={{ width: '100%', display: 'block', maxHeight: 460, objectFit: 'cover', objectPosition: 'top' }} />
        {pills.map((p, i) => <Pill key={i} {...p} />)}
      </div>
    </div>
  )
}

/* ── FEATURE ROW ─────────────────────────────────────────────────────────── */
function FeatureRow({ eyebrow, title, body, bullets, img, alt, pills = [], reverse, accent, bg }) {
  return (
    <section style={{ background: bg, padding: '88px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 64, alignItems: 'center',
        }} className={`fr-grid${reverse ? ' fr-rev' : ''}`}>
          <div className={reverse ? 'fr-text-rev' : ''}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent, margin: '0 0 12px' }}>
              {eyebrow}
            </p>
            <h2 style={{ fontSize: 'clamp(24px,3vw,38px)', fontWeight: 900, color: '#111827', letterSpacing: '-0.8px', lineHeight: 1.1, margin: '0 0 16px' }}>
              {title}
            </h2>
            <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.75, margin: '0 0 28px', maxWidth: 460 }}>
              {body}
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {bullets.map((b, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 2, background: accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={11} color={accent} strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.65 }}>
                    {b.bold ? <><strong>{b.bold}</strong>{' '}{b.rest}</> : b}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className={reverse ? 'fr-screen-rev' : ''}>
            <BrowserFrame src={img} alt={alt} pills={pills} />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── MAIN ────────────────────────────────────────────────────────────────── */
export default function LearnMore() {
  const [scrolled,  setScrolled]  = useState(false)
  const [memberTab, setMemberTab] = useState('overview')

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* Member profile tab data */
  const memberTabs = {
    overview: {
      src:   IMG.memberProfile,
      pills: [
        { top: '8%',  left: '38%', label: 'Overview · Attendance · Giving', color: '#4F46E5', delay: 0 },
        { top: '40%', left: '38%', label: 'Personal info — phone, DOB, gender', color: '#6B7280', delay: 0.1 },
        { top: '68%', left: '38%', label: 'Church info — ID, join date, dept', color: '#059669', delay: 0.2 },
      ],
      bullets: [
        { bold: 'Personal details:', rest: 'Phone, gender, date of birth, marital status — everything in one place.' },
        { bold: 'Church information:', rest: 'Auto-generated Member ID, join date, department, cell group, and baptism status.' },
        { bold: 'Quick actions:', rest: 'Call member, send message, or edit their profile directly from this screen.' },
      ],
    },
    attendance: {
      src:   IMG.memberAttend,
      pills: [
        { top: '10%', left: '38%', label: '100% Attendance Rate', color: '#059669', delay: 0 },
        { top: '36%', left: '38%', label: 'Consistency progress bar', color: '#4F46E5', delay: 0.1 },
        { top: '58%', left: '38%', label: 'Full service history with dates', color: '#7C3AED', delay: 0.2 },
      ],
      bullets: [
        { bold: 'Attendance rate:', rest: 'See exactly how consistently each member shows up — as a percentage.' },
        { bold: 'Consistency bar:', rest: 'A visual progress bar across all services recorded for that member.' },
        { bold: 'Service history:', rest: 'Every service attended or missed, with the exact date and service name.' },
      ],
    },
    giving: {
      src:   IMG.memberGiving,
      pills: [
        { top: '10%', left: '38%', label: 'Total · This Year · This Month', color: '#D97706', delay: 0 },
      ],
      bullets: [
        { bold: 'Total giving (all time):', rest: 'The complete giving picture for that member — every contribution ever recorded.' },
        { bold: 'Yearly & monthly view:', rest: 'Filter by this year or this month to see recent giving patterns.' },
        { bold: 'Giving statements:', rest: 'Useful for recognising faithful givers or preparing end-of-year acknowledgements.' },
      ],
    },
  }

  const mt = memberTabs[memberTab]

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .lmr { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; background: #fff; overflow-x: hidden; }

        /* NAV */
        .lmr-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 200; height: 60px; display: flex; align-items: center; padding: 0 24px; transition: background .2s, box-shadow .2s; }
        .lmr-nav.on { background: rgba(255,255,255,.96); backdrop-filter: blur(16px); box-shadow: 0 1px 0 rgba(0,0,0,.07); }
        .lmr-nav-in { max-width: 1100px; margin: 0 auto; width: 100%; display: flex; align-items: center; justify-content: space-between; }
        .lmr-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; font-size: 18px; font-weight: 800; color: #111827; letter-spacing: -.4px; }
        .lmr-logo img { width: 32px; height: 32px; border-radius: 8px; object-fit: contain; }
        .lmr-nav-r { display: flex; align-items: center; gap: 10px; }
        .lmr-nav-link { font-size: 14px; font-weight: 600; color: #374151; text-decoration: none; padding: 6px 12px; border-radius: 8px; transition: background .12s; }
        .lmr-nav-link:hover { background: #F3F4F6; }
        .lmr-nav-btn { font-size: 14px; font-weight: 700; color: #fff; background: #4F46E5; border: none; border-radius: 8px; padding: 8px 18px; cursor: pointer; text-decoration: none; }
        .lmr-nav-btn:hover { background: #4338CA; }

        /* HERO */
        .lmr-hero { min-height: 100vh; background: linear-gradient(155deg,#1E1B4B 0%,#312E81 35%,#4F46E5 70%,#6D28D9 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 120px 24px 80px; position: relative; overflow: hidden; }
        .lmr-hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px); background-size: 64px 64px; pointer-events: none; }
        .lmr-hero-glow { position: absolute; width: 800px; height: 800px; border-radius: 50%; background: radial-gradient(circle,rgba(139,92,246,.3) 0%,transparent 65%); top: 50%; left: 50%; transform: translate(-50%,-60%); pointer-events: none; }
        .lmr-hero-body { position: relative; z-index: 2; max-width: 840px; }
        .lmr-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #A5B4FC; background: rgba(99,102,241,.18); border: 1px solid rgba(165,180,252,.3); padding: 6px 14px; border-radius: 99px; margin-bottom: 28px; }
        .lmr-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #A5B4FC; animation: lmr-pulse 2s infinite; }
        @keyframes lmr-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        .lmr-h1 { font-size: clamp(40px,6.5vw,82px); font-weight: 900; color: #fff; line-height: 1.03; letter-spacing: -3px; margin-bottom: 24px; }
        .lmr-h1 em { font-style: normal; background: linear-gradient(90deg,#A5B4FC,#C4B5FD,#F9A8D4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .lmr-sub { font-size: clamp(16px,1.8vw,19px); color: rgba(255,255,255,.62); max-width: 580px; margin: 0 auto 44px; line-height: 1.75; }
        .lmr-hero-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .lmr-btn-main { display: inline-flex; align-items: center; gap: 10px; background: #fff; color: #4F46E5; font-size: 15px; font-weight: 800; padding: 15px 28px; border-radius: 12px; border: none; cursor: pointer; text-decoration: none; box-shadow: 0 4px 24px rgba(0,0,0,.2); transition: transform .15s,box-shadow .15s; }
        .lmr-btn-main:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,.25); }
        .lmr-btn-ghost { display: inline-flex; align-items: center; gap: 8px; color: rgba(255,255,255,.8); font-size: 15px; font-weight: 600; text-decoration: none; padding: 15px 22px; border: 1px solid rgba(255,255,255,.2); border-radius: 12px; transition: background .15s; }
        .lmr-btn-ghost:hover { background: rgba(255,255,255,.08); }

        /* DASHBOARD SHOWCASE */
        .lmr-dash-show { background: linear-gradient(180deg,#1E1B4B 0%,#312E81 100%); padding: 0 24px 80px; }
        .lmr-dash-frame { max-width: 1000px; margin: 0 auto; border-radius: 16px; overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.08); position: relative; }
        .lmr-dash-chrome { height: 38px; background: #1F2937; border-bottom: 1px solid rgba(255,255,255,.06); display: flex; align-items: center; padding: 0 14px; gap: 6px; }
        .lmr-dash-dot { width: 11px; height: 11px; border-radius: 50%; }
        .lmr-dash-url { flex: 1; margin: 0 12px; background: rgba(255,255,255,.05); border-radius: 4px; height: 22px; display: flex; align-items: center; padding: 0 10px; }
        .lmr-dash-url span { font-size: 10.5px; color: rgba(255,255,255,.35); font-family: monospace; }
        .lmr-dash-cap { text-align: center; color: rgba(255,255,255,.4); font-size: 13px; margin-top: 20px; }

        /* STATS */
        .lmr-stats { background: #F8F7FF; border-top: 1px solid #EDE9FE; border-bottom: 1px solid #EDE9FE; padding: 52px 24px; }
        .lmr-stats-g { max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: repeat(4,1fr); }
        .lmr-stat { text-align: center; padding: 0 20px; border-right: 1px solid #DDD6FE; }
        .lmr-stat:last-child { border-right: none; }
        .lmr-stat-val { font-size: clamp(28px,4vw,44px); font-weight: 900; line-height: 1; letter-spacing: -1.5px; }
        .lmr-stat-lbl { font-size: 12px; color: #6B7280; margin-top: 6px; font-weight: 500; }

        /* FEATURE GRID LAYOUT */
        .fr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        .fr-rev .fr-text-rev { order: 2; }
        .fr-rev .fr-screen-rev { order: 1; }

        /* MEMBER PROFILE TABS */
        .lmr-tab-bar { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 24px; }
        .lmr-tab { font-size: 12px; font-weight: 700; padding: 7px 16px; border-radius: 99px; border: 1.5px solid #E5E7EB; background: #fff; color: #6B7280; cursor: pointer; transition: all .15s; }
        .lmr-tab.on { background: #4F46E5; border-color: #4F46E5; color: #fff; }

        /* SETTINGS 2x2 */
        .lmr-set-g { display: grid; grid-template-columns: repeat(2,1fr); gap: 24px; margin-top: 40px; }
        .lmr-set-label { font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 10px; }
        .lmr-set-caption { font-size: 13px; color: #6B7280; margin-top: 10px; line-height: 1.6; }

        /* PRICING */
        .lmr-plans-g { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; max-width: 1000px; margin: 0 auto; }
        .lmr-plan { background: #fff; border: 1.5px solid #E5E7EB; border-radius: 16px; padding: 28px; position: relative; transition: box-shadow .15s; }
        .lmr-plan:hover { box-shadow: 0 8px 32px rgba(0,0,0,.07); }
        .lmr-plan-badge { position: absolute; top: -13px; left: 50%; transform: translateX(-50%); font-size: 11px; font-weight: 800; padding: 4px 14px; border-radius: 99px; color: #fff; white-space: nowrap; }
        .lmr-plan-name { font-size: 18px; font-weight: 800; color: #111827; margin-bottom: 6px; }
        .lmr-plan-price { font-size: 32px; font-weight: 900; line-height: 1; margin-bottom: 4px; }
        .lmr-plan-per { font-size: 13px; color: #9CA3AF; margin-bottom: 20px; }
        .lmr-plan-feats { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
        .lmr-plan-feat { display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: #374151; }
        .lmr-plan-btn { display: block; text-align: center; color: #fff; font-weight: 800; font-size: 14px; padding: 12px 0; border-radius: 10px; text-decoration: none; transition: opacity .15s; }
        .lmr-plan-btn:hover { opacity: .88; }

        /* WHY */
        .lmr-why-g { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; max-width: 1100px; margin: 0 auto; }
        .lmr-why-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 28px; transition: box-shadow .15s,transform .15s; }
        .lmr-why-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,.07); transform: translateY(-2px); }
        .lmr-why-icon { font-size: 26px; margin-bottom: 14px; }
        .lmr-why-title { font-size: 15px; font-weight: 800; color: #111827; margin-bottom: 8px; }
        .lmr-why-body { font-size: 13.5px; color: #6B7280; line-height: 1.7; }

        /* TESTIMONIALS */
        .lmr-testi-sec { background: linear-gradient(155deg,#1E1B4B 0%,#3730A3 50%,#4F46E5 100%); padding: 100px 24px; }
        .lmr-testi-g { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; max-width: 1100px; margin: 48px auto 0; }
        .lmr-testi-card { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1); border-radius: 16px; padding: 28px; backdrop-filter: blur(8px); }
        .lmr-testi-q { font-size: 14px; line-height: 1.75; color: rgba(255,255,255,.78); font-style: italic; margin-bottom: 20px; }
        .lmr-testi-p { display: flex; align-items: center; gap: 12px; }
        .lmr-testi-av { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: #fff; flex-shrink: 0; }
        .lmr-testi-name { font-size: 13px; font-weight: 700; color: #fff; }
        .lmr-testi-role { font-size: 11px; color: rgba(255,255,255,.45); margin-top: 2px; }

        /* CTA */
        .lmr-cta { padding: 100px 24px; background: #fff; text-align: center; }
        .lmr-cta-in { max-width: 640px; margin: 0 auto; }
        .lmr-cta-h2 { font-size: clamp(30px,4.5vw,54px); font-weight: 900; color: #111827; letter-spacing: -1.5px; line-height: 1.07; margin-bottom: 18px; }
        .lmr-cta-h2 em { font-style: normal; color: #4F46E5; }
        .lmr-cta-body { font-size: 17px; color: #6B7280; line-height: 1.7; margin-bottom: 40px; }
        .lmr-cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .lmr-cta-primary { display: inline-flex; align-items: center; gap: 8px; background: #4F46E5; color: #fff; font-size: 15px; font-weight: 800; padding: 15px 30px; border-radius: 12px; text-decoration: none; transition: background .15s,transform .15s; }
        .lmr-cta-primary:hover { background: #4338CA; transform: translateY(-1px); }
        .lmr-cta-secondary { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #374151; font-size: 15px; font-weight: 700; padding: 15px 28px; border-radius: 12px; text-decoration: none; border: 1.5px solid #E5E7EB; transition: border-color .15s; }
        .lmr-cta-secondary:hover { border-color: #C7D2FE; color: #4F46E5; }
        .lmr-cta-note { font-size: 13px; color: #9CA3AF; margin-top: 20px; }

        /* FOOTER */
        .lmr-footer { padding: 28px 24px; text-align: center; border-top: 1px solid #F3F4F6; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .lmr-footer img { width: 22px; height: 22px; border-radius: 5px; }
        .lmr-footer span { font-size: 12px; color: #9CA3AF; }

        /* DIVIDER */
        .lmr-div { height: 1px; background: #F3F4F6; max-width: 1100px; margin: 0 auto; }

        /* HELPERS */
        .lmr-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
        .lmr-h2 { font-size: clamp(26px,3.5vw,44px); font-weight: 900; color: #111827; letter-spacing: -1px; line-height: 1.1; margin-bottom: 16px; }
        .lmr-body { font-size: 16px; color: #6B7280; line-height: 1.75; }

        /* PILL ANIMATION */
        @keyframes pill-in { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .fr-grid { grid-template-columns: 1fr; gap: 32px; }
          .fr-rev .fr-text-rev, .fr-rev .fr-screen-rev { order: unset; }
          .lmr-stats-g { grid-template-columns: repeat(2,1fr); gap: 32px; }
          .lmr-stat { border-right: none; border-bottom: 1px solid #DDD6FE; padding-bottom: 20px; }
          .lmr-stat:last-child { border-bottom: none; }
          .lmr-why-g { grid-template-columns: 1fr; }
          .lmr-plans-g { grid-template-columns: 1fr; }
          .lmr-testi-g { grid-template-columns: 1fr; }
          .lmr-set-g { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .lmr-hero { padding: 100px 20px 60px; }
          .lmr-nav-link { display: none; }
          .lmr-h1 { letter-spacing: -1.5px; }
        }
      `}</style>

      <div className="lmr">

        {/* ── NAV ── */}
        <nav className={`lmr-nav${scrolled ? ' on' : ''}`}>
          <div className="lmr-nav-in">
            <a href="/" className="lmr-logo">
              <img src={IMG.logo} alt="MinistryOS logo" />
              MinistryOS
            </a>
            <div className="lmr-nav-r">
              <a href="/login"    className="lmr-nav-link">Sign in</a>
              <a href="/register" className="lmr-nav-btn">Get started free</a>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="lmr-hero">
          <div className="lmr-hero-grid" />
          <div className="lmr-hero-glow" />
          <div className="lmr-hero-body">
            <div className="lmr-badge">
              <span className="lmr-badge-dot" />
              &nbsp;Built for Ghanaian Churches
            </div>
            <h1 className="lmr-h1">
              Your church deserves<br /><em>software that works.</em>
            </h1>
            <p className="lmr-sub">
              MinistryOS replaces notebooks, WhatsApp groups, and scattered spreadsheets with
              one clean platform your entire leadership team can actually use —
              from Sunday morning to board meeting.
            </p>
            <div className="lmr-hero-btns">
              <a href="/register" className="lmr-btn-main">
                Start free — 200 SMS included &nbsp;<ArrowRight size={18} />
              </a>
              <a href="/login" className="lmr-btn-ghost">
                Sign into your account
              </a>
            </div>
          </div>
        </section>

        {/* ── DASHBOARD HERO SCREENSHOT ── */}
        <div className="lmr-dash-show">
          <div className="lmr-dash-frame">
            <div className="lmr-dash-chrome">
              <div className="lmr-dash-dot" style={{ background: '#FC5858' }} />
              <div className="lmr-dash-dot" style={{ background: '#FCBA58' }} />
              <div className="lmr-dash-dot" style={{ background: '#58FC85' }} />
              <div className="lmr-dash-url"><span>ministryosapp.com/dashboard</span></div>
            </div>
            <div style={{ position: 'relative' }}>
              <img src={IMG.dashboard} alt="MinistryOS Dashboard" style={{ width: '100%', display: 'block' }} />
              <Pill top="9%"  left="18%"  label="👋 Personalised greeting"      color="#4F46E5" delay={0.1} />
              <Pill top="27%" left="1%"   label="Total Members"                  color="#059669" delay={0.2} />
              <Pill top="27%" left="31%"  label="Active Members"                 color="#059669" delay={0.3} />
              <Pill top="27%" right="1%"  label="New This Month"                 color="#0891B2" delay={0.35} />
              <Pill top="52%" left="1%"   label="🏥 Church Health Score"         color="#7C3AED" delay={0.4} />
              <Pill top="52%" right="1%"  label="GHS 113,017 net balance"        color="#D97706" delay={0.5} />
            </div>
          </div>
          <p className="lmr-dash-cap">The Dashboard — your church's pulse, every time you open the app</p>
        </div>

        {/* ── STATS STRIP ── */}
        <div className="lmr-stats">
          <div className="lmr-stats-g">
            {[
              { val: '3 plans',   lbl: 'Starting at GHS 200 / month',      color: '#4F46E5' },
              { val: 'MoMo',      lbl: 'Mobile Money giving built in',      color: '#059669' },
              { val: '200 SMS',   lbl: 'Free credits when you register',    color: '#D97706' },
              { val: '100%',      lbl: 'Cloud-based — no app to install',   color: '#7C3AED' },
            ].map(({ val, lbl, color }, i) => (
              <div key={i} className="lmr-stat">
                <div className="lmr-stat-val" style={{ color }}>{val}</div>
                <div className="lmr-stat-lbl">{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════
            FEATURE 01 — MEMBERS LIST
        ══════════════════════════════════════ */}
        <FeatureRow
          eyebrow="01 · Member Management"
          title="Every member, fully known."
          body="No more notebooks or scattered contact lists. MinistryOS gives every church member a complete digital profile — searchable by your whole team from any device."
          bullets={[
            { bold: 'Searchable directory:', rest: 'Find any member instantly by name or phone number.' },
            { bold: 'Unique Member IDs:', rest: 'Every person gets an auto-generated ID (MIN-0040) for easy reference.' },
            { bold: 'Department & cell group:', rest: 'See which team and group each person belongs to at a glance.' },
            { bold: 'Active / Inactive status:', rest: 'Know who is engaged and who needs a follow-up call.' },
          ]}
          img={IMG.membersList}
          alt="Members Directory"
          pills={[
            { top: '14%', left: '1%',   label: '🔍 Search by name or phone', color: '#4F46E5', delay: 0 },
            { top: '38%', left: '54%',  label: 'Department badges',           color: '#059669', delay: 0.1 },
            { top: '38%', right: '2%',  label: 'Active / Inactive',           color: '#D97706', delay: 0.2 },
          ]}
          accent="#4F46E5"
          bg="#fff"
        />

        <div className="lmr-div" />

        {/* ══════════════════════════════════════
            FEATURE 02 — MEMBER PROFILE (tabbed)
        ══════════════════════════════════════ */}
        <section style={{ background: '#F8F7FF', padding: '88px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="fr-grid fr-rev">
              {/* Text */}
              <div className="fr-text-rev">
                <p className="lmr-eyebrow" style={{ color: '#4F46E5', margin: '0 0 12px' }}>02 · Member Profiles</p>
                <h2 className="lmr-h2">Three views of every person.</h2>
                <p className="lmr-body" style={{ marginBottom: 24 }}>
                  Click any member and get their complete story — personal details, attendance history,
                  and giving record — all in one profile with three clean tabs.
                </p>
                <div className="lmr-tab-bar">
                  {[
                    { id: 'overview',   label: 'Overview'   },
                    { id: 'attendance', label: 'Attendance' },
                    { id: 'giving',     label: 'Giving'     },
                  ].map(t => (
                    <button key={t.id} className={`lmr-tab${memberTab === t.id ? ' on' : ''}`}
                      onClick={() => setMemberTab(t.id)}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {mt.bullets.map((b, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <Check size={11} color="#4F46E5" strokeWidth={3} />
                      </div>
                      <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.65 }}>
                        <strong>{b.bold}</strong>{' '}{b.rest}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Screenshot */}
              <div className="fr-screen-rev">
                <BrowserFrame src={mt.src} alt="Member Profile" pills={mt.pills} />
              </div>
            </div>
          </div>
        </section>

        <div className="lmr-div" />

        {/* ══════════════════════════════════════
            FEATURE 03 — ATTENDANCE
        ══════════════════════════════════════ */}
        <FeatureRow
          eyebrow="03 · Attendance Tracking"
          title="Mark attendance in under a minute."
          body="Create a service, search for each member by name or member ID, and tap to mark them present. MinistryOS handles the counting, history, and reporting automatically."
          bullets={[
            { bold: 'Create any service type:', rest: 'Sunday, Prayer Night, Special Service — name it whatever you want.' },
            { bold: 'Quick check-in search:', rest: 'Type a name, phone number, or member ID to find anyone instantly.' },
            { bold: '"Mark All Present" button:', rest: 'One tap marks everyone present — then adjust for absences.' },
            { bold: 'Live count updates:', rest: 'See present and absent numbers updating in real time as you tap.' },
          ]}
          img={IMG.attendSearch}
          alt="Quick Check-in"
          pills={[
            { top: '24%', left: '28%', label: '🔍 Type name, phone, or ID',     color: '#4F46E5', delay: 0 },
            { top: '40%', left: '28%', label: 'Member found instantly',          color: '#059669', delay: 0.1 },
            { top: '54%', left: '28%', label: '✅ Mark Present — one tap',       color: '#059669', delay: 0.2 },
          ]}
          accent="#059669"
          bg="#fff"
        />

        <div className="lmr-div" />

        {/* Attendance create service screenshot */}
        <section style={{ background: '#F8F7FF', padding: '64px 24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <p className="lmr-eyebrow" style={{ color: '#059669', marginBottom: 12 }}>Creating a service takes 30 seconds</p>
            <h3 style={{ fontSize: 'clamp(20px,2.5vw,28px)', fontWeight: 800, color: '#111827', marginBottom: 12, letterSpacing: '-.5px' }}>
              Pick the type, set the date, and go.
            </h3>
            <p className="lmr-body" style={{ marginBottom: 32 }}>
              Service Type, Custom Name, Date, Time — that's all you need. Hit "Create Service" and you're ready to start marking attendance.
            </p>
            <BrowserFrame
              src={IMG.attendCreate}
              alt="Create New Service"
              pills={[
                { top: '30%', left: '32%', label: 'Service Type — Sunday / Prayer / Special', color: '#4F46E5', delay: 0 },
                { top: '52%', left: '32%', label: 'Date & Time', color: '#059669', delay: 0.1 },
              ]}
            />
          </div>
        </section>

        <div className="lmr-div" />

        {/* ══════════════════════════════════════
            FEATURE 04 — DEPARTMENTS
        ══════════════════════════════════════ */}
        <FeatureRow
          eyebrow="04 · Departments & Cell Groups"
          title="Structure your church, cleanly."
          body="Create departments like Media, Protocol, or Worship. Assign a leader, add members, and expand to see everyone inside. Cell groups live separately — not buried under departments."
          bullets={[
            { bold: 'Colour-coded departments:', rest: 'Each department has its own colour for quick visual identification.' },
            { bold: 'Department leader:', rest: 'Assign a leader with a crown badge — instantly visible to the whole team.' },
            { bold: 'Members list per department:', rest: 'Expand any department to see all members with phone numbers.' },
            { bold: 'General Cell Groups:', rest: 'A separate section for cell groups — not nested inside departments.' },
          ]}
          img={IMG.departments}
          alt="Departments and Cell Groups"
          pills={[
            { top: '16%', left: '30%', label: 'Colour bar per department',  color: '#4F46E5', delay: 0 },
            { top: '27%', left: '30%', label: '👑 Department Leader',       color: '#D97706', delay: 0.1 },
            { top: '40%', left: '30%', label: 'Members list',               color: '#059669', delay: 0.2 },
            { top: '73%', left: '30%', label: 'General Cell Groups',        color: '#7C3AED', delay: 0.3 },
          ]}
          accent="#7C3AED"
          bg="#fff"
          reverse
        />

        <div className="lmr-div" />

        {/* ══════════════════════════════════════
            FEATURE 05 — COMMUNICATIONS
        ══════════════════════════════════════ */}
        <FeatureRow
          eyebrow="05 · Communications"
          title="Reach your whole church with one SMS."
          body="Type your message, pick your audience, and send. MinistryOS shows you exactly how many people will receive it before you hit send — no guessing, no wasted credits."
          bullets={[
            { bold: 'Target by status:', rest: 'Send to all active members, inactive members, or everyone.' },
            { bold: 'Target by department:', rest: 'Message only the Media team, or Protocol — whoever you choose.' },
            { bold: 'Personalise automatically:', rest: 'Use {{firstName}} and MinistryOS fills in each person\'s name.' },
            { bold: 'Recipient preview:', rest: '"4 recipients will receive this message" — you always know before sending.' },
          ]}
          img={IMG.comms}
          alt="Communications"
          pills={[
            { top: '22%', left: '1%', label: 'Choose audience — status or dept', color: '#EC4899', delay: 0 },
            { top: '40%', left: '1%', label: '4 recipients — live count',         color: '#4F46E5', delay: 0.1 },
            { top: '60%', left: '1%', label: '{{firstName}} personalisation',     color: '#059669', delay: 0.2 },
          ]}
          accent="#EC4899"
          bg="#F8F7FF"
        />

        <div className="lmr-div" />

        {/* ══════════════════════════════════════
            FEATURE 06 — REPORTS (two screens)
        ══════════════════════════════════════ */}
        <section style={{ background: '#fff', padding: '88px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="fr-grid">
              <div>
                <p className="lmr-eyebrow" style={{ color: '#0891B2', margin: '0 0 12px' }}>06 · Reports & Analytics</p>
                <h2 className="lmr-h2">See your church's health clearly.</h2>
                <p className="lmr-body" style={{ marginBottom: 28 }}>
                  Four report tabs — Overview, Members, Attendance, and Finance — give your leadership
                  team the numbers they need to make better decisions and walk into board meetings prepared.
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { bold: 'Finance report:', rest: 'Total income GHS 120,317 vs expenses GHS 7,300 — with income breakdown by category.' },
                    { bold: 'Attendance report:', rest: 'Average rate per service, and a leaderboard of your most consistent attenders.' },
                    { bold: 'Consistent attenders:', rest: 'Ranked by services attended — great for recognising and appreciating faithful members.' },
                    { bold: 'Export to PDF:', rest: 'One click exports the full report — ready for printing or sharing at a board meeting.' },
                  ].map((b, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <Check size={11} color="#0891B2" strokeWidth={3} />
                      </div>
                      <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.65 }}>
                        <strong>{b.bold}</strong>{' '}{b.rest}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <BrowserFrame
                  src={IMG.reportsFinance}
                  alt="Finance Report"
                  pills={[
                    { top: '8%', left: '1%',  label: 'GHS 120,317 total income', color: '#059669', delay: 0 },
                    { top: '8%', right: '2%', label: 'GHS 113,017 net surplus',  color: '#4F46E5', delay: 0.1 },
                  ]}
                />
                <BrowserFrame
                  src={IMG.reportsAttend}
                  alt="Attendance Report"
                  pills={[
                    { top: '8%',  right: '2%', label: '100% avg attendance',      color: '#059669', delay: 0 },
                    { top: '52%', left: '1%',  label: 'Most consistent attenders', color: '#4F46E5', delay: 0.1 },
                    { top: '8%',  left: '1%',  label: '📄 Export PDF',             color: '#374151', delay: 0.2 },
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="lmr-div" />

        {/* ══════════════════════════════════════
            FEATURE 07 — SETTINGS 2x2
        ══════════════════════════════════════ */}
        <section style={{ background: '#F8F7FF', padding: '88px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <p className="lmr-eyebrow" style={{ color: '#374151', marginBottom: 12 }}>07 · Settings & Administration</p>
            <h2 className="lmr-h2">Built for how churches are actually run.</h2>
            <p className="lmr-body" style={{ maxWidth: 620 }}>
              Give each staff member their own login with the right access level. Manage multiple branches.
              Customise the look. MinistryOS adapts to your church's structure — not the other way around.
            </p>
            <div className="lmr-set-g">
              {[
                {
                  label:   '👥 Team Members — control who has access',
                  src:     IMG.settingsTeam,
                  alt:     'Team Members',
                  pills:   [
                    { top: '28%', right: '2%', label: 'Super Admin role', color: '#4F46E5', delay: 0 },
                    { top: '40%', right: '2%', label: 'Admin role',       color: '#059669', delay: 0.1 },
                  ],
                  caption: 'Add staff with roles: Pastor, Admin / Secretary, Treasurer, or Cell Leader. Each role sees only what they need to.',
                },
                {
                  label:   '🏛️ Branches — manage multiple locations',
                  src:     IMG.settingsBranch,
                  alt:     'Church Branches',
                  pills:   [
                    { top: '44%', left: '2%',  label: 'Main Branch · Kasoa', color: '#4F46E5', delay: 0 },
                    { top: '44%', right: '2%', label: 'Kumasi Branch',       color: '#059669', delay: 0.1 },
                  ],
                  caption: 'Running multiple branches? Each has its own data. Switch between them instantly from the top bar.',
                },
                {
                  label:   '🎨 Appearance — Light, Dark, and your brand colour',
                  src:     IMG.settingsTheme,
                  alt:     'Theme Settings',
                  pills:   [
                    { top: '28%', right: '4%', label: 'Dark mode selected', color: '#312E81', delay: 0 },
                    { top: '56%', left: '29%', label: 'Pick your accent colour', color: '#7C3AED', delay: 0.1 },
                  ],
                  caption: 'Choose Light or Dark mode and pick your church\'s brand colour — applied across every button and highlight.',
                },
                {
                  label:   '➕ Adding a team member takes 30 seconds',
                  src:     IMG.settingsAdd,
                  alt:     'Add Team Member',
                  pills:   [
                    { top: '44%', left: '37%', label: 'Choose role from dropdown', color: '#4F46E5', delay: 0 },
                  ],
                  caption: 'Name, email, role, temporary password — done. They log in and start working immediately.',
                },
              ].map(({ label, src, alt, pills, caption }) => (
                <div key={label}>
                  <p className="lmr-set-label">{label}</p>
                  <BrowserFrame src={src} alt={alt} pills={pills} />
                  <p className="lmr-set-caption">{caption}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BRANCH SWITCHER DARK CALLOUT ── */}
        <section style={{ background: '#1E1B4B', padding: '72px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="fr-grid">
              <div style={{ color: '#fff' }}>
                <p className="lmr-eyebrow" style={{ color: '#A5B4FC', marginBottom: 12 }}>Multi-branch</p>
                <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-.8px', margin: '0 0 16px', color: '#fff' }}>
                  One church, multiple branches — one login.
                </h2>
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,.62)', lineHeight: 1.75, marginBottom: 24 }}>
                  Switch between your branches from the top bar with one click. Data stays separate per branch,
                  or view across all branches at once.
                </p>
                {[
                  'Each branch has its own members, attendance & finance data',
                  'Switch branches instantly — no logging out',
                  'Staff can be cross-branch or branch-specific',
                  'Add new branches for GHS 150 / month each',
                ].map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(165,180,252,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={10} color="#A5B4FC" strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,.7)' }}>{t}</span>
                  </div>
                ))}
              </div>
              <BrowserFrame
                src={IMG.dashBranch}
                alt="Branch Switcher"
                pills={[
                  { top: '8%',  left: '18%', label: 'Switch Branch dropdown', color: '#A5B4FC', delay: 0 },
                  { top: '28%', left: '34%', label: 'Main Branch · Kasoa',    color: '#4F46E5', delay: 0.1 },
                  { top: '44%', left: '34%', label: 'Kumasi Branch',          color: '#059669', delay: 0.2 },
                ]}
              />
            </div>
          </div>
        </section>

        {/* ── GLOBAL SEARCH ── */}
        <section style={{ background: '#F8F7FF', padding: '80px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="fr-grid">
            <div>
              <p className="lmr-eyebrow" style={{ color: '#374151', marginBottom: 12 }}>08 · Global Search</p>
              <h2 className="lmr-h2">Find anything, instantly.</h2>
              <p className="lmr-body" style={{ marginBottom: 24 }}>
                Press the search icon from anywhere in MinistryOS. Type a member name, a module, or a keyword — and jump there in one click. No more clicking through menus to find the page you need.
              </p>
              {[
                'Search members by name or ID',
                'Jump to any page in the platform',
                'Available from every screen',
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <Check size={11} color="#4F46E5" strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.65 }}>{t}</span>
                </div>
              ))}
            </div>
            <BrowserFrame
              src={IMG.globalSearch}
              alt="Global Search"
              pills={[
                { top: '14%', left: '32%', label: 'Type anything — pages, members', color: '#4F46E5', delay: 0 },
                { top: '36%', left: '32%', label: 'Jump to Settings instantly',     color: '#7C3AED', delay: 0.1 },
              ]}
            />
          </div>
        </section>

        {/* ══════════════════════════════════════
            PRICING
        ══════════════════════════════════════ */}
        <section style={{ background: '#fff', padding: '100px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p className="lmr-eyebrow" style={{ color: '#4F46E5', marginBottom: 12 }}>Transparent pricing</p>
              <h2 className="lmr-h2" style={{ textAlign: 'center' }}>Plans that grow with your church.</h2>
              <p className="lmr-body" style={{ maxWidth: 480, margin: '0 auto' }}>
                All plans include the full platform. You pay more only as your church grows.
              </p>
            </div>

            {/* Real billing screenshot */}
            <div style={{ maxWidth: 900, margin: '0 auto 48px', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,.1)', border: '1px solid #E5E7EB' }}>
              <img src={IMG.billingPlans} alt="MinistryOS Pricing Plans" style={{ width: '100%', display: 'block' }} />
            </div>

            <div className="lmr-plans-g">
              {[
                {
                  name: 'Starter', price: 'GHS 200', color: '#4F46E5',
                  feats: ['Up to 200 members','5 staff accounts','1 branch','200 SMS credits / month'],
                },
                {
                  name: 'Growth', price: 'GHS 350', color: '#059669',
                  badge: 'Most Popular', badgeBg: '#059669',
                  feats: ['Up to 500 members','15 staff accounts','2 branches','500 SMS credits / month'],
                },
                {
                  name: 'Enterprise', price: 'GHS 500', color: '#D97706',
                  badge: 'Best Value', badgeBg: '#D97706',
                  feats: ['Unlimited members','Unlimited staff accounts','5 branches','2,000 SMS credits / month'],
                },
              ].map(({ name, price, color, badge, badgeBg, feats }) => (
                <div key={name} className="lmr-plan" style={{ borderColor: badge ? color : '#E5E7EB' }}>
                  {badge && <div className="lmr-plan-badge" style={{ background: badgeBg }}>{badge}</div>}
                  <div className="lmr-plan-name">{name}</div>
                  <div className="lmr-plan-price" style={{ color }}>{price}</div>
                  <div className="lmr-plan-per">per month</div>
                  <ul className="lmr-plan-feats">
                    {feats.map(f => (
                      <li key={f} className="lmr-plan-feat">
                        <Check size={14} color={color} strokeWidth={3} style={{ flexShrink: 0 }} />{f}
                      </li>
                    ))}
                  </ul>
                  <a href="/register" className="lmr-plan-btn" style={{ background: color }}>
                    Get started →
                  </a>
                </div>
              ))}
            </div>

            {/* SMS credits callout */}
            <div style={{ maxWidth: 900, margin: '48px auto 0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,.07)', border: '1px solid #EDE9FE' }}>
              <div style={{ background: '#F8F7FF', padding: '14px 20px', borderBottom: '1px solid #EDE9FE' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#4F46E5' }}>📱 Need more SMS? Buy top-up bundles anytime — 500 for GHS 40, 1,000 for GHS 75, 5,000 for GHS 320.</p>
              </div>
              <img src={IMG.billingSms} alt="SMS Credits" style={{ width: '100%', display: 'block' }} />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            WHY MINISTRYOS
        ══════════════════════════════════════ */}
        <section style={{ background: '#F8F7FF', padding: '100px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p className="lmr-eyebrow" style={{ color: '#4F46E5', marginBottom: 12 }}>Why MinistryOS</p>
              <h2 className="lmr-h2" style={{ textAlign: 'center' }}>
                Made for how Ghanaian churches actually work.
              </h2>
            </div>
            <div className="lmr-why-g">
              {[
                { icon: '📱', bg: '#EEF2FF', title: 'Works on any device',        body: 'Phone, tablet, or laptop — it runs in your browser. No app to download, no installation. Open it at home, at church, anywhere.' },
                { icon: '🇬🇭', bg: '#ECFDF5', title: 'Built for Ghana',            body: 'Mobile Money giving, Ghana cedis, local phone number formats. Not an imported product retrofitted — built here, for here.' },
                { icon: '🔐', bg: '#F5F3FF', title: 'Your data is safe',           body: 'All data is encrypted and backed up automatically. Only your team can access it. MinistryOS never shares or sells your church\'s information.' },
                { icon: '⚡', bg: '#FFFBEB', title: 'Live in one afternoon',        body: 'Import your member list and go live the same day. Your secretary can set it up — no IT person, no training course required.' },
                { icon: '🤖', bg: '#E0F2FE', title: 'Automations that save hours', body: 'Birthday wishes, welcome messages, absence follow-ups — set them once and they run themselves. Your members feel cared for even when you\'re busy.' },
                { icon: '📊', bg: '#FDF2F8', title: 'Reports your board will love', body: 'Export a full attendance and finance report to PDF with one click. Come to every board meeting with real numbers — not estimates from memory.' },
              ].map(({ icon, bg, title, body }) => (
                <div key={title} className="lmr-why-card">
                  <div className="lmr-why-icon" style={{ background: bg, width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    {icon}
                  </div>
                  <div className="lmr-why-title">{title}</div>
                  <p className="lmr-why-body">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            TESTIMONIALS
        ══════════════════════════════════════ */}
        <section className="lmr-testi-sec">
          <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
            <p className="lmr-eyebrow" style={{ color: '#A5B4FC', marginBottom: 12 }}>
              From pastors & admins using MinistryOS
            </p>
            <h2 style={{ fontSize: 'clamp(26px,3.5vw,44px)', fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1.1 }}>
              Churches that made the switch.
            </h2>
          </div>
          <div className="lmr-testi-g">
            {[
              { q: 'Before MinistryOS, our attendance records were in notebooks. Now we see last Sunday\'s numbers before we leave the building.', name: 'Ps. Emmanuel Asante',  role: 'Senior Pastor, Accra',           init: 'EA', color: '#4F46E5' },
              { q: 'The MoMo giving feature changed everything. Pledges are up because members can now track their own commitments and feel accountable.', name: 'Mrs. Abena Mensah',     role: 'Church Administrator, Kumasi',   init: 'AM', color: '#059669' },
              { q: 'We activated the birthday automation and members started calling to say thank you. It costs us nothing and it means everything to them.', name: 'Elder Kwame Boateng',  role: 'Church Leader, Takoradi',        init: 'KB', color: '#D97706' },
            ].map(({ q, name, role, init, color }) => (
              <div key={name} className="lmr-testi-card">
                <p className="lmr-testi-q">"{q}"</p>
                <div className="lmr-testi-p">
                  <div className="lmr-testi-av" style={{ background: color }}>{init}</div>
                  <div>
                    <div className="lmr-testi-name">{name}</div>
                    <div className="lmr-testi-role">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════
            FINAL CTA
        ══════════════════════════════════════ */}
        <section className="lmr-cta">
          <div className="lmr-cta-in">
            <p className="lmr-eyebrow" style={{ color: '#4F46E5', textAlign: 'center', marginBottom: 16 }}>Ready to start?</p>
            <h2 className="lmr-cta-h2">
              Your church runs on people.<br />
              Let MinistryOS handle <em>the rest.</em>
            </h2>
            <p className="lmr-cta-body">
              Register today and get 200 free SMS credits. No credit card needed to start.
              Your first branch is included. You can be live before Sunday.
            </p>
            <div className="lmr-cta-btns">
              <a href="/register" className="lmr-cta-primary">
                Register your church free &nbsp;<ArrowRight size={16} />
              </a>
              <a href="/login" className="lmr-cta-secondary">
                Already have an account
              </a>
            </div>
            <p className="lmr-cta-note">No setup fee · Cancel anytime · GHS 200 / month to start</p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="lmr-footer">
          <img src={IMG.logo} alt="MinistryOS" />
          <span>© 2026 EM Control IT Solutions · MinistryOS · All rights reserved</span>
        </footer>

      </div>
    </>
  )
}