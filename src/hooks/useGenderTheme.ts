import { useEffect } from 'react'
import { useAuth, type Gender } from './useAuth'

interface ThemeColors {
  primary: string
  primaryRgb: string
  primaryLight: string
  primaryDark: string
  accent: string
  accentRgb: string
  glow: string
  gradient: string
  gradientHover: string
  shadow: string
  badge: string
  badgeText: string
  ring: string
  liquidFrom: string
  liquidTo: string
}

const THEMES: Record<string, ThemeColors> = {
  male: {
    primary: '#3B82F6',
    primaryRgb: '59,130,246',
    primaryLight: '#93C5FD',
    primaryDark: '#2563EB',
    accent: '#0EA5E9',
    accentRgb: '14,165,233',
    glow: 'rgba(59,130,246,0.25)',
    gradient: 'from-[#3B82F6] to-[#2563EB]',
    gradientHover: 'hover:from-[#2563EB] hover:to-[#1D4ED8]',
    shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.25)]',
    badge: 'bg-blue-100 text-blue-600',
    badgeText: 'text-blue-600',
    ring: 'ring-blue-400',
    liquidFrom: 'rgba(59,130,246,0.6)',
    liquidTo: 'rgba(147,197,253,0.6)',
  },
  female: {
    primary: '#EC4899',
    primaryRgb: '236,72,153',
    primaryLight: '#F9A8D4',
    primaryDark: '#DB2777',
    accent: '#F472B6',
    accentRgb: '244,114,182',
    glow: 'rgba(236,72,153,0.25)',
    gradient: 'from-[#EC4899] to-[#DB2777]',
    gradientHover: 'hover:from-[#DB2777] hover:to-[#BE185D]',
    shadow: 'shadow-[0_0_20px_rgba(236,72,153,0.25)]',
    badge: 'bg-pink-100 text-pink-600',
    badgeText: 'text-pink-600',
    ring: 'ring-pink-400',
    liquidFrom: 'rgba(236,72,153,0.6)',
    liquidTo: 'rgba(249,168,212,0.6)',
  },
  neutral: {
    primary: '#8B5CF6',
    primaryRgb: '139,92,246',
    primaryLight: '#C4B5FD',
    primaryDark: '#7C3AED',
    accent: '#A78BFA',
    accentRgb: '167,139,250',
    glow: 'rgba(139,92,246,0.25)',
    gradient: 'from-[#8B5CF6] to-[#7C3AED]',
    gradientHover: 'hover:from-[#7C3AED] hover:to-[#6D28D9]',
    shadow: 'shadow-[0_0_20px_rgba(139,92,246,0.25)]',
    badge: 'bg-purple-100 text-purple-600',
    badgeText: 'text-purple-600',
    ring: 'ring-purple-400',
    liquidFrom: 'rgba(139,92,246,0.6)',
    liquidTo: 'rgba(196,181,253,0.6)',
  },
}

export function useGenderTheme() {
  const { user } = useAuth()
  const gender = user?.gender || null
  const theme = THEMES[gender === 'male' ? 'male' : gender === 'female' ? 'female' : 'neutral']

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--theme-primary', theme.primary)
    root.style.setProperty('--theme-primary-rgb', theme.primaryRgb)
    root.style.setProperty('--theme-primary-light', theme.primaryLight)
    root.style.setProperty('--theme-primary-dark', theme.primaryDark)
    root.style.setProperty('--theme-accent', theme.accent)
    root.style.setProperty('--theme-accent-rgb', theme.accentRgb)
    root.style.setProperty('--theme-glow', theme.glow)
    root.style.setProperty('--theme-gradient', theme.gradient)
    root.style.setProperty('--theme-gradient-hover', theme.gradientHover)
    root.style.setProperty('--theme-shadow', theme.shadow)
    root.style.setProperty('--theme-badge', theme.badge)
    root.style.setProperty('--theme-badge-text', theme.badgeText)
    root.style.setProperty('--theme-ring', theme.ring)
    root.style.setProperty('--theme-liquid-from', theme.liquidFrom)
    root.style.setProperty('--theme-liquid-to', theme.liquidTo)

    // Update body scrollbar
    document.documentElement.style.setProperty('--scrollbar-color', theme.primaryLight)
  }, [theme])

  return { gender, theme, THEMES }
}
