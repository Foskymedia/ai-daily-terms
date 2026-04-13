'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Layers, Brain, Lock } from 'lucide-react'
import { useState } from 'react'
import UpgradeModal from './UpgradeModal'

const tabs = [
  { label: 'Today',      href: '/dashboard',            icon: Home,     pro: false },
  { label: 'Glossary',   href: '/dashboard/glossary',   icon: BookOpen, pro: true  },
  { label: 'Flashcards', href: '/dashboard/flashcards', icon: Layers,   pro: true  },
  { label: 'Quiz',       href: '/dashboard/quiz',       icon: Brain,    pro: true  },
]

export default function BottomNav({ isPro }: { isPro: boolean }) {
  const pathname = usePathname()
  const [lockedFeature, setLockedFeature] = useState<string | null>(null)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-white/[0.08] md:hidden safe-area-bottom">
        <div className="grid grid-cols-4">
          {tabs.map(({ label, href, icon: Icon, pro }) => {
            const isActive = pathname === href
            const locked = pro && !isPro

            if (locked) {
              return (
                <button
                  key={href}
                  onClick={() => setLockedFeature(label)}
                  className="flex flex-col items-center justify-center py-2.5 gap-1 relative text-gray-400 dark:text-slate-600 active:bg-gray-50 dark:active:bg-slate-800 transition-colors"
                >
                  <div className="relative">
                    <Icon size={22} strokeWidth={1.8} />
                    <Lock size={10} strokeWidth={2.5} className="absolute -top-1 -right-1.5 text-gray-400 dark:text-slate-500" />
                  </div>
                  <span className="text-xs font-medium">{label}</span>
                </button>
              )
            }

            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center py-2.5 gap-1 relative transition-colors active:bg-gray-50 dark:active:bg-slate-800 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-slate-400'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {lockedFeature && (
        <UpgradeModal feature={lockedFeature} onClose={() => setLockedFeature(null)} />
      )}
    </>
  )
}
