'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Term } from '@/types'

interface OnboardingFlowProps {
  userId: string
  onboardingCompleted: boolean
}

export default function OnboardingFlow({ userId, onboardingCompleted }: OnboardingFlowProps) {
  const [step, setStep] = useState(1)
  const [visible, setVisible] = useState(!onboardingCompleted)
  const [term, setTerm] = useState<Term | null>(null)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!visible) return
    fetch('/api/daily-term')
      .then((r) => r.json())
      .then(({ term }) => setTerm(term as Term))
      .catch(() => {})
  }, [visible])

  async function markComplete() {
    await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', userId)
    setVisible(false)
  }

  async function handleSaveTerm() {
    if (!term) return
    await supabase.from('user_progress').upsert({
      user_id: userId,
      term_id: term.id,
      vertical_id: term.vertical_id,
      status: 'saved',
      updated_at: new Date().toISOString(),
    })
    setSaved(true)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-8 relative border border-gray-100 dark:border-white/[0.08]">
        <button
          onClick={markComplete}
          className="absolute top-4 right-4 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
          aria-label="Dismiss onboarding"
        >
          <X size={20} />
        </button>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Step 1 — Welcome */}
        {step === 1 && (
          <>
            <div className="text-4xl mb-4">👋</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-3">
              Welcome to AI Daily Terms!
            </h2>
            <p className="text-gray-500 dark:text-slate-400 mb-6">
              Every day, you&apos;ll get one plain-English AI term — with a real definition,
              real examples, and zero jargon. Here&apos;s how it works:
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'One new AI term published every day',
                'Read the full definition and example',
                'Save terms you want to remember',
                'Upgrade to Pro for quizzes and flashcards',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-600 dark:text-slate-300">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setStep(2)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Show me today&apos;s term
            </button>
          </>
        )}

        {/* Step 2 — Today's term */}
        {step === 2 && (
          <>
            <div className="text-4xl mb-4">📅</div>
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-3">
              Today&apos;s Term
            </p>
            {term ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-3">{term.term}</h2>
                <p className="text-gray-600 dark:text-slate-300 leading-relaxed mb-8">
                  {term.plain_explanation ?? term.definition}
                </p>
              </>
            ) : (
              <div className="space-y-3 mb-8">
                <div className="h-8 bg-gray-100 dark:bg-slate-700 animate-pulse rounded-lg w-2/3" />
                <div className="h-4 bg-gray-100 dark:bg-slate-700 animate-pulse rounded-lg" />
                <div className="h-4 bg-gray-100 dark:bg-slate-700 animate-pulse rounded-lg w-5/6" />
                <div className="h-4 bg-gray-100 dark:bg-slate-700 animate-pulse rounded-lg w-4/6" />
              </div>
            )}
            <button
              onClick={() => setStep(3)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Next: Save it
            </button>
          </>
        )}

        {/* Step 3 — Save it */}
        {step === 3 && (
          <>
            <div className="text-4xl mb-4">🔖</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-3">
              Save terms you want to remember
            </h2>
            <p className="text-gray-500 dark:text-slate-400 mb-8">
              Bookmark{term ? ` "${term.term}"` : ' today\'s term'} to your saved list.
              Pro members can review all saved terms in the glossary.
            </p>
            {!saved ? (
              <button
                onClick={handleSaveTerm}
                disabled={!term}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 mb-3"
              >
                Save This Term
              </button>
            ) : (
              <div className="w-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 py-3 rounded-xl font-semibold text-center mb-3">
                Saved! ✓
              </div>
            )}
            <button
              onClick={() => setStep(4)}
              className="w-full text-gray-400 dark:text-slate-500 py-2 text-sm hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
            >
              {saved ? 'Next →' : 'Skip for now'}
            </button>
          </>
        )}

        {/* Step 4 — Go Pro */}
        {step === 4 && (
          <>
            <div className="text-4xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-3">Go further with Pro</h2>
            <p className="text-gray-500 dark:text-slate-400 mb-6">
              You&apos;re all set with the free plan. Ready to level up?
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Full glossary — browse all 365 terms',
                'Flashcards — practice with spaced repetition',
                'Quiz Mode — test and track your mastery',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-600 dark:text-slate-300">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-center text-sm font-bold text-gray-900 dark:text-slate-100 mb-4">
              $4.99/month · Cancel anytime
            </p>
            <Link
              href="/pricing"
              onClick={markComplete}
              className="w-full block bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center"
            >
              Upgrade to Pro
            </Link>
            <button
              onClick={markComplete}
              className="w-full text-gray-400 dark:text-slate-500 py-2 text-sm hover:text-gray-600 dark:hover:text-slate-300 transition-colors mt-3"
            >
              Maybe later — I&apos;ll stick with free
            </button>
          </>
        )}
      </div>
    </div>
  )
}
