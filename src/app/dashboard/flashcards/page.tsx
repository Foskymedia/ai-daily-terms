'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Term } from '@/types'

export default function FlashcardsPage() {
  const [allTerms, setAllTerms] = useState<Term[]>([])
  const [terms, setTerms] = useState<Term[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isPro, setIsPro] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [sessionDone, setSessionDone] = useState(false)
  const [gotItCount, setGotItCount] = useState(0)
  const [reviewAgainCount, setReviewAgainCount] = useState(0)
  const [reviewAgainIds, setReviewAgainIds] = useState<Set<string>>(new Set())
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const dailyProgressCalled = useRef(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', user.id)
        .single()

      const userIsPro = profile?.tier === 'pro' || profile?.tier === 'lifetime'
      setIsPro(userIsPro)

      if (userIsPro) {
        const { data } = await supabase
          .from('terms')
          .select('*')
          .eq('vertical_id', 'general')
          .eq('published', true)
          .order('publish_date', { ascending: false })

        if (data) {
          const shuffled = [...data].sort(() => Math.random() - 0.5)
          setAllTerms(shuffled)
          setTerms(shuffled)
        }
      }

      setLoading(false)
    }
    load()
  }, [])

  const markTerm = useCallback(
    async (gotIt: boolean) => {
      const current = terms[currentIndex]
      if (!current) return

      // Mark flashcard_done on first interaction of the session
      if (!dailyProgressCalled.current) {
        dailyProgressCalled.current = true
        fetch('/api/daily-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'flashcard_done' }),
        }).catch(() => {})
      }

      if (userId) {
        const supabase = createClient()
        const nextReview = new Date()
        nextReview.setDate(nextReview.getDate() + (gotIt ? 7 : 1))

        await supabase.from('user_progress').upsert(
          {
            user_id: userId,
            term_id: current.id,
            vertical_id: 'general',
            status: gotIt ? 'mastered' : 'seen',
            next_review_date: nextReview.toISOString().split('T')[0],
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,term_id' }
        )
      }

      if (gotIt) {
        setGotItCount((c) => c + 1)
      } else {
        setReviewAgainCount((c) => c + 1)
        setReviewAgainIds((prev) => { const next = new Set(Array.from(prev)); next.add(current.id); return next })
      }

      setFlipped(false)
      setTimeout(() => {
        if (currentIndex + 1 >= terms.length) {
          setSessionDone(true)
        } else {
          setCurrentIndex((i) => i + 1)
        }
      }, 150)
    },
    [terms, currentIndex, userId]
  )

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (sessionDone || loading || !isPro) return
      if (e.key === ' ') {
        e.preventDefault()
        setFlipped((f) => !f)
      } else if (e.key === 'ArrowRight' && flipped) {
        e.preventDefault()
        markTerm(true)
      } else if (e.key === 'ArrowLeft' && flipped) {
        e.preventDefault()
        markTerm(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [flipped, sessionDone, loading, isPro, markTerm])

  function startReviewSession() {
    const reviewTerms = allTerms.filter((t) => reviewAgainIds.has(t.id))
    const shuffled = [...reviewTerms].sort(() => Math.random() - 0.5)
    setTerms(shuffled)
    setCurrentIndex(0)
    setFlipped(false)
    setGotItCount(0)
    setReviewAgainCount(0)
    setReviewAgainIds(new Set())
    setSessionDone(false)
  }

  function restartAll() {
    const shuffled = [...allTerms].sort(() => Math.random() - 0.5)
    setTerms(shuffled)
    setCurrentIndex(0)
    setFlipped(false)
    setGotItCount(0)
    setReviewAgainCount(0)
    setReviewAgainIds(new Set())
    setSessionDone(false)
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (!touchStart.current || sessionDone) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    touchStart.current = null
    if (Math.abs(dy) > Math.abs(dx) || Math.abs(dx) < 40) return
    if (!flipped) {
      setFlipped(true)
    } else {
      markTerm(dx > 0)
    }
  }

  // ── Loading ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="h-8 w-36 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-8" />
        <div className="w-full rounded-2xl bg-gray-200 animate-pulse" style={{ minHeight: '280px' }} />
      </div>
    )
  }

  // ── Gate ────────────────────────────────────────────────────────
  if (!isPro) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Flashcards is a Pro feature</h1>
        <p className="text-gray-600 mb-8">
          Upgrade to Pro to practice with flashcards and reinforce your AI vocabulary.
        </p>
        <Link href="/pricing" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          Upgrade to Pro
        </Link>
      </div>
    )
  }

  if (terms.length === 0) {
    return <div className="text-center text-gray-400 py-16">No terms available yet.</div>
  }

  // ── Session complete screen ──────────────────────────────────────
  if (sessionDone) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-8">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Session Complete!</h1>
          <p className="text-gray-600 mb-8">You reviewed {terms.length} cards.</p>

          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm mb-8">
            <div className="flex justify-center gap-16">
              <div>
                <div className="text-4xl font-bold text-green-600">{gotItCount}</div>
                <div className="text-sm text-gray-600 mt-1">Got it ✓</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-amber-500">{reviewAgainCount}</div>
                <div className="text-sm text-gray-600 mt-1">Review again ↺</div>
              </div>
            </div>
          </div>

          {/* Quiz nudge */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6 text-center">
            <p className="text-sm font-semibold text-blue-900 mb-1">Ready to test yourself?</p>
            <p className="text-sm text-blue-700 mb-3">Take the quiz to lock in what you just practiced.</p>
            <Link
              href="/dashboard/quiz"
              className="inline-block text-sm bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Take Quiz →
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {reviewAgainCount > 0 && (
              <button
                onClick={startReviewSession}
                className="px-6 py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors"
              >
                Start Review Session ({reviewAgainCount} cards)
              </button>
            )}
            <button
              onClick={restartAll}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              Restart All Cards
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Active flashcard ─────────────────────────────────────────────
  const current = terms[currentIndex]
  const progress = Math.round(((currentIndex + 1) / terms.length) * 100)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Flashcards</h1>
        <span className="text-sm text-gray-500">{currentIndex + 1} of {terms.length}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
        <div
          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Session score */}
      <div className="flex items-center gap-4 mb-5 text-sm">
        <span className="text-green-600 font-medium">{gotItCount} got it ✓</span>
        <span className="text-amber-500 font-medium">{reviewAgainCount} to review ↺</span>
      </div>

      {/* Swipe hint */}
      <p className="text-xs text-center text-gray-400 mb-4 md:hidden">
        Tap to flip · Swipe left = Got it · Swipe right = Review again
      </p>
      <p className="text-xs text-center text-gray-400 mb-4 hidden md:block">
        Space = flip · → = Got it · ← = Review again
      </p>

      {/* Card */}
      <div
        className="cursor-pointer select-none touch-pan-y"
        onClick={() => !flipped && setFlipped(true)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ perspective: '1000px' }}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '280px',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-4">Term</p>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">{current.term}</h2>
            {current.category && (
              <span className="mt-4 text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">
                {current.category}
              </span>
            )}
            <p className="text-sm text-gray-500 mt-6">Tap to reveal definition</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-blue-600 rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center text-center overflow-y-auto"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <p className="text-xs text-blue-200 uppercase tracking-wide font-medium mb-4">Definition</p>
            <p className="text-white text-base leading-relaxed">{current.plain_explanation ?? current.definition}</p>
            {current.example_sentence && (
              <p className="text-blue-200 text-sm italic mt-4 border-t border-blue-500 pt-4">
                &ldquo;{current.example_sentence}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons — shown after flip */}
      {flipped ? (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => markTerm(false)}
            className="flex-1 max-w-[180px] py-3.5 rounded-xl bg-amber-100 text-amber-700 font-semibold hover:bg-amber-200 transition-colors text-sm flex items-center justify-center gap-2"
          >
            ↺ Review Again
          </button>
          <button
            onClick={() => markTerm(true)}
            className="flex-1 max-w-[180px] py-3.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2"
          >
            Got it ✓
          </button>
        </div>
      ) : (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setFlipped(true)}
            className="px-8 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Reveal Definition
          </button>
        </div>
      )}
    </div>
  )
}
