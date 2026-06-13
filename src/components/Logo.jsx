import { useState } from 'react'
import { Church } from 'lucide-react'

const LOGO_SRC = '/church-logo.png'

export default function Logo({ title = 'MinistryOS', subtitle, className = '', size = 28, showText = true }) {
  const [hasError, setHasError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const imageSize = showText ? 38 : Math.min(Math.max(size * 2, 56), 120)

  return (
    <div className={`brand-logo ${className}`}>
      {!hasError ? (
        <img
          src={LOGO_SRC}
          alt="Church logo"
          className={`brand-logo-image ${loaded ? 'loaded' : 'loading'}`}
          style={{ width: imageSize, height: imageSize }}
          onLoad={() => setLoaded(true)}
          onError={() => setHasError(true)}
        />
      ) : null}

      {hasError && (
        <div className="brand-logo-fallback" style={{ width: imageSize, height: imageSize }}>
          <Church size={size} color="white" />
        </div>
      )}

      {showText && (
        <div className="brand-logo-text">
          <p className="brand-logo-title">{title}</p>
          {subtitle ? <p className="brand-logo-subtitle">{subtitle}</p> : null}
        </div>
      )}
    </div>
  )
}
