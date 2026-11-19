import { useState, useEffect, useRef } from 'react'
import {
  Check, Play, X, Tag, Smartphone, MessageSquareText, Cloud, Users, GitBranch, Palette, UserPlus,
  Globe, ShieldCheck, Zap, Workflow, FileChartColumn, ArrowRight,
} from 'lucide-react'
import BrandMark from '../../components/BrandMark'
import ArchLines from '../../components/ArchLines'
import Footer from '../../components/Footer'
import '../../styles/brand.css'
import '../../styles/landing.css'

/* ── IMAGE PATHS ──────────────────────────────────────────────────────────────
   Images are located in /public/images/ folder
   ──────────────────────────────────────────────────────────────────────────── */
const IMG = {
  dashboard:      '/images/Dashboard.webp',
  dashBranch:     '/images/Branch switcher.webp',
  membersList:    '/images/Members.webp',
  memberProfile:  '/images/Member profile.webp',
  memberAttend:   '/images/Member Attendance.webp',
  memberGiving:   '/images/Member Giving.webp',
  globalSearch:   '/images/Global search.webp',
  attendCreate:   '/images/Attendance service creation.webp',
  attendSearch:   '/images/Marked Attendance.webp',
  departments:    '/images/Departments.webp',
  comms:          '/images/Comm.webp',
  reportsFinance: '/images/reports finance.webp',
  reportsAttend:  '/images/Reports Attendance.webp',
  reportsOverview: '/images/Reports Overview.webp',
  settingsTeam:   '/images/Setting Team members.webp',
  settingsAdd:    '/images/Setting AddTeam member.webp',
  settingsBranch: '/images/Settings Branches.webp',
  settingsTheme:  '/images/Theme mode.webp',
  automation1:    '/images/Automations 1.webp',
  automation2:    '/images/Automations 2.webp',
  billingPlans:   '/images/Billing plans.webp',
  billingSms:     '/images/Billing sms credits.webp',
}

/* Intrinsic pixel sizes, so the browser reserves space before lazy images load
   (otherwise nav scrolling lands short as the page grows underneath it). */
const IMG_SIZE = {
  "/images/Attendance service creation.webp": [
    632,
    544
  ],
  "/images/Automations 1.webp": [
    1189,
    820
  ],
  "/images/Automations 2.webp": [
    1189,
    820
  ],
  "/images/Billing plans.webp": [
    1189,
    838
  ],
  "/images/Billing sms credits.webp": [
    1189,
    838
  ],
  "/images/Branch switcher.webp": [
    1189,
    430
  ],
  "/images/Comm.webp": [
    1189,
    838
  ],
  "/images/Dashboard.webp": [
    1440,
    860
  ],
  "/images/Departments.webp": [
    1189,
    838
  ],
  "/images/Global search.webp": [
    1040,
    330
  ],
  "/images/Marked Attendance.webp": [
    792,
    882
  ],
  "/images/Member Attendance.webp": [
    1189,
    838
  ],
  "/images/Member Giving.webp": [
    1189,
    838
  ],
  "/images/Member profile.webp": [
    1189,
    838
  ],
  "/images/Members.webp": [
    1189,
    720
  ],
  "/images/Reports Attendance.webp": [
    1189,
    838
  ],
  "/images/Reports Overview.webp": [
    1189,
    838
  ],
  "/images/Setting AddTeam member.webp": [
    632,
    637
  ],
  "/images/Setting Team members.webp": [
    1189,
    720
  ],
  "/images/Settings Branches.webp": [
    1189,
    760
  ],
  "/images/Theme mode.webp": [
    1189,
    800
  ],
  "/images/reports finance.webp": [
    1189,
    838
  ]
}

/* ── PRODUCT TOUR INDEX ──────────────────────────────────────────────────── */
const QUICK_NAV = [
  { id: 'dashboard',      label: 'Dashboard'      },
  { id: 'members',        label: 'Members'        },
  { id: 'profiles',       label: 'Profiles'       },
  { id: 'attendance',     label: 'Attendance'     },
  { id: 'departments',    label: 'Departments'    },
  { id: 'communications', label: 'Communications' },
  { id: 'automations',    label: 'Automations'    },
  { id: 'reports',        label: 'Reports'        },
  { id: 'settings',       label: 'Settings'       },
  { id: 'search',         label: 'Global search'  },
  { id: 'pricing',        label: 'Pricing'        },
]

// Standard (non-founding) trial SMS credits — mirrors
// STANDARD_TRIAL_SMS_CREDITS in auth.controller.js. Used only as
// display copy once the founding promo has run out; the founding
// numbers themselves always come live from /auth/founding-status.
const STANDARD_TRIAL_SMS_FALLBACK = 200

const PLANS = [
  { name: 'Starter',    price: 'GHS 200', feats: ['Up to 200 members', '5 staff accounts', '1 branch', '200 SMS credits / month'] },
  { name: 'Growth',     price: 'GHS 350', badge: 'Most popular', featured: true,
    feats: ['Up to 500 members', '15 staff accounts', '2 branches', '500 SMS credits / month'] },
  { name: 'Enterprise', price: 'GHS 500', badge: 'Best value',
    feats: ['Unlimited members', 'Unlimited staff accounts', '5 branches', '2,000 SMS credits / month'] },
]

const WHY = [
  { icon: Smartphone,     title: 'Works on any device',           body: 'Phone, tablet, or laptop. It runs in your browser with no app to download and nothing to install. Open it at home, at church, anywhere.' },
  { icon: Globe,          title: 'Built for the world',           body: 'Support for multiple currencies, languages, and payment methods. Not one-size-fits-all: it adapts to your market and congregation.' },
  { icon: ShieldCheck,    title: 'Your data is safe',             body: 'All data is encrypted and backed up automatically. Only your team can access it. MinistryOS never shares or sells your church\'s information.' },
  { icon: Zap,            title: 'Live in one afternoon',         body: 'Import your member list and go live the same day. Your secretary can set it up, with no IT person and no training course required.' },
  { icon: Workflow,       title: 'Automations that save hours',   body: 'Birthday wishes, welcome messages, absence follow-ups. Set them once and they run themselves, so members feel cared for even when you\'re busy.' },
  { icon: FileChartColumn, title: 'Reports your board will love', body: 'Export a full attendance and finance report to PDF with one click. Come to every board meeting with real numbers, not estimates from memory.' },
]

const TESTIMONIALS = [
  { q: 'Before MinistryOS, our attendance records were in notebooks. Now we see last Sunday\'s numbers before we leave the building.', name: 'Ps. Emmanuel Asante',  role: 'Senior Pastor, Accra',         init: 'EA' },
  { q: 'The MoMo giving feature changed everything. Pledges are up because members can now track their own commitments and feel accountable.', name: 'Mrs. Abena Mensah',   role: 'Church Administrator, Kumasi', init: 'AM' },
  { q: 'We activated the birthday automation and members started calling to say thank you. It costs us nothing and it means everything to them.', name: 'Elder Kwame Boateng', role: 'Church Leader, Takoradi',       init: 'KB' },
]

/* ── SMALL PIECES ────────────────────────────────────────────────────────── */
function Shot({ src, alt, onZoom }) {
  return (
    <button type="button" className="lp-shot" onClick={() => onZoom(src)} aria-label={`View larger: ${alt}`}>
      <img src={src} alt={alt} loading="lazy" width={IMG_SIZE[src]?.[0]} height={IMG_SIZE[src]?.[1]} />
    </button>
  )
}

function Bullets({ items }) {
  return (
    <ul className="lp-bul">
      {items.map((b, i) => (
        <li key={i}>
          <Check size={17} strokeWidth={2.2} aria-hidden="true" />
          <span>{b.bold ? <><strong>{b.bold}</strong>{' '}{b.rest}</> : b}</span>
        </li>
      ))}
    </ul>
  )
}

function Spec({ id, title, body, children }) {
  return (
    <article id={id} className="lp-art">
      <h2 className="lp-h2">{title}</h2>
      <p className="lp-body">{body}</p>
      {children}
    </article>
  )
}

/* ── MAIN ────────────────────────────────────────────────────────────────── */
export default function LearnMore() {
  const [scrolled,    setScrolled]    = useState(false)
  const [memberTab,   setMemberTab]   = useState('overview')
  const [showVideo,   setShowVideo]   = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState(null)
  const [active,      setActive]      = useState('dashboard')
  const videoRef = useRef(null)

  // Live founding-church promo status. This is a PUBLIC page, so this hits
  // the unauthenticated /auth/founding-status endpoint.
  const [founding, setFounding] = useState(null)

  useEffect(() => {
    const fetchFounding = async () => {
      try {
        const res  = await fetch(`${import.meta.env.VITE_API_URL}/auth/founding-status`)
        const data = await res.json()
        if (data.success) setFounding(data.founding)
      } catch {
        // Non-critical — page falls back to standard-trial copy below.
      }
    }
    fetchFounding()
  }, [])

  useEffect(() => {
    // Always start at the very top so the hero headline is never hidden
    // behind the sticky nav (some browsers restore the old scroll position).
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Highlight the product-tour section currently in view.
  useEffect(() => {
    const els = QUICK_NAV.map(n => document.getElementById(n.id)).filter(Boolean)
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) })
    }, { rootMargin: '-25% 0px -65% 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  // Lock background scroll while the lightbox is open, close on Escape.
  useEffect(() => {
    document.body.style.overflow = lightboxSrc ? 'hidden' : ''
    const onKey = (e) => { if (e.key === 'Escape') setLightboxSrc(null) }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [lightboxSrc])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Reveal the <video> and call .play() inside the click handler so browsers
  // treat it as user-initiated playback rather than blocked autoplay.
  const handlePlayDemo = () => {
    setShowVideo(true)
    setTimeout(() => { videoRef.current?.play() }, 0)
  }

  const memberTabs = {
    overview: {
      src: IMG.memberProfile,
      bullets: [
        { bold: 'Personal details:', rest: 'Phone, gender, date of birth, marital status. Everything in one place.' },
        { bold: 'Church information:', rest: 'Auto-generated Member ID, join date, department, cell group, and baptism status.' },
        { bold: 'Quick actions:', rest: 'Call member, send message, or edit their profile directly from this screen.' },
      ],
    },
    attendance: {
      src: IMG.memberAttend,
      bullets: [
        { bold: 'Attendance rate:', rest: 'See exactly how consistently each member shows up, as a percentage.' },
        { bold: 'Consistency bar:', rest: 'A visual progress bar across all services recorded for that member.' },
        { bold: 'Service history:', rest: 'Every service attended or missed, with the exact date and service name.' },
      ],
    },
    giving: {
      src: IMG.memberGiving,
      bullets: [
        { bold: 'Total giving (all time):', rest: 'The complete giving picture for that member: every contribution ever recorded.' },
        { bold: 'Yearly and monthly view:', rest: 'Filter by this year or this month to see recent giving patterns.' },
        { bold: 'Giving statements:', rest: 'Useful for recognising faithful givers or preparing end-of-year acknowledgements.' },
      ],
    },
  }
  const mt = memberTabs[memberTab]

  const promoActive = founding?.promoActive
  const remaining   = founding?.remaining

  const facts = [
    { icon: Tag,               val: '3 plans',  lbl: 'Starting at GHS 200 / month' },
    { icon: Smartphone,        val: 'MoMo',     lbl: 'Mobile Money giving built in' },
    promoActive
      ? { icon: MessageSquareText, val: `${founding.bonusCredits} SMS`, lbl: `Free credits. ${remaining} founding spot${remaining !== 1 ? 's' : ''} left` }
      : { icon: MessageSquareText, val: `${STANDARD_TRIAL_SMS_FALLBACK} SMS`, lbl: 'Free trial credits included' },
    { icon: Cloud,             val: '100%',     lbl: 'Cloud-based, no app to install' },
  ]

  return (
    <>
      <div className="mx lp">

        {/* ── NAV ── */}
        <header className={`lp-nav${scrolled ? ' is-solid' : ''}`}>
          <div className="lp-nav-in">
            <a href="/" aria-label="MinistryOS home"><BrandMark tone={scrolled ? 'dark' : 'light'} size={34} /></a>
            <nav className="lp-nav-links" aria-label="Sections">
              <button onClick={() => scrollTo('members')}>Features</button>
              <button onClick={() => scrollTo('pricing')}>Pricing</button>
            </nav>
            <div className="lp-nav-cta">
              <a href="/login" className="lp-nav-signin">Sign in</a>
              <a href="/register" className="mx-btn mx-btn-brass lp-nav-btn">Get started free</a>
            </div>
          </div>
        </header>

        {/* ── HERO ── */}
        <section className="lp-hero" id="dashboard">
          <ArchLines className="lp-hero-arches" />
          <div className="lp-hero-in">
            <div className="lp-hero-copy">
              <h1 className="lp-h1">Your church deserves software that works.</h1>
              <p className="lp-lede">
                MinistryOS replaces notebooks, WhatsApp groups, and scattered spreadsheets with
                one clean platform your entire leadership team can actually use, from Sunday morning to board meeting.
              </p>
              <div className="lp-cta-row">
                <a href="/register" className="mx-btn mx-btn-brass">
                  {promoActive ? `Start free: ${founding.bonusCredits} SMS included` : 'Start free: 30-day trial'}
                </a>
                <a href="/login" className="mx-btn mx-btn-line-light">Sign into your account</a>
              </div>
              {/* Founding-promo scarcity line: only rendered while spots remain. */}
              {promoActive && (
                <p className="lp-live">
                  <i aria-hidden="true" />
                  Only {remaining} founding spot{remaining !== 1 ? 's' : ''} left, with {founding.bonusCredits} free SMS credits
                </p>
              )}
            </div>
            <button type="button" className="lp-hero-shot" onClick={() => setLightboxSrc(IMG.dashboard)} aria-label="View larger: MinistryOS dashboard">
              <img src={IMG.dashboard} alt="MinistryOS dashboard showing members, attendance and giving" width={IMG_SIZE[IMG.dashboard][0]} height={IMG_SIZE[IMG.dashboard][1]} />
            </button>
          </div>
        </section>

        {/* ── FACTS ── */}
        <section className="lp-facts" aria-label="At a glance">
          <ul className="lp-facts-in">
            {facts.map(({ icon: Icon, val, lbl }) => (
              <li key={lbl}>
                <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
                <div><b>{val}</b><span>{lbl}</span></div>
              </li>
            ))}
          </ul>
        </section>

        {/* ── DEMO ── */}
        <section className="lp-demo">
          <div className="lp-demo-head">
            <h2 className="lp-h2">Six minutes from login to Sunday report.</h2>
            <p className="lp-body">The dashboard is your church's pulse, every time you open the app. Watch the full walkthrough.</p>
          </div>
          <div className="lp-demo-card">
            {showVideo ? (
              <video ref={videoRef} className="lp-demo-video" src="/videos/ministryos-demo.mp4" controls preload="metadata" />
            ) : (
              <button type="button" className="lp-demo-thumb" onClick={handlePlayDemo} style={{ backgroundImage: `url("${IMG.reportsOverview}")` }}>
                <span className="lp-demo-play"><Play size={26} fill="currentColor" strokeWidth={0} aria-hidden="true" /></span>
                <span className="lp-demo-label">Watch the 6-minute demo</span>
              </button>
            )}
          </div>
        </section>

        {/* ── PRODUCT TOUR ── */}
        <section className="lp-tour">
          <div className="lp-tour-in">
            <aside className="lp-index" aria-label="Product tour">
              <ul>
                {QUICK_NAV.map(({ id, label }) => (
                  <li key={id}>
                    <button className={active === id ? 'is-on' : ''} onClick={() => scrollTo(id)} aria-current={active === id ? 'true' : undefined}>
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </aside>

            <div className="lp-tour-body">

              <Spec id="members" title="Every member, fully known."
                body="No more notebooks or scattered contact lists. MinistryOS gives every church member a complete digital profile, searchable by your whole team from any device.">
                <Shot src={IMG.membersList} alt="Members directory" onZoom={setLightboxSrc} />
                <Bullets items={[
                  { bold: 'Searchable directory:', rest: 'Find any member instantly by name or phone number.' },
                  { bold: 'Unique Member IDs:', rest: 'Every person gets an auto-generated ID (MIN-0249) for easy reference.' },
                  { bold: 'Department and cell group:', rest: 'See which team and group each person belongs to at a glance.' },
                  { bold: 'Active / Inactive status:', rest: 'Know who is engaged and who needs a follow-up call.' },
                ]} />
              </Spec>

              <Spec id="profiles" title="Three views of every person."
                body="Click any member and get their complete story: personal details, attendance history, and giving record, all in one profile with three clean tabs.">
                <div className="lp-tabs" role="tablist" aria-label="Member profile views">
                  {[{ id: 'overview', label: 'Overview' }, { id: 'attendance', label: 'Attendance' }, { id: 'giving', label: 'Giving' }].map(t => (
                    <button key={t.id} role="tab" aria-selected={memberTab === t.id}
                      className={memberTab === t.id ? 'is-on' : ''} onClick={() => setMemberTab(t.id)}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <Shot src={mt.src} alt="Member profile" onZoom={setLightboxSrc} />
                <Bullets items={mt.bullets} />
              </Spec>

              <Spec id="attendance" title="Mark attendance in under a minute."
                body="Create a service, search for each member by name or member ID, and tap to mark them present. MinistryOS handles the counting, history, and reporting automatically.">
                <Shot src={IMG.attendSearch} alt="Quick check-in" onZoom={setLightboxSrc} />
                <Bullets items={[
                  { bold: 'Create any service type:', rest: 'Sunday, Prayer Night, Special Service. Name it whatever you want.' },
                  { bold: 'Quick check-in search:', rest: 'Type a name, phone number, or member ID to find anyone instantly.' },
                  { bold: '"Mark All Present" button:', rest: 'One tap marks everyone present, then adjust for absences.' },
                  { bold: 'Live count updates:', rest: 'See present and absent numbers updating in real time as you tap.' },
                ]} />
                <div className="lp-sub">
                  <h3 className="lp-h3">Creating a service takes 30 seconds.</h3>
                  <p className="lp-body">Service Type, Custom Name, Date, Time. That's all you need. Hit "Create Service" and you're ready to start marking attendance.</p>
                  <Shot src={IMG.attendCreate} alt="Create new service" onZoom={setLightboxSrc} />
                </div>
              </Spec>

              <Spec id="departments" title="Structure your church, cleanly."
                body="Create departments like Media, Protocol, or Worship. Assign a leader, add members, and expand to see everyone inside. Cell groups live separately, not buried under departments.">
                <Shot src={IMG.departments} alt="Departments and cell groups" onZoom={setLightboxSrc} />
                <Bullets items={[
                  { bold: 'Colour-coded departments:', rest: 'Each department has its own colour for quick visual identification.' },
                  { bold: 'Department leader:', rest: 'Assign a leader with a crown badge, instantly visible to the whole team.' },
                  { bold: 'Members list per department:', rest: 'Expand any department to see all members with phone numbers.' },
                  { bold: 'General Cell Groups:', rest: 'A separate section for cell groups, not nested inside departments.' },
                ]} />
              </Spec>

              <Spec id="communications" title="Reach your whole church with one SMS."
                body="Type your message, pick your audience, and send. MinistryOS shows you exactly how many people will receive it before you hit send. No guessing, no wasted credits.">
                <Shot src={IMG.comms} alt="Communications" onZoom={setLightboxSrc} />
                <Bullets items={[
                  { bold: 'Target by status:', rest: 'Send to all active members, inactive members, or everyone.' },
                  { bold: 'Target by department:', rest: 'Message only the Media team, or Protocol, whoever you choose.' },
                  { bold: 'Personalise automatically:', rest: 'Use {{firstName}} and MinistryOS fills in each person\'s name.' },
                  { bold: 'Recipient preview:', rest: '"4 recipients will receive this message." You always know before sending.' },
                ]} />
              </Spec>

              <Spec id="automations" title="Set it once. It runs itself."
                body="Birthday wishes, absence follow-ups, event reminders, and welcome messages for new members, all triggered automatically, with full control to preview, pause, or run any of them manually.">
                <div className="lp-shots-2">
                  <Shot src={IMG.automation1} alt="Automations overview" onZoom={setLightboxSrc} />
                  <Shot src={IMG.automation2} alt="Automations list" onZoom={setLightboxSrc} />
                </div>
                <Bullets items={[
                  { bold: 'Consecutive Absence Alert:', rest: 'Automatically reaches out to members who have missed a number of services in a row.' },
                  { bold: 'Birthday Wishes:', rest: 'Sends a birthday message to every member automatically, every day at 8AM.' },
                  { bold: 'Event Reminders and New Member Welcome:', rest: 'Reminders fire before upcoming events, and welcome messages send the instant a new member is added.' },
                  { bold: 'Full visibility:', rest: 'See last run time, total messages sent, and active/inactive status for every automation at a glance.' },
                ]} />
              </Spec>

              <Spec id="reports" title="See your church's health clearly."
                body="Four report tabs (Overview, Members, Attendance, and Finance) give your leadership team the numbers they need to make better decisions and walk into board meetings prepared.">
                <div className="lp-shots-2">
                  <Shot src={IMG.reportsFinance} alt="Finance report" onZoom={setLightboxSrc} />
                  <Shot src={IMG.reportsAttend} alt="Attendance report" onZoom={setLightboxSrc} />
                </div>
                <Bullets items={[
                  { bold: 'Finance report:', rest: 'Total income GHS 421,380 vs expenses GHS 168,920, with income breakdown by category.' },
                  { bold: 'Attendance report:', rest: 'Average rate per service, and a leaderboard of your most consistent attenders.' },
                  { bold: 'Consistent attenders:', rest: 'Ranked by services attended. Great for recognising and appreciating faithful members.' },
                  { bold: 'Export to PDF:', rest: 'One click exports the full report, ready for printing or sharing at a board meeting.' },
                ]} />
              </Spec>

              <Spec id="settings" title="Built for how churches are actually run."
                body="Give each staff member their own login with the right access level. Manage multiple branches. Customise the look. MinistryOS adapts to your church's structure, not the other way around.">
                <div className="lp-set">
                  {[
                    { icon: Users,    label: 'Team members: control who has access',        src: IMG.settingsTeam,   alt: 'Team members',
                      caption: 'Add staff with roles: Pastor, Admin / Secretary, Treasurer, or Cell Leader. Each role sees only what they need to.' },
                    { icon: GitBranch, label: 'Branches: manage multiple locations',        src: IMG.settingsBranch, alt: 'Church branches',
                      caption: 'Running multiple branches? Each has its own data. Switch between them instantly from the top bar.' },
                    { icon: Palette,  label: 'Appearance: light, dark, and your brand colour', src: IMG.settingsTheme, alt: 'Theme settings',
                      caption: 'Choose Light or Dark mode and pick your church\'s brand colour, applied across every button and highlight.' },
                    { icon: UserPlus, label: 'Adding a team member takes 30 seconds',       src: IMG.settingsAdd,    alt: 'Add team member',
                      caption: 'Name, email, role, temporary password. Done. They log in and start working immediately.' },
                  ].map(({ icon: Icon, label, src, alt, caption }) => (
                    <div key={label} className="lp-set-item">
                      <p className="lp-set-label"><Icon size={18} strokeWidth={1.6} aria-hidden="true" />{label}</p>
                      <Shot src={src} alt={alt} onZoom={setLightboxSrc} />
                      <p className="lp-set-cap">{caption}</p>
                    </div>
                  ))}
                </div>
              </Spec>

              <Spec id="search" title="Find anything, instantly."
                body="Press the search icon from anywhere in MinistryOS. Type a member name, a module, or a keyword and jump there in one click. No more clicking through menus to find the page you need.">
                <Shot src={IMG.globalSearch} alt="Global search" onZoom={setLightboxSrc} />
                <Bullets items={[
                  'Search members by name or ID',
                  'Jump to any page in the platform',
                  'Available from every screen',
                ]} />
              </Spec>

            </div>
          </div>
        </section>

        {/* ── MULTI-BRANCH ── */}
        <section className="lp-branch">
          <div className="lp-branch-in">
            <div className="lp-branch-copy">
              <h2 className="lp-h2">One church, multiple branches, one login.</h2>
              <p className="lp-body">
                Switch between your branches from the top bar with one click. Data stays separate per branch,
                or view across all branches at once.
              </p>
              <ul className="lp-branch-list">
                {[
                  'Each branch has its own members, attendance and finance data',
                  'Switch branches instantly, no logging out',
                  'Staff can be cross-branch or branch-specific',
                  'Add new branches for GHS 150 / month each',
                ].map(t => (<li key={t}><Check size={17} strokeWidth={2.2} aria-hidden="true" />{t}</li>))}
              </ul>
            </div>
            <Shot src={IMG.dashBranch} alt="Branch switcher" onZoom={setLightboxSrc} />
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="lp-pricing">
          <div className="lp-wrap">
            <div className="lp-pricing-head">
              <h2 className="lp-h2">Plans that grow with your church.</h2>
              <p className="lp-body">All plans include the full platform. You pay more only as your church grows.</p>
            </div>

            <div className="lp-plans">
              {PLANS.map(({ name, price, badge, featured, feats }) => (
                <div key={name} className={`lp-plan${featured ? ' is-featured' : ''}`}>
                  <div className="lp-plan-top">
                    <h3>{name}</h3>
                    {badge && <span className="lp-plan-badge">{badge}</span>}
                  </div>
                  <p className="lp-plan-price"><b>{price}</b><span>per month</span></p>
                  <ul>
                    {feats.map(f => (<li key={f}><Check size={16} strokeWidth={2.2} aria-hidden="true" />{f}</li>))}
                  </ul>
                  <a href="/register" className={`mx-btn ${featured ? 'mx-btn-brass' : 'mx-btn-line'} mx-btn-block`}>Get started</a>
                </div>
              ))}
            </div>

            <div className="lp-topup">
              <ShieldCheck size={22} strokeWidth={1.5} aria-hidden="true" />
              <p>Pay online with Mobile Money (MTN, Telecel, AirtelTigo) or card, secured by Paystack. Your plan activates automatically as soon as the payment is confirmed.</p>
            </div>

            <div className="lp-topup">
              <Smartphone size={22} strokeWidth={1.5} aria-hidden="true" />
              <p>Need more SMS? Buy top-up bundles anytime: 500 for GHS 40, 1,000 for GHS 75, 5,000 for GHS 320.</p>
              <div className="lp-topup-links">
                <button type="button" onClick={() => setLightboxSrc(IMG.billingPlans)}>See the plans screen</button>
                <button type="button" onClick={() => setLightboxSrc(IMG.billingSms)}>See SMS top-ups</button>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHY ── */}
        <section className="lp-why">
          <div className="lp-wrap">
            <h2 className="lp-h2">Built for modern churches worldwide.</h2>
            <div className="lp-why-g">
              {WHY.map(({ icon: Icon, title, body }) => (
                <div key={title} className="lp-why-item">
                  <Icon size={26} strokeWidth={1.4} aria-hidden="true" />
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="lp-testi">
          <div className="lp-wrap">
            <h2 className="lp-h2">Churches that made the switch.</h2>
            <div className="lp-testi-g">
              {TESTIMONIALS.map(({ q, name, role, init }, i) => (
                <figure key={name} className={`lp-quote${i === 0 ? ' is-lead' : ''}`}>
                  <blockquote>{q}</blockquote>
                  <figcaption>
                    <span className="lp-av">{init}</span>
                    <span><b>{name}</b><i>{role}</i></span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="lp-final">
          <ArchLines className="lp-final-arches" />
          <div className="lp-final-in">
            <h2 className="lp-final-h2">Your church runs on people. Let MinistryOS handle the rest.</h2>
            <p className="lp-final-body">
              {promoActive
                ? `Register today and get ${founding.bonusCredits} free SMS credits. Only ${remaining} founding spot${remaining !== 1 ? 's' : ''} left. No credit card needed to start.`
                : `Register today and start your 30-day free trial with ${STANDARD_TRIAL_SMS_FALLBACK} free SMS credits included. No credit card needed to start.`}
              {' '}Your first branch is included. You can be live before Sunday.
            </p>
            <div className="lp-cta-row">
              <a href="/register" className="mx-btn mx-btn-brass">Register your church free <ArrowRight size={17} aria-hidden="true" /></a>
              <a href="/login" className="mx-btn mx-btn-line-light">Already have an account</a>
            </div>
            <p className="lp-final-note">No setup fee. Cancel anytime. GHS 200 / month to start.</p>
          </div>
        </section>

        <Footer />
      </div>

      {/* ── LIGHTBOX: tap any screenshot to view it full-size ── */}
      {lightboxSrc && (
        <div className="mx lp-lightbox" onClick={() => setLightboxSrc(null)} role="dialog" aria-modal="true" aria-label="Screenshot preview">
          <button type="button" className="lp-lightbox-close" onClick={() => setLightboxSrc(null)} aria-label="Close preview"><X size={22} /></button>
          <img src={lightboxSrc} alt="Zoomed view" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  )
}
