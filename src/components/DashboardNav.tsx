'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import UpgradeModal from './UpgradeModal'
import ThemeToggle from './ThemeToggle'

interface DashboardNavProps {
  isPro: boolean
}

const navLinks = [
  { label: 'Today', href: '/dashboard', pro: false },
  { label: 'Glossary', href: '/dashboard/glossary', pro: true },
  { label: 'Flashcards', href: '/dashboard/flashcards', pro: true },
  { label: 'Quiz', href: '/dashboard/quiz', pro: true },
  { label: 'Progress', href: '/dashboard/progress', pro: false },
]

export default function DashboardNav({ isPro }: DashboardNavProps) {
  const router = useRouter()
  const [lockedFeature, setLockedFeature] = useState<string | null>(null)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  function handleProLink(e: React.MouseEvent, feature: string) {
    if (!isPro) {
      e.preventDefault()
      setLockedFeature(feature)
    }
  }

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:block bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-white/[0.08]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-gray-900 dark:text-slate-100">
            AI Daily Terms
          </Link>
          <div className="flex items-center gap-1">
            {navLinks.map(({ label, href, pro }) => (
              <Link
                key={href}
                href={href}
                onClick={pro ? (e) => handleProLink(e, label) : undefined}
                className={`text-sm px-3 py-2 rounded-lg transition-colors ${
                  !pro || isPro
                    ? 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                    : 'text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                {label}
                {pro && !isPro && (
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded ml-1">
                    Pro
                  </span>
                )}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {!isPro && (
              <Link
                href="/pricing"
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upgrade to Pro
              </Link>
            )}
            {isPro && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold px-2 py-1 rounded-full">
                PRO
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile header */}
      <nav className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-white/[0.08] px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="text-lg font-bold text-gray-900 dark:text-slate-100">
          AI Daily Terms
        </Link>
        <div className="flex items-center gap-2">
          {isPro && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold px-2 py-1 rounded-full">
              PRO
            </span>
          )}
          {!isPro && (
            <Link
              href="/pricing"
              className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold"
            >
              Upgrade
            </Link>
          )}
          <ThemeToggle />
          <button onClick={handleSignOut} className="text-sm text-gray-500 dark:text-slate-400">
            Sign out
          </button>
        </div>
      </nav>

      {lockedFeature && (
        <UpgradeModal feature={lockedFeature} onClose={() => setLockedFeature(null)} />
      )}
    </>
  )
}
