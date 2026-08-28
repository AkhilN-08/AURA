import { useEffect, useRef } from 'react'
import { useGenderTheme } from '../../hooks/useGenderTheme'

/**
 * Sets CSS custom properties for the gender theme.
 * Also injects a dynamic style tag that overrides key hardcoded colors.
 */
export default function GenderThemeApplier() {
  const { theme } = useGenderTheme()
  const styleRef = useRef<HTMLStyleElement | null>(null)

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--gender-primary', theme.primary)
    root.style.setProperty('--gender-primary-light', theme.primaryLight)
    root.style.setProperty('--gender-primary-dark', theme.primaryDark)
    root.style.setProperty('--gender-accent', theme.accent)
    root.style.setProperty('--gender-glow', theme.glow)
    root.style.setProperty('--gender-rgb', theme.primaryRgb)

    // Create the dynamic style tag if it doesn't exist
    if (!styleRef.current) {
      styleRef.current = document.createElement('style')
      styleRef.current.id = 'gender-theme-dynamic'
      document.head.appendChild(styleRef.current)
    }

    // Build override rules targeting Tailwind's generated class names
    // Tailwind compiles bg-sage-500 into something like .bg-sage-500
    // But opacity modifiers like bg-sage-500/90 get compiled differently
    styleRef.current.textContent = `
      /* === Gender Theme Overrides === */
      
      /* Primary background colors */
      [class*="bg-sage-500"] { background-color: ${theme.primary} !important; }
      [class*="bg-sage-600"] { background-color: ${theme.primaryDark} !important; }
      [class*="bg-sage-400"] { background-color: ${theme.accent} !important; }
      
      /* Text colors */
      [class*="text-sage-500"] { color: ${theme.primary} !important; }
      [class*="text-sage-600"] { color: ${theme.primaryDark} !important; }
      [class*="text-sage-400"] { color: ${theme.accent} !important; }
      [class*="text-sage-700"] { color: ${theme.primaryDark} !important; }
      
      /* Border colors */
      [class*="border-sage-500"] { border-color: ${theme.primary} !important; }
      [class*="border-sage-400"] { border-color: ${theme.accent} !important; }
      
      /* Focus ring */
      [class*="ring-sage"] { --tw-ring-color: ${theme.accent} !important; }

      /* Gradient buttons */
      [class*="from-sage-400"][class*="to-sage-600"] {
        background: linear-gradient(to right, ${theme.accent}, ${theme.primaryDark}) !important;
        -webkit-background-clip: unset !important;
        background-clip: unset !important;
        -webkit-text-fill-color: unset !important;
      }
      [class*="from-sage-400"][class*="to-sage-500"] {
        background: linear-gradient(to right, ${theme.accent}, ${theme.primary}) !important;
        -webkit-background-clip: unset !important;
        background-clip: unset !important;
        -webkit-text-fill-color: unset !important;
      }

      /* Dark mode overrides */
      html.dark [class*="bg-sage-500"] { background-color: ${theme.primary} !important; }
      html.dark [class*="text-sage-500"] { color: ${theme.primary} !important; }
    `

    return () => {
      if (styleRef.current) {
        styleRef.current.remove()
        styleRef.current = null
      }
    }
  }, [theme])

  return null
}
