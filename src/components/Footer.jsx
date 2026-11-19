import BrandMark from './BrandMark'
import '../styles/brand.css'
import '../styles/footer.css'

/*
 * ── SITE FOOTER ───────────────────────────────
 * Used by the landing page and every legal page (via LegalLayout).
 * Plain <a href> (not <Link>) so it works the same inside or outside
 * the SPA router.
 */
export default function Footer() {
  const year = new Date().getFullYear()

  const productLinks = [
    { label: 'Features', href: '/learn-more#members' },
    { label: 'Pricing',  href: '/learn-more#pricing'  },
    { label: 'Contact',  href: '/contact'             },
    { label: 'Sign in',  href: '/login'               },
    { label: 'Register your church', href: '/register' },
  ]

  const legalLinks = [
    { label: 'Privacy Policy',        href: '/privacy-policy'        },
    { label: 'Terms of Service',      href: '/terms-of-service'      },
    { label: 'Cookie Policy',         href: '/cookie-policy'         },
    { label: 'Refund & Cancellation', href: '/refund-policy'         },
    { label: 'Acceptable Use Policy', href: '/acceptable-use-policy' },
    { label: 'Data Security',         href: '/data-security'         },
  ]

  return (
    <footer className="mx ft">
      <div className="ft-grid">
        <div>
          <a href="/" aria-label="MinistryOS home"><BrandMark tone="light" size={34} /></a>
          <p className="ft-blurb">
            The complete operating system for your church: members, attendance,
            giving, communication, and insight, all in one place.
          </p>
        </div>
        <nav aria-label="Product">
          <h3>Product</h3>
          <ul>{productLinks.map(l => <li key={l.label}><a href={l.href}>{l.label}</a></li>)}</ul>
        </nav>
        <nav aria-label="Legal">
          <h3>Legal</h3>
          <ul>{legalLinks.map(l => <li key={l.label}><a href={l.href}>{l.label}</a></li>)}</ul>
        </nav>
      </div>
      <div className="ft-base">
        <span>© {year} EM Control IT Solutions. MinistryOS. All rights reserved.</span>
        <span>Made for churches everywhere.</span>
      </div>
    </footer>
  )
}
