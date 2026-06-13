import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

// ─── ACCENT COLOR PRESETS ─────────────────────
export const ACCENT_PRESETS = [
  { name: 'Indigo',  value: '#4F46E5', light: '#EEF2FF', dark: '#3730A3', hover: '#4338CA' },
  { name: 'Blue',    value: '#2563EB', light: '#DBEAFE', dark: '#1D4ED8', hover: '#1D4ED8' },
  { name: 'Emerald', value: '#059669', light: '#D1FAE5', dark: '#047857', hover: '#047857' },
  { name: 'Purple',  value: '#7C3AED', light: '#EDE9FE', dark: '#6D28D9', hover: '#6D28D9' },
  { name: 'Gold',    value: '#D97706', light: '#FEF3C7', dark: '#B45309', hover: '#B45309' },
  { name: 'Rose',    value: '#E11D48', light: '#FFE4E6', dark: '#BE123C', hover: '#BE123C' },
  { name: 'Teal',    value: '#0F766E', light: '#CCFBF1', dark: '#0D5C56', hover: '#0D5C56' },
  { name: 'Crimson', value: '#DC2626', light: '#FEE2E2', dark: '#B91C1C', hover: '#B91C1C' },
]

export const FONT_SIZE_OPTIONS = [
  { id: 'compact',     label: 'Compact',     size: '14px' },
  { id: 'comfortable', label: 'Comfortable', size: '16px' },
  { id: 'spacious',    label: 'Spacious',    size: '17px' },
]

// ─── APPLY THEME TO DOM ───────────────────────
const applyTheme = (theme, accent, fontSize) => {
  const html = document.documentElement

  // Light / Dark
  html.setAttribute('data-theme', theme)

  // Accent color
  const preset = ACCENT_PRESETS.find(p => p.value === accent) || ACCENT_PRESETS[0]
  html.style.setProperty('--primary',       preset.value)
  html.style.setProperty('--primary-light', preset.light)
  html.style.setProperty('--primary-dark',  preset.dark)
  html.style.setProperty('--primary-hover', preset.hover)
  html.style.setProperty('--focus-ring',    `0 0 0 3px ${preset.value}33`)

  // Font size
  const fs = FONT_SIZE_OPTIONS.find(f => f.id === fontSize) || FONT_SIZE_OPTIONS[1]
  html.style.fontSize = fs.size
}

// ─── PROVIDER ─────────────────────────────────
export function ThemeProvider({ children }) {
  const [theme, setTheme]       = useState(() => localStorage.getItem('mos_theme')    || 'light')
  const [accent, setAccent]     = useState(() => localStorage.getItem('mos_accent')   || '#4F46E5')
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('mos_fontsize') || 'comfortable')

  // Apply on mount + whenever values change
  useEffect(() => {
    applyTheme(theme, accent, fontSize)
  }, [theme, accent, fontSize])

  const updateTheme = (t) => {
    setTheme(t)
    localStorage.setItem('mos_theme', t)
  }

  const updateAccent = (a) => {
    setAccent(a)
    localStorage.setItem('mos_accent', a)
  }

  const updateFontSize = (f) => {
    setFontSize(f)
    localStorage.setItem('mos_fontsize', f)
  }

  return (
    <ThemeContext.Provider value={{
      theme, accent, fontSize,
      updateTheme, updateAccent, updateFontSize
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)