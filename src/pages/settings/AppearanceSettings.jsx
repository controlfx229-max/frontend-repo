import { useTheme, ACCENT_PRESETS, FONT_SIZE_OPTIONS } from '../../context/ThemeContext'
import { Sun, Moon, Monitor, Check } from 'lucide-react'

export default function AppearanceSettings() {
  const { theme, accent, fontSize, updateTheme, updateAccent, updateFontSize } = useTheme()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>

      {/* ── Theme Mode ── */}
      <div>
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
          Theme Mode
        </p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
          Choose how MinistryOS looks on your device.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)', maxWidth: 480 }}>
          {[
            {
              id: 'light', label: 'Light', icon: Sun,
              preview: { bg: '#F8FAFC', surface: '#FFFFFF', text: '#0F172A', border: '#E2E8F0' }
            },
            {
              id: 'dark', label: 'Dark', icon: Moon,
              preview: { bg: '#0F172A', surface: '#1E293B', text: '#F1F5F9', border: '#334155' }
            },
          ].map(({ id, label, icon: Icon, preview }) => (
            <button key={id} onClick={() => updateTheme(id)}
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                border: `2px solid ${theme === id ? accent : 'var(--border)'}`,
                background: 'var(--surface)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                textAlign: 'left',
                position: 'relative'
              }}>

              {/* Mini preview */}
              <div style={{
                height: 80, borderRadius: 'var(--radius-md)',
                background: preview.bg, border: `1px solid ${preview.border}`,
                marginBottom: 'var(--space-3)', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', padding: 8, gap: 6
              }}>
                {/* Fake navbar */}
                <div style={{ height: 10, background: preview.surface, borderRadius: 4, border: `1px solid ${preview.border}` }} />
                {/* Fake content */}
                <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                  <div style={{ width: 24, background: preview.surface, borderRadius: 4, border: `1px solid ${preview.border}` }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ height: 8, background: preview.surface, borderRadius: 3, width: '70%', border: `1px solid ${preview.border}` }} />
                    <div style={{ height: 8, background: preview.surface, borderRadius: 3, width: '50%', border: `1px solid ${preview.border}` }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Icon size={14} color={theme === id ? accent : 'var(--text-muted)'} />
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: theme === id ? accent : 'var(--text-secondary)' }}>
                    {label}
                  </span>
                </div>
                {theme === id && (
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={11} color="white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Accent Color ── */}
      <div>
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
          Accent Color
        </p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
          Your brand color — applied across buttons, links and highlights.
        </p>

        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {ACCENT_PRESETS.map(preset => (
            <button key={preset.value} onClick={() => updateAccent(preset.value)}
              title={preset.name}
              style={{
                width: 40, height: 40,
                borderRadius: '50%',
                background: preset.value,
                border: `3px solid ${accent === preset.value ? 'var(--text-primary)' : 'transparent'}`,
                outline: accent === preset.value ? `2px solid ${preset.value}` : 'none',
                outlineOffset: 2,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                transform: accent === preset.value ? 'scale(1.15)' : 'scale(1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
              {accent === preset.value && <Check size={16} color="white" strokeWidth={3} />}
            </button>
          ))}
        </div>

        {/* Color name label */}
        <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          Selected: <strong style={{ color: accent }}>{ACCENT_PRESETS.find(p => p.value === accent)?.name || 'Custom'}</strong>
        </p>
      </div>

      {/* ── Font Size ── */}
      <div>
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
          Text Size
        </p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
          Adjust the size of text across the entire app.
        </p>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          {FONT_SIZE_OPTIONS.map(opt => (
            <button key={opt.id} onClick={() => updateFontSize(opt.id)}
              style={{
                padding: 'var(--space-3) var(--space-5)',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${fontSize === opt.id ? accent : 'var(--border)'}`,
                background: fontSize === opt.id ? (accent + '12') : 'var(--surface)',
                color: fontSize === opt.id ? accent : 'var(--text-secondary)',
                fontWeight: fontSize === opt.id ? 'var(--weight-bold)' : 'var(--weight-medium)',
                fontSize: opt.id === 'compact' ? 13 : opt.id === 'comfortable' ? 15 : 17,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Live Preview ── */}
      <div>
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
          Preview
        </p>
        <div style={{
          padding: 'var(--space-5)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
                Victory Chapel
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Dashboard overview</p>
            </div>
            <button className="btn-primary" style={{ pointerEvents: 'none' }}>
              + Add Member
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
            {[
              { label: 'Total Members', value: '284' },
              { label: 'Active Members', value: '241' },
              { label: 'This Month', value: 'GHS 12,400' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                padding: 'var(--space-4)',
                background: 'var(--surface-2)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)'
              }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-extrabold)', color: 'var(--text-primary)', lineHeight: 1, marginBottom: 4 }}>{value}</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}