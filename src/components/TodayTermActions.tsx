'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import UpgradeModal from './UpgradeModal'

interface TodayTermActionsProps {
  termId: string
  termName: string
  userId: string
  isPro: boolean
  initialSaved: boolean
  isMastered: boolean
}

export default function TodayTermActions({
  termId,
  termName,
  userId,
  isPro,
  initialSaved,
  isMastered,
}: TodayTermActionsProps) {
  const [saved, setSaved] = useState(initialSaved)
  const [savingLoading, setSavingLoading] = useState(false)
  const [lockedFeature, setLockedFeature] = useState<string | null>(null)
  const supabase = createClient()

  async function toggleSave() {
    setSavingLoading(true)
    const newStatus = saved ? 'seen' : 'saved'
    await supabase.from('user_progress').upsert(
      {
        user_id: userId,
        term_id: termId,
        vertical_id: 'general',
        status: newStatus,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,term_id' }
    )
    setSaved(!saved)
    setSavingLoading(false)
  }

  function shareOnTwitter() {
    const text = encodeURIComponent(
      `I just learned about "${termName}" on AI Daily Terms — building my AI vocabulary one term a day! 🧠\nCheck it out: https://aidailyterms.com`
    )
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  function shareOnLinkedIn() {
    const url = encodeURIComponent('https://aidailyterms.com')
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
  }

  return (
    <>
      {/* Completion indicator */}
      <div className="flex items-center gap-4 text-sm flex-wrap">
        <span className="flex items-center gap-1.5 text-green-600 font-medium">
          <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-xs">✓</span>
          Read
        </span>
        <span className={`flex items-center gap-1.5 font-medium ${saved ? 'text-blue-600' : 'text-gray-400'}`}>
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${saved ? 'bg-blue-100' : 'bg-gray-100'}`}>
            {saved ? '✓' : '○'}
          </span>
          Saved
        </span>
        <span className={`flex items-center gap-1.5 font-medium ${isMastered ? 'text-purple-600' : 'text-gray-400'}`}>
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${isMastered ? 'bg-purple-100' : 'bg-gray-100'}`}>
            {isMastered ? '✓' : '○'}
          </span>
          Mastered
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        {isPro ? (
          <Link
            href="/dashboard/quiz"
            className="flex items-center gap-2 text-sm bg-purple-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            🧠 Take Quiz
          </Link>
        ) : (
          <button
            onClick={() => setLockedFeature('Quiz')}
            className="flex items-center gap-2 text-sm bg-gray-100 text-gray-500 px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            🧠 Take Quiz <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">Pro</span>
          </button>
        )}

        {isPro ? (
          <Link
            href="/dashboard/flashcards"
            className="flex items-center gap-2 text-sm bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            🃏 Flashcard Mode
          </Link>
        ) : (
          <button
            onClick={() => setLockedFeature('Flashcards')}
            className="flex items-center gap-2 text-sm bg-gray-100 text-gray-500 px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            🃏 Flashcard Mode <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">Pro</span>
          </button>
        )}

        <button
          onClick={toggleSave}
          disabled={savingLoading}
          className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50 ${
            saved
              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          {saved ? 'Saved' : 'Save Term'}
        </button>
      </div>

      {/* Social sharing */}
      <div className="flex items-center gap-3 pt-1">
        <span className="text-xs text-gray-400">Share:</span>
        <button
          onClick={shareOnTwitter}
          className="text-xs text-gray-500 hover:text-gray-800 font-medium transition-colors flex items-center gap-1"
        >
          𝕏 Twitter
        </button>
        <button
          onClick={shareOnLinkedIn}
          className="text-xs text-gray-500 hover:text-blue-700 font-medium transition-colors flex items-center gap-1"
        >
          in LinkedIn
        </button>
      </div>

      {lockedFeature && (
        <UpgradeModal feature={lockedFeature} onClose={() => setLockedFeature(null)} />
      )}
    </>
  )
}
