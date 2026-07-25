import Logo from './Logo'

/*
 * ── SITE FOOTER ───────────────────────────────
 * Drop this at the bottom of every public page:
 * LearnMore, Login, Register, and any new
 * Features / Pricing / Contact pages, plus every
 * legal page (via LegalLayout, which already
 * includes it).
 *
 * Uses plain <a href> (not <Link>) so it works
 * the same whether the page is inside the SPA
 * router or not.
 */
export default function Footer() {
  const year = new Date().getFullYear()

  const productLinks = [
    { label: 'Features', href: '/learn-more#members' },
    { label: 'Pricing',  href: '/learn-more#pricing'  },
    { label: 'Contact',  href: '/contact'             },
  ]

  const legalLinks = [
    { label: 'Privacy Policy',          href: '/privacy-policy'           },
    { label: 'Terms of Service',        href: '/terms-of-service'         },
    { label: 'Cookie Policy',           href: '/cookie-policy'            },
    { label: 'Refund & Cancellation',   href: '/refund-policy'            },
    { label: 'Acceptable Use Policy',   href: '/acceptable-use-policy'    },
    { label: 'Data Security',           href: '/data-security'            },
  ]

  return (
    <footer style={{
      background: '#0F0E2C',
      padding: '56px 20px 28px',
      color: 'rgba(255,255,255,0.7)',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'minmax(220px, 1.3fr) repeat(2, minmax(140px, 1fr))',
        gap: 32,
      }} className="site-footer-grid">

        {/* Brand column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Logo size={28} showText={false} />
            <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
              MinistryOS
            </span>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', maxWidth: 280 }}>
            The complete operating system for your church — members, attendance,
            giving, communication, and insight, all in one place.
          </p>
        </div>

        {/* Product column */}
        <div>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)', marginBottom: 14,
          }}>
            Product
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {productLinks.map(l => (
              <a key={l.label} href={l.href} style={footerLinkStyle}>{l.label}</a>
            ))}
            <a href="/login" style={footerLinkStyle}>Sign in</a>
            <a href="/register" style={footerLinkStyle}>Register your church</a>
          </div>
        </div>

        {/* Legal column */}
        <div>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)', marginBottom: 14,
          }}>
            Legal
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {legalLinks.map(l => (
              <a key={l.label} href={l.href} style={footerLinkStyle}>{l.label}</a>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: 1100, margin: '40px auto 0', paddingTop: 20,
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', flexWrap: 'wrap', gap: 12,
        alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          © {year} EM Control IT Solutions · MinistryOS · All rights reserved.
        </span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          Made for churches everywhere 🌍
        </span>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .site-footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .site-footer-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
        }
      `}</style>
    </footer>
  )
}

const footerLinkStyle = {
  fontSize: 13.5,
  color: 'rgba(255,255,255,0.62)',
  textDecoration: 'none',
  transition: 'color 0.15s',
}