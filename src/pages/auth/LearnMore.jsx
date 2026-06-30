import { useState, useEffect } from 'react'
import { ArrowRight, Check, ChevronDown, Play } from 'lucide-react'
import Logo from '../../components/Logo'

/* ── IMAGE PATHS ──────────────────────────────────────────────────────────────
   Images are located in /public/images/ folder
   ──────────────────────────────────────────────────────────────────────────── */
const IMG = {
  dashboard:      '/images/Dashboard.png',
  dashBranch:     '/images/Settings Branches.png',
  membersList:    '/images/Members.png',
  memberProfile:  '/images/Member profile.png',
  memberAttend:   '/images/Member Attendance.png',
  memberGiving:   '/images/Member Giving.png',
  globalSearch:   '/images/Global search.png',
  attendCreate:   '/images/Attendance service creation.png',
  attendCheckin:  '/images/Taking attendance.png',
  attendSearch:   '/images/Marked Attendance.png',
  departments:    '/images/Departments.png',
  comms:          '/images/comm.png',
  reportsFinance: '/images/reports finance.png',
  reportsAttend:  '/images/Reports Attendance.png',
  reportsOverview: '/images/Reports Overview.png',
  settingsTeam:   '/images/Setting AddTeam member.png',
  settingsAdd:    '/images/Setting AddTeam member.png',
  settingsBranch: '/images/Settings Branches.png',
  settingsTheme:  '/images/Theme mode.png',
  automation:     '/images/Automation.png',
  billingPlans:   '/images/Billing plans.png',
  billingSms:     '/images/Billing sms credits.png',
  billingBranch:  '/images/Billing branches.png',
}

/* ── QUICK NAV SECTIONS ──────────────────────────────────────────────────── */
const QUICK_NAV = [
  { id: 'dashboard',     label: 'Dashboard'     },
  { id: 'members',       label: 'Members'       },
  { id: 'profiles',      label: 'Profiles'      },
  { id: 'attendance',    label: 'Attendance'    },
  { id: 'departments',   label: 'Departments'   },
  { id: 'communications', label: 'Communications' },
  { id: 'reports',       label: 'Reports'       },
  { id: 'settings',      label: 'Settings'      },
  { id: 'pricing',       label: 'Pricing'       },
]

/* ── BROWSER FRAME ───────────────────────────────────────────────────────── */
function BrowserFrame({ src, alt }) {
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
      <img src={src} alt={alt} loading="lazy" className="lmr-bf-img"
        style={{ width: '100%', display: 'block', background: '#F9FAFB', objectFit: 'contain', maxHeight: 520 }} />
    </div>
  )
}

/* ── FEATURE ROW ─────────────────────────────────────────────────────────── */
function FeatureRow({ id, eyebrow, title, body, bullets, img, alt, reverse, accent, bg }) {
  return (
    <section id={id} style={{ background: bg, padding: '72px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className={`fr-grid${reverse ? ' fr-rev' : ''}`}>
          <div className="fr-text">
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent, margin: '0 0 12px' }}>
              {eyebrow}
            </p>
            <h2 style={{ fontSize: 'clamp(22px,3vw,36px)', fontWeight: 900, color: '#111827', letterSpacing: '-0.6px', lineHeight: 1.15, margin: '0 0 14px' }}>
              {title}
            </h2>
            <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.75, margin: '0 0 24px' }}>
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
          <div className="fr-screen">
            <BrowserFrame src={img} alt={alt} />
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
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const memberTabs = {
    overview: {
      src:   IMG.memberProfile,
      bullets: [
        { bold: 'Personal details:', rest: 'Phone, gender, date of birth, marital status — everything in one place.' },
        { bold: 'Church information:', rest: 'Auto-generated Member ID, join date, department, cell group, and baptism status.' },
        { bold: 'Quick actions:', rest: 'Call member, send message, or edit their profile directly from this screen.' },
      ],
    },
    attendance: {
      src:   IMG.memberAttend,
      bullets: [
        { bold: 'Attendance rate:', rest: 'See exactly how consistently each member shows up — as a percentage.' },
        { bold: 'Consistency bar:', rest: 'A visual progress bar across all services recorded for that member.' },
        { bold: 'Service history:', rest: 'Every service attended or missed, with the exact date and service name.' },
      ],
    },
    giving: {
      src:   IMG.memberGiving,
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
        html { scroll-behavior: smooth; }
        .lmr { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; background: #fff; overflow-x: hidden; }

        /* Offset anchored sections so they don't hide under the sticky nav bars */
        .lmr section[id], .lmr div[id] { scroll-margin-top: 104px; }

        /* ── NAV ── */
        .lmr-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 210; height: 60px; display: flex; align-items: center; padding: 0 20px; transition: background .2s, box-shadow .2s; background: rgba(255,255,255,.96); backdrop-filter: blur(16px); box-shadow: 0 1px 0 rgba(0,0,0,.07); }
        .lmr-nav-in { max-width: 1100px; margin: 0 auto; width: 100%; display: flex; align-items: center; justify-content: space-between; }
        .lmr-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; font-size: 17px; font-weight: 800; color: #111827; letter-spacing: -.4px; }
        .lmr-nav-r { display: flex; align-items: center; gap: 8px; }
        .lmr-nav-link { font-size: 14px; font-weight: 600; color: #374151; text-decoration: none; padding: 6px 10px; border-radius: 8px; transition: background .12s; }
        .lmr-nav-link:hover { background: #F3F4F6; }
        .lmr-nav-btn { font-size: 13px; font-weight: 700; color: #fff; background: #4F46E5; border: none; border-radius: 8px; padding: 8px 14px; cursor: pointer; text-decoration: none; white-space: nowrap; }
        .lmr-nav-btn:hover { background: #4338CA; }

        /* ── QUICK NAV (clickable jump-to-section bar) ── */
        .lmr-quicknav { position: fixed; top: 60px; left: 0; right: 0; z-index: 205; background: #fff; border-bottom: 1px solid #EEF0F4; box-shadow: 0 1px 0 rgba(0,0,0,.04); }
        .lmr-quicknav-in { max-width: 1100px; margin: 0 auto; display: flex; gap: 4px; overflow-x: auto; padding: 8px 20px; scrollbar-width: none; }
        .lmr-quicknav-in::-webkit-scrollbar { display: none; }
        .lmr-quicknav-btn { flex-shrink: 0; font-size: 12.5px; font-weight: 700; color: #4B5563; background: #F8F7FF; border: 1px solid #EDE9FE; border-radius: 99px; padding: 6px 14px; cursor: pointer; white-space: nowrap; transition: background .12s, color .12s, border-color .12s; }
        .lmr-quicknav-btn:hover { background: #EEF2FF; color: #4F46E5; border-color: #C7D2FE; }

        /* ── HERO ── */
        .lmr-hero { background: linear-gradient(155deg,#1E1B4B 0%,#312E81 35%,#4F46E5 70%,#6D28D9 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 152px 20px 48px; position: relative; overflow: hidden; }
        .lmr-hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px); background-size: 64px 64px; pointer-events: none; }
        .lmr-hero-glow { position: absolute; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle,rgba(139,92,246,.3) 0%,transparent 65%); top: 50%; left: 50%; transform: translate(-50%,-60%); pointer-events: none; }
        .lmr-hero-body { position: relative; z-index: 2; max-width: 840px; width: 100%; }
        .lmr-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #A5B4FC; background: rgba(99,102,241,.18); border: 1px solid rgba(165,180,252,.3); padding: 6px 14px; border-radius: 99px; margin-bottom: 20px; }
        .lmr-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #A5B4FC; animation: lmr-pulse 2s infinite; }
        @keyframes lmr-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        .lmr-h1 { font-size: clamp(28px,5vw,58px); font-weight: 900; color: #fff; line-height: 1.08; letter-spacing: clamp(-1px,-0.04em,-2.4px); margin-bottom: 16px; }
        .lmr-h1 em { font-style: normal; background: linear-gradient(90deg,#A5B4FC,#C4B5FD,#F9A8D4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .lmr-sub { font-size: clamp(14px,1.6vw,17px); color: rgba(255,255,255,.65); max-width: 540px; margin: 0 auto 28px; line-height: 1.7; }
        .lmr-hero-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 14px; }
        .lmr-btn-main { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #4F46E5; font-size: 14px; font-weight: 800; padding: 13px 22px; border-radius: 12px; border: none; cursor: pointer; text-decoration: none; box-shadow: 0 4px 24px rgba(0,0,0,.2); transition: transform .15s,box-shadow .15s; }
        .lmr-btn-main:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,.25); }
        .lmr-btn-ghost { display: inline-flex; align-items: center; gap: 8px; color: rgba(255,255,255,.8); font-size: 14px; font-weight: 600; text-decoration: none; padding: 13px 18px; border: 1px solid rgba(255,255,255,.2); border-radius: 12px; transition: background .15s; }
        .lmr-btn-ghost:hover { background: rgba(255,255,255,.08); }

        /* Scroll-down affordance so first-timers know there's more below */
        .lmr-scrolldown { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; color: rgba(255,255,255,.55); font-size: 12px; font-weight: 600; cursor: pointer; margin-top: 6px; }
        .lmr-scrolldown svg { animation: lmr-bounce 1.6s infinite; }
        @keyframes lmr-bounce { 0%,100%{ transform: translateY(0); } 50%{ transform: translateY(4px); } }

        /* ── DASHBOARD SHOWCASE ── */
        .lmr-dash-show { background: linear-gradient(180deg,#1E1B4B 0%,#312E81 100%); padding: 0 20px 56px; }
        .lmr-dash-frame { max-width: 1000px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.08); }
        .lmr-dash-chrome { height: 36px; background: #1F2937; border-bottom: 1px solid rgba(255,255,255,.06); display: flex; align-items: center; padding: 0 14px; gap: 6px; }
        .lmr-dash-dot { width: 10px; height: 10px; border-radius: 50%; }
        .lmr-dash-url { flex: 1; margin: 0 10px; background: rgba(255,255,255,.05); border-radius: 4px; height: 20px; display: flex; align-items: center; padding: 0 10px; }
        .lmr-dash-url span { font-size: 10px; color: rgba(255,255,255,.35); font-family: monospace; }
        .lmr-dash-cap { text-align: center; color: rgba(255,255,255,.4); font-size: 12px; margin-top: 16px; padding: 0 20px; }

        /* ── DEMO VIDEO (sits right under the dashboard screenshot) ── */
        .lmr-demo-wrap { max-width: 1000px; margin: 28px auto 0; }
        .lmr-demo-card { border-radius: 14px; overflow: hidden; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.04); }
        .lmr-demo-thumb { position: relative; aspect-ratio: 16/9; background: linear-gradient(135deg,#312E81,#4F46E5); display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .lmr-demo-play { width: 64px; height: 64px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 32px rgba(0,0,0,.3); transition: transform .15s; }
        .lmr-demo-thumb:hover .lmr-demo-play { transform: scale(1.08); }
        .lmr-demo-label { position: absolute; bottom: 14px; left: 16px; color: #fff; font-size: 13px; font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,.4); }
        .lmr-demo-video { width: 100%; aspect-ratio: 16/9; display: block; background: #000; }

        /* ── STATS ── */
        .lmr-stats { background: #F8F7FF; border-top: 1px solid #EDE9FE; border-bottom: 1px solid #EDE9FE; padding: 48px 20px; }
        .lmr-stats-g { max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: repeat(4,1fr); }
        .lmr-stat { text-align: center; padding: 0 16px; border-right: 1px solid #DDD6FE; }
        .lmr-stat:last-child { border-right: none; }
        .lmr-stat-val { font-size: clamp(22px,3.5vw,40px); font-weight: 900; line-height: 1; letter-spacing: -1px; }
        .lmr-stat-lbl { font-size: 12px; color: #6B7280; margin-top: 6px; font-weight: 500; }

        /* ── FEATURE GRID ── */
        .fr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
        .fr-rev .fr-text  { order: 2; }
        .fr-rev .fr-screen { order: 1; }

        /* ── MEMBER TABS ── */
        .lmr-tab-bar { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px; }
        .lmr-tab { font-size: 12px; font-weight: 700; padding: 7px 14px; border-radius: 99px; border: 1.5px solid #E5E7EB; background: #fff; color: #6B7280; cursor: pointer; transition: all .15s; }
        .lmr-tab.on { background: #4F46E5; border-color: #4F46E5; color: #fff; }

        /* ── SETTINGS GRID ── */
        .lmr-set-g { display: grid; grid-template-columns: repeat(2,1fr); gap: 24px; margin-top: 40px; }
        .lmr-set-label { font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 10px; }
        .lmr-set-caption { font-size: 13px; color: #6B7280; margin-top: 10px; line-height: 1.6; }

        /* ── PRICING ── */
        .lmr-plans-g { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; max-width: 1000px; margin: 0 auto; }
        .lmr-plan { background: #fff; border: 1.5px solid #E5E7EB; border-radius: 16px; padding: 28px; position: relative; transition: box-shadow .15s; }
        .lmr-plan:hover { box-shadow: 0 8px 32px rgba(0,0,0,.07); }
        .lmr-plan-badge { position: absolute; top: -13px; left: 50%; transform: translateX(-50%); font-size: 11px; font-weight: 800; padding: 4px 14px; border-radius: 99px; color: #fff; white-space: nowrap; }
        .lmr-plan-name { font-size: 17px; font-weight: 800; color: #111827; margin-bottom: 6px; }
        .lmr-plan-price { font-size: 30px; font-weight: 900; line-height: 1; margin-bottom: 4px; }
        .lmr-plan-per { font-size: 12px; color: #9CA3AF; margin-bottom: 18px; }
        .lmr-plan-feats { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
        .lmr-plan-feat { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #374151; }
        .lmr-plan-btn { display: block; text-align: center; color: #fff; font-weight: 800; font-size: 14px; padding: 12px 0; border-radius: 10px; text-decoration: none; transition: opacity .15s; }
        .lmr-plan-btn:hover { opacity: .88; }

        /* ── WHY ── */
        .lmr-why-g { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; max-width: 1100px; margin: 0 auto; }
        .lmr-why-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 24px; transition: box-shadow .15s,transform .15s; }
        .lmr-why-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,.07); transform: translateY(-2px); }
        .lmr-why-title { font-size: 15px; font-weight: 800; color: #111827; margin-bottom: 8px; }
        .lmr-why-body { font-size: 13.5px; color: #6B7280; line-height: 1.7; }

        /* ── TESTIMONIALS ── */
        .lmr-testi-sec { background: linear-gradient(155deg,#1E1B4B 0%,#3730A3 50%,#4F46E5 100%); padding: 80px 20px; }
        .lmr-testi-g { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; max-width: 1100px; margin: 40px auto 0; }
        .lmr-testi-card { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1); border-radius: 16px; padding: 24px; }
        .lmr-testi-q { font-size: 14px; line-height: 1.75; color: rgba(255,255,255,.78); font-style: italic; margin-bottom: 18px; }
        .lmr-testi-p { display: flex; align-items: center; gap: 12px; }
        .lmr-testi-av { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: #fff; flex-shrink: 0; }
        .lmr-testi-name { font-size: 13px; font-weight: 700; color: #fff; }
        .lmr-testi-role { font-size: 11px; color: rgba(255,255,255,.45); margin-top: 2px; }

        /* ── CTA ── */
        .lmr-cta { padding: 80px 20px; background: #fff; text-align: center; }
        .lmr-cta-in { max-width: 620px; margin: 0 auto; }
        .lmr-cta-h2 { font-size: clamp(26px,4vw,50px); font-weight: 900; color: #111827; letter-spacing: -1.2px; line-height: 1.1; margin-bottom: 16px; }
        .lmr-cta-h2 em { font-style: normal; color: #4F46E5; }
        .lmr-cta-body { font-size: 16px; color: #6B7280; line-height: 1.7; margin-bottom: 36px; }
        .lmr-cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .lmr-cta-primary { display: inline-flex; align-items: center; gap: 8px; background: #4F46E5; color: #fff; font-size: 14px; font-weight: 800; padding: 14px 26px; border-radius: 12px; text-decoration: none; transition: background .15s,transform .15s; }
        .lmr-cta-primary:hover { background: #4338CA; transform: translateY(-1px); }
        .lmr-cta-secondary { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #374151; font-size: 14px; font-weight: 700; padding: 14px 24px; border-radius: 12px; text-decoration: none; border: 1.5px solid #E5E7EB; transition: border-color .15s; }
        .lmr-cta-secondary:hover { border-color: #C7D2FE; color: #4F46E5; }
        .lmr-cta-note { font-size: 13px; color: #9CA3AF; margin-top: 18px; }

        /* ── FOOTER ── */
        .lmr-footer { padding: 24px 20px; text-align: center; border-top: 1px solid #F3F4F6; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; }
        .lmr-footer span { font-size: 12px; color: #9CA3AF; }

        /* ── DIVIDER ── */
        .lmr-div { height: 1px; background: #F3F4F6; max-width: 1100px; margin: 0 auto; }

        /* ── HELPERS ── */
        .lmr-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
        .lmr-h2 { font-size: clamp(24px,3vw,42px); font-weight: 900; color: #111827; letter-spacing: -0.8px; line-height: 1.1; margin-bottom: 14px; }
        .lmr-body { font-size: 15px; color: #6B7280; line-height: 1.75; }

        /* ══════════════════════════════════════
           RESPONSIVE — TABLET (≤900px)
        ══════════════════════════════════════ */
        @media (max-width: 900px) {

          /* Feature rows: always stack text first, then image */
          .fr-grid { grid-template-columns: 1fr; gap: 28px; }
          .fr-rev .fr-text  { order: 1; }
          .fr-rev .fr-screen { order: 2; }
          .fr-text  { order: 1; }
          .fr-screen { order: 2; }

          /* Stats: 2×2 grid */
          .lmr-stats-g { grid-template-columns: repeat(2,1fr); gap: 0; }
          .lmr-stat { border-right: none; border-bottom: 1px solid #DDD6FE; padding: 20px 16px; }
          .lmr-stat:nth-child(1),
          .lmr-stat:nth-child(2) { border-right: 1px solid #DDD6FE; }
          .lmr-stat:nth-child(2) { border-right: none; }
          .lmr-stat:nth-child(3) { border-right: 1px solid #DDD6FE; }
          .lmr-stat:last-child { border-bottom: none; border-right: none; }

          /* Why: 1 col */
          .lmr-why-g { grid-template-columns: 1fr; }

          /* Pricing: 1 col */
          .lmr-plans-g { grid-template-columns: 1fr; max-width: 440px; }

          /* Testimonials: 1 col */
          .lmr-testi-g { grid-template-columns: 1fr; }

          /* Settings: 1 col */
          .lmr-set-g { grid-template-columns: 1fr; }

          /* Nav link */
          .lmr-nav-link { display: none; }

          .lmr-hero { padding-top: 132px; }
          .lmr-quicknav { top: 56px; }
          .lmr section[id], .lmr div[id] { scroll-margin-top: 96px; }
        }

        /* ══════════════════════════════════════
           RESPONSIVE — MOBILE (≤600px)
        ══════════════════════════════════════ */
        @media (max-width: 600px) {
          .lmr-nav { height: 52px; }
          .lmr-quicknav { top: 52px; }
          .lmr-quicknav-in { padding: 7px 14px; }
          .lmr-quicknav-btn { font-size: 11.5px; padding: 5px 12px; }

          .lmr-hero { padding: 108px 16px 36px; }
          .lmr-hero-btns { flex-direction: column; align-items: stretch; }
          .lmr-btn-main, .lmr-btn-ghost { justify-content: center; }

          .lmr-dash-show { padding: 0 12px 40px; }

          /* On small screens cap the browser frame image height so it doesn't dwarf the screen */
          .lmr-dash-frame img { max-height: 280px; }
          .lmr-demo-wrap { margin-top: 20px; }

          /* Feature section paddings */
          section { padding-top: 48px !important; padding-bottom: 48px !important; padding-left: 16px !important; padding-right: 16px !important; }

          /* Browser frame images: cap height on mobile so they don't scroll forever */
          .lmr-bf-img { max-height: 340px !important; }

          /* Stats strip */
          .lmr-stats { padding: 32px 16px; }
          .lmr-stats-g { grid-template-columns: 1fr 1fr; }

          /* Pricing plans full width */
          .lmr-plans-g { max-width: 100%; }
          .lmr-plan { padding: 22px 18px; }

          /* Why cards */
          .lmr-why-g { gap: 14px; }

          /* Testimonials */
          .lmr-testi-sec { padding: 56px 16px; }

          /* CTA */
          .lmr-cta { padding: 60px 16px; }
          .lmr-cta-btns { flex-direction: column; align-items: stretch; }
          .lmr-cta-primary, .lmr-cta-secondary { justify-content: center; }

          /* Settings */
          .lmr-set-g { grid-template-columns: 1fr; gap: 32px; margin-top: 28px; }

          .lmr section[id], .lmr div[id] { scroll-margin-top: 88px; }
        }
      `}</style>

      <div className="lmr">

        {/* ── NAV ── */}
        <nav className="lmr-nav">
          <div className="lmr-nav-in">
            <a href="/" className="lmr-logo">
              <Logo size={30} showText={false} />
              MinistryOS
            </a>
            <div className="lmr-nav-r">
              <a href="/login"    className="lmr-nav-link">Sign in</a>
              <a href="/register" className="lmr-nav-btn">Get started free</a>
            </div>
          </div>
        </nav>

        {/* ── QUICK NAV: clickable jump-to-section list ── */}
        <div className="lmr-quicknav">
          <div className="lmr-quicknav-in">
            {QUICK_NAV.map(({ id, label }) => (
              <button key={id} className="lmr-quicknav-btn" onClick={() => scrollTo(id)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── HERO ── */}
        <section className="lmr-hero">
          <div className="lmr-hero-grid" />
          <div className="lmr-hero-glow" />
          <div className="lmr-hero-body">
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
                Start free — 200 SMS included <ArrowRight size={16} />
              </a>
              <a href="/login" className="lmr-btn-ghost">
                Sign into your account
              </a>
            </div>
            <button className="lmr-scrolldown" onClick={() => scrollTo('dashboard')}>
              See it in action <ChevronDown size={14} />
            </button>
          </div>
        </section>

        {/* ── DASHBOARD SCREENSHOT ── */}
        <div className="lmr-dash-show" id="dashboard">
          <div className="lmr-dash-frame">
            <div className="lmr-dash-chrome">
              <div className="lmr-dash-dot" style={{ background: '#FC5858' }} />
              <div className="lmr-dash-dot" style={{ background: '#FCBA58' }} />
              <div className="lmr-dash-dot" style={{ background: '#58FC85' }} />
              <div className="lmr-dash-url"><span>ministryosapp.com/dashboard</span></div>
            </div>
            <img src={IMG.dashboard} alt="MinistryOS Dashboard" style={{ width: '100%', display: 'block', background: '#F9FAFB', objectFit: 'contain', maxHeight: 520 }} />
          </div>
          <p className="lmr-dash-cap">The Dashboard — your church's pulse, every time you open the app</p>

          {/* Demo video — sits right under the dashboard screenshot, as requested */}
          <div className="lmr-demo-wrap">
            <div className="lmr-demo-card">
              {showVideo ? (
                <video className="lmr-demo-video" src="/videos/ministryos-demo.mp4" controls autoPlay />
              ) : (
                <div className="lmr-demo-thumb" onClick={() => setShowVideo(true)}>
                  <div className="lmr-demo-play">
                    <Play size={24} color="#4F46E5" fill="#4F46E5" style={{ marginLeft: 2 }} />
                  </div>
                  <span className="lmr-demo-label">▶ Watch the 2-minute demo</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── STATS STRIP ── */}
        <div className="lmr-stats">
          <div className="lmr-stats-g">
            {[
              { val: '3 plans',   lbl: 'Starting at GHS 200 / month',    color: '#4F46E5' },
              { val: 'MoMo',      lbl: 'Mobile Money giving built in',    color: '#059669' },
              { val: '200 SMS',   lbl: 'Free credits when you register',  color: '#D97706' },
              { val: '100%',      lbl: 'Cloud-based — no app to install', color: '#7C3AED' },
            ].map(({ val, lbl, color }, i) => (
              <div key={i} className="lmr-stat">
                <div className="lmr-stat-val" style={{ color }}>{val}</div>
                <div className="lmr-stat-lbl">{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FEATURE 01 — MEMBERS LIST ── */}
        <FeatureRow
          id="members"
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
          accent="#4F46E5"
          bg="#fff"
        />

        <div className="lmr-div" />

        {/* ── FEATURE 02 — MEMBER PROFILE (tabbed) ── */}
        <section id="profiles" style={{ background: '#F8F7FF', padding: '72px 20px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="fr-grid fr-rev">
              <div className="fr-text">
                <p className="lmr-eyebrow" style={{ color: '#4F46E5', margin: '0 0 12px' }}>02 · Member Profiles</p>
                <h2 className="lmr-h2">Three views of every person.</h2>
                <p className="lmr-body" style={{ marginBottom: 20 }}>
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
              <div className="fr-screen">
                <BrowserFrame src={mt.src} alt="Member Profile" />
              </div>
            </div>
          </div>
        </section>

        <div className="lmr-div" />

        {/* ── FEATURE 03 — ATTENDANCE ── */}
        <FeatureRow
          id="attendance"
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
          accent="#059669"
          bg="#fff"
        />

        <div className="lmr-div" />

        {/* ── ATTENDANCE: Create service ── */}
        <section style={{ background: '#F8F7FF', padding: '64px 20px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
            <p className="lmr-eyebrow" style={{ color: '#059669', marginBottom: 12 }}>Creating a service takes 30 seconds</p>
            <h3 style={{ fontSize: 'clamp(18px,2.5vw,26px)', fontWeight: 800, color: '#111827', marginBottom: 12, letterSpacing: '-.4px' }}>
              Pick the type, set the date, and go.
            </h3>
            <p className="lmr-body" style={{ marginBottom: 28, maxWidth: 500, margin: '0 auto 28px' }}>
              Service Type, Custom Name, Date, Time — that's all you need. Hit "Create Service" and you're ready to start marking attendance.
            </p>
            <BrowserFrame src={IMG.attendCreate} alt="Create New Service" />
          </div>
        </section>

        <div className="lmr-div" />

        {/* ── FEATURE 04 — DEPARTMENTS ── */}
        <FeatureRow
          id="departments"
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
          accent="#7C3AED"
          bg="#fff"
          reverse
        />

        <div className="lmr-div" />

        {/* ── FEATURE 05 — COMMUNICATIONS ── */}
        <FeatureRow
          id="communications"
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
          accent="#EC4899"
          bg="#F8F7FF"
        />

        <div className="lmr-div" />

        {/* ── FEATURE 06 — REPORTS ── */}
        <section id="reports" style={{ background: '#fff', padding: '72px 20px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="fr-grid">
              <div className="fr-text">
                <p className="lmr-eyebrow" style={{ color: '#0891B2', margin: '0 0 12px' }}>06 · Reports & Analytics</p>
                <h2 className="lmr-h2">See your church's health clearly.</h2>
                <p className="lmr-body" style={{ marginBottom: 24 }}>
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
              <div className="fr-screen" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <BrowserFrame src={IMG.reportsFinance} alt="Finance Report" />
                <BrowserFrame src={IMG.reportsAttend}  alt="Attendance Report" />
              </div>
            </div>
          </div>
        </section>

        <div className="lmr-div" />

        {/* ── FEATURE 07 — SETTINGS 2×2 ── */}
        <section id="settings" style={{ background: '#F8F7FF', padding: '72px 20px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <p className="lmr-eyebrow" style={{ color: '#374151', marginBottom: 12 }}>07 · Settings & Administration</p>
            <h2 className="lmr-h2">Built for how churches are actually run.</h2>
            <p className="lmr-body" style={{ maxWidth: 580 }}>
              Give each staff member their own login with the right access level. Manage multiple branches.
              Customise the look. MinistryOS adapts to your church's structure — not the other way around.
            </p>
            <div className="lmr-set-g">
              {[
                {
                  label:   '👥 Team Members — control who has access',
                  src:     IMG.settingsTeam,
                  alt:     'Team Members',
                  caption: 'Add staff with roles: Pastor, Admin / Secretary, Treasurer, or Cell Leader. Each role sees only what they need to.',
                },
                {
                  label:   '🏛️ Branches — manage multiple locations',
                  src:     IMG.settingsBranch,
                  alt:     'Church Branches',
                  caption: 'Running multiple branches? Each has its own data. Switch between them instantly from the top bar.',
                },
                {
                  label:   '🎨 Appearance — Light, Dark, and your brand colour',
                  src:     IMG.settingsTheme,
                  alt:     'Theme Settings',
                  caption: 'Choose Light or Dark mode and pick your church\'s brand colour — applied across every button and highlight.',
                },
                {
                  label:   '➕ Adding a team member takes 30 seconds',
                  src:     IMG.settingsAdd,
                  alt:     'Add Team Member',
                  caption: 'Name, email, role, temporary password — done. They log in and start working immediately.',
                },
              ].map(({ label, src, alt, caption }) => (
                <div key={label}>
                  <p className="lmr-set-label">{label}</p>
                  <BrowserFrame src={src} alt={alt} />
                  <p className="lmr-set-caption">{caption}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BRANCH SWITCHER DARK CALLOUT ── */}
        <section style={{ background: '#1E1B4B', padding: '64px 20px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="fr-grid">
              <div className="fr-text" style={{ color: '#fff' }}>
                <p className="lmr-eyebrow" style={{ color: '#A5B4FC', marginBottom: 12 }}>Multi-branch</p>
                <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-.6px', margin: '0 0 14px', color: '#fff' }}>
                  One church, multiple branches — one login.
                </h2>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,.62)', lineHeight: 1.75, marginBottom: 22 }}>
                  Switch between your branches from the top bar with one click. Data stays separate per branch,
                  or view across all branches at once.
                </p>
                {[
                  'Each branch has its own members, attendance & finance data',
                  'Switch branches instantly — no logging out',
                  'Staff can be cross-branch or branch-specific',
                  'Add new branches for GHS 150 / month each',
                ].map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(165,180,252,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <Check size={10} color="#A5B4FC" strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,.7)' }}>{t}</span>
                  </div>
                ))}
              </div>
              <div className="fr-screen">
                <BrowserFrame src={IMG.dashBranch} alt="Branch Switcher" />
              </div>
            </div>
          </div>
        </section>

        {/* ── GLOBAL SEARCH ── */}
        <section style={{ background: '#F8F7FF', padding: '72px 20px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="fr-grid">
              <div className="fr-text">
                <p className="lmr-eyebrow" style={{ color: '#374151', marginBottom: 12 }}>08 · Global Search</p>
                <h2 className="lmr-h2">Find anything, instantly.</h2>
                <p className="lmr-body" style={{ marginBottom: 22 }}>
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
              <div className="fr-screen">
                <BrowserFrame src={IMG.globalSearch} alt="Global Search" />
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" style={{ background: '#fff', padding: '80px 20px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <p className="lmr-eyebrow" style={{ color: '#4F46E5', marginBottom: 12 }}>Transparent pricing</p>
              <h2 className="lmr-h2" style={{ textAlign: 'center' }}>Plans that grow with your church.</h2>
              <p className="lmr-body" style={{ maxWidth: 440, margin: '0 auto' }}>
                All plans include the full platform. You pay more only as your church grows.
              </p>
            </div>

            <div style={{ maxWidth: 900, margin: '0 auto 40px', borderRadius: 14, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,.1)', border: '1px solid #E5E7EB' }}>
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
                  <a href="/register" className="lmr-plan-btn" style={{ background: color }}>Get started →</a>
                </div>
              ))}
            </div>

            <div style={{ maxWidth: 900, margin: '40px auto 0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,.07)', border: '1px solid #EDE9FE' }}>
              <div style={{ background: '#F8F7FF', padding: '12px 18px', borderBottom: '1px solid #EDE9FE' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#4F46E5' }}>📱 Need more SMS? Buy top-up bundles anytime — 500 for GHS 40, 1,000 for GHS 75, 5,000 for GHS 320.</p>
              </div>
              <img src={IMG.billingSms} alt="SMS Credits" style={{ width: '100%', display: 'block' }} />
            </div>
          </div>
        </section>

        {/* ── WHY MINISTRYOS ── */}
        <section style={{ background: '#F8F7FF', padding: '80px 20px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <p className="lmr-eyebrow" style={{ color: '#4F46E5', marginBottom: 12 }}>Why MinistryOS</p>
              <h2 className="lmr-h2" style={{ textAlign: 'center' }}>Built for modern churches worldwide.</h2>
            </div>
            <div className="lmr-why-g">
              {[
                { icon: '📱', bg: '#EEF2FF', title: 'Works on any device',         body: 'Phone, tablet, or laptop — it runs in your browser. No app to download, no installation. Open it at home, at church, anywhere.' },
                { icon: '🌍', bg: '#ECFDF5', title: 'Built for the world',         body: 'Support for multiple currencies, languages, and payment methods. Not a one-size-fits-all — adapts to your market and congregation.' },
                { icon: '🔐', bg: '#F5F3FF', title: 'Your data is safe',           body: 'All data is encrypted and backed up automatically. Only your team can access it. MinistryOS never shares or sells your church\'s information.' },
                { icon: '⚡', bg: '#FFFBEB', title: 'Live in one afternoon',        body: 'Import your member list and go live the same day. Your secretary can set it up — no IT person, no training course required.' },
                { icon: '🤖', bg: '#E0F2FE', title: 'Automations that save hours', body: 'Birthday wishes, welcome messages, absence follow-ups — set them once and they run themselves. Your members feel cared for even when you\'re busy.' },
                { icon: '📊', bg: '#FDF2F8', title: 'Reports your board will love', body: 'Export a full attendance and finance report to PDF with one click. Come to every board meeting with real numbers — not estimates from memory.' },
              ].map(({ icon, bg, title, body }) => (
                <div key={title} className="lmr-why-card">
                  <div style={{ background: bg, width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, fontSize: 22 }}>
                    {icon}
                  </div>
                  <div className="lmr-why-title">{title}</div>
                  <p className="lmr-why-body">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="lmr-testi-sec">
          <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
            <p className="lmr-eyebrow" style={{ color: '#A5B4FC', marginBottom: 12 }}>
              From pastors & admins using MinistryOS
            </p>
            <h2 style={{ fontSize: 'clamp(24px,3.5vw,42px)', fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1.1 }}>
              Churches that made the switch.
            </h2>
          </div>
          <div className="lmr-testi-g">
            {[
              { q: 'Before MinistryOS, our attendance records were in notebooks. Now we see last Sunday\'s numbers before we leave the building.', name: 'Ps. Emmanuel Asante',  role: 'Senior Pastor, Accra',         init: 'EA', color: '#4F46E5' },
              { q: 'The MoMo giving feature changed everything. Pledges are up because members can now track their own commitments and feel accountable.', name: 'Mrs. Abena Mensah',   role: 'Church Administrator, Kumasi', init: 'AM', color: '#059669' },
              { q: 'We activated the birthday automation and members started calling to say thank you. It costs us nothing and it means everything to them.', name: 'Elder Kwame Boateng', role: 'Church Leader, Takoradi',       init: 'KB', color: '#D97706' },
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

        {/* ── FINAL CTA ── */}
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
                Register your church free <ArrowRight size={16} />
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
          <Logo size={20} showText={false} />
          <span>© 2026 EM Control IT Solutions · MinistryOS · All rights reserved</span>
        </footer>

      </div>
    </>
  )
}