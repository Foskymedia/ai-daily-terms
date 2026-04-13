'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { useEffect } from 'react'

function MobileDefaultTheme() {
  useEffect(() => {
    // If user has never set a theme, default to dark on mobile
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('ai-theme')
    if (stored) return // user already has a preference
    const isMobile = window.innerWidth < 768
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (isMobile && !prefersDark) {
      // Force dark on mobile when system has no preference
      document.documentElement.classList.add('dark')
      localStorage.setItem('ai-theme', 'dark')
    }
  }, [])
  return null
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="ai-theme"
      disableTransitionOnChange={false}
    >
      <MobileDefaultTheme />
      {children}
    </NextThemesProvider>
  )
}
