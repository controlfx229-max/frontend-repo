import { Church } from 'lucide-react'

/*
 * MinistryOS mark + wordmark for the public pages (landing, login,
 * register, footer). Same church glyph as the original logo, recoloured
 * to the evergreen and brass palette. Swap in a final logo file later by
 * replacing the <span className="mx-mark"> block.
 */
export default function BrandMark({ size = 36, tone = 'dark', showText = true }) {
  return (
    <span className={`mx-brand mx-brand-${tone}`}>
      <span className="mx-mark" style={{ width: size, height: size, borderRadius: Math.round(size * 0.26) }}>
        <Church size={Math.round(size * 0.58)} strokeWidth={1.7} aria-hidden="true" />
      </span>
      {showText && <span className="mx-wordmark">MinistryOS</span>}
    </span>
  )
}
