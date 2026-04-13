'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import UpgradeModal from './UpgradeModal'

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
      <nav className="hidden md:block bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-gray-900">
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
                    ? 'text-gray-600 hover:bg-gray-50'
                    : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                {label}
                {pro && !isPro && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded ml-1">
                    Pro
                  </span>
                )}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {!isPro && (
              <Link
                href="/pricing"
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upgrade to Pro
              </Link>
            )}
            {isPro && (
              <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded-full">
                PRO
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile header */}
      <nav className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="text-lg font-bold text-gray-900">
          AI Daily Terms
        </Link>
        <div className="flex items-center gap-3">
          {isPro && (
            <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded-full">
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
          <button onClick={handleSignOut} className="text-sm text-gray-500">
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
