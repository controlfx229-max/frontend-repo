import { useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import Logo from './Logo'
import Footer from './Footer'

/*
 * ── LEGAL PAGE LAYOUT ─────────────────────────
 * Shared shell for every legal/policy page so they
 * all look like part of the same product instead of
 * a plain dumped legal document.
 *
 * Usage:
 *   <LegalLayout title="Privacy Policy" updated="25 July 2026" sections={sections}>
 *     ...content...
 *   </LegalLayout>
 *
 * `sections` = [{ id, label }] used to render the
 * sticky in-page table of contents.
 */
export default function LegalLayout({ title, tagline, updated, sections = [], children }) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        .legal { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; background: #fff; }
        .legal section[id] { scroll-margin-top: 90px; }

        .legal-nav { position: sticky; top: 0; z-index: 40; height: 60px; display: flex; align-items: center; padding: 0 20px; background: rgba(255,255,255,.96); backdrop-filter: blur(16px); box-shadow: 0 1px 0 rgba(0,0,0,.07); }
        .legal-nav-in { max-width: 1100px; margin: 0 auto; width: 100%; display: flex; align-items: center; justify-content: space-between; }
        .legal-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; font-size: 16px; font-weight: 800; color: #111827; }
        .legal-nav-btn { font-size: 13px; font-weight: 700; color: #fff; background: #4F46E5; border: none; border-radius: 8px; padding: 8px 14px; cursor: pointer; text-decoration: none; }

        .legal-hero { background: linear-gradient(150deg,#1E1B4B 0%,#312E81 40%,#4F46E5 75%,#6D28D9 100%); padding: 56px 20px 44px; text-align: center; }
        .legal-hero-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #A5B4FC; margin-bottom: 12px; }
        .legal-hero-h1 { font-size: clamp(26px,4vw,44px); font-weight: 900; color: #fff; letter-spacing: -0.8px; margin-bottom: 10px; }
        .legal-hero-sub { font-size: 14.5px; color: rgba(255,255,255,.65); max-width: 560px; margin: 0 auto; line-height: 1.7; }
        .legal-hero-updated { display: inline-block; margin-top: 18px; font-size: 12px; font-weight: 600; color: #fff; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2); padding: 5px 14px; border-radius: 999px; }

        .legal-body { max-width: 1100px; margin: 0 auto; padding: 48px 20px 80px; display: grid; grid-template-columns: 220px 1fr; gap: 48px; align-items: start; }
        .legal-toc { position: sticky; top: 84px; display: flex; flex-direction: column; gap: 4px; }
        .legal-toc-label { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #9CA3AF; margin-bottom: 8px; }
        .legal-toc-btn { text-align: left; font-size: 13px; color: #4B5563; background: none; border: none; padding: 7px 10px; border-radius: 8px; cursor: pointer; line-height: 1.4; }
        .legal-toc-btn:hover { background: #F3F4F6; color: #4F46E5; }

        .legal-content h2 { font-size: 20px; font-weight: 800; color: #111827; letter-spacing: -0.3px; margin: 40px 0 12px; scroll-margin-top: 90px; }
        .legal-content h2:first-child { margin-top: 0; }
        .legal-content h3 { font-size: 15px; font-weight: 700; color: #1F2937; margin: 22px 0 8px; }
        .legal-content p { font-size: 14.5px; line-height: 1.8; color: #4B5563; margin-bottom: 12px; }
        .legal-content ul, .legal-content ol { margin: 0 0 14px; padding-left: 20px; display: flex; flex-direction: column; gap: 7px; }
        .legal-content li { font-size: 14.5px; line-height: 1.75; color: #4B5563; }
        .legal-content strong { color: #1F2937; font-weight: 700; }
        .legal-content a { color: #4F46E5; font-weight: 600; text-decoration: none; }
        .legal-content a:hover { text-decoration: underline; }

        .legal-callout { background: #F8F7FF; border: 1px solid #EDE9FE; border-radius: 12px; padding: 16px 18px; margin: 18px 0; }
        .legal-callout p { margin: 0; color: #4338CA; font-size: 13.5px; }

        .legal-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 12px 0 20px; border: 1px solid #F3F4F6; border-radius: 10px; }
        .legal-table { width: 100%; min-width: 480px; border-collapse: collapse; font-size: 13.5px; }
        .legal-table th { text-align: left; background: #F8F7FF; color: #4338CA; font-weight: 700; padding: 10px 12px; border-bottom: 2px solid #EDE9FE; white-space: nowrap; }
        .legal-table td { padding: 10px 12px; border-bottom: 1px solid #F3F4F6; color: #4B5563; vertical-align: top; }

        @media (max-width: 860px) {
          .legal-body { grid-template-columns: 1fr; padding: 36px 16px 64px; gap: 20px; }
          .legal-toc { position: static; flex-direction: row; flex-wrap: wrap; }
          .legal-toc-btn { background: #F8F7FF; border-radius: 999px; }
        }

        @media (max-width: 480px) {
          .legal-nav { padding: 0 14px; }
          .legal-hero { padding: 40px 16px 32px; }
          .legal-hero-sub { font-size: 13.5px; }
          .legal-toc { gap: 6px; }
          .legal-toc-label { width: 100%; margin-bottom: 4px; }
          .legal-content h2 { font-size: 18px; margin-top: 32px; }
          .legal-content p, .legal-content li { font-size: 14px; }
          .legal-table { min-width: 420px; font-size: 12.5px; }
        }
      `}</style>

      <div className="legal">
        {/* Minimal nav */}
        <nav className="legal-nav">
          <div className="legal-nav-in">
            <a href="/" className="legal-logo">
              <Logo size={26} showText={false} />
              MinistryOS
            </a>
            <a href="/register" className="legal-nav-btn">Get started free</a>
          </div>
        </nav>

        {/* Hero */}
        <div className="legal-hero">
          <p className="legal-hero-eyebrow">Legal</p>
          <h1 className="legal-hero-h1">{title}</h1>
          {tagline && <p className="legal-hero-sub">{tagline}</p>}
          {updated && <div className="legal-hero-updated">Last updated: {updated}</div>}
        </div>

        {/* Body: TOC + content */}
        <div className="legal-body">
          {sections.length > 0 && (
            <div className="legal-toc">
              <p className="legal-toc-label">On this page</p>
              {sections.map(s => (
                <button key={s.id} className="legal-toc-btn" onClick={() => scrollTo(s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
          )}
          <div className="legal-content">
            {children}
          </div>
        </div>

        {/* Bottom CTA strip before footer */}
        <div style={{ background: '#F8F7FF', borderTop: '1px solid #EDE9FE', padding: '36px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#4B5563', marginBottom: 14 }}>
            Questions about this policy? We're happy to help.
          </p>
          <a href="/contact" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#4F46E5', color: '#fff', fontWeight: 700, fontSize: 14,
            padding: '11px 20px', borderRadius: 10, textDecoration: 'none',
          }}>
            Contact us <ArrowRight size={15} />
          </a>
        </div>

        <Footer />
      </div>
    </>
  )
}