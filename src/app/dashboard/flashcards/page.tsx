'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Term } from '@/types'

export default function FlashcardsPage() {
  const [terms, setTerms] = useState<Term[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isPro, setIsPro] = useState(false)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

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
          setTerms(shuffled)
        }
      }

      setLoading(false)
    }
    load()
  }, [])

  function next() {
    setFlipped(false)
    setTimeout(() => setCurrentIndex((i) => Math.min(i + 1, terms.length - 1)), 150)
  }

  function prev() {
    setFlipped(false)
    setTimeout(() => setCurrentIndex((i) => Math.max(i - 1, 0)), 150)
  }

  function restart() {
    setFlipped(false)
    setCurrentIndex(0)
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (!touchStart.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    touchStart.current = null

    // Ignore mostly-vertical swipes
    if (Math.abs(dy) > Math.abs(dx)) return
    // Minimum swipe distance
    if (Math.abs(dx) < 40) return

    if (dx < 0) {
      // Swipe left → next card
      if (currentIndex < terms.length - 1) next()
    } else {
      // Swipe right → previous card
      if (currentIndex > 0) prev()
    }
  }

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

  if (!isPro) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Flashcards is a Pro feature</h1>
        <p className="text-gray-500 mb-8">
          Upgrade to Pro to practice with flashcards and reinforce your AI vocabulary.
        </p>
        <Link href="/pricing" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          Upgrade to Pro
        </Link>
      </div>
    )
  }

  if (terms.length === 0) {
    return (
      <div className="text-center text-gray-400 py-16">No terms available yet.</div>
    )
  }

  const current = terms[currentIndex]
  const progress = Math.round(((currentIndex + 1) / terms.length) * 100)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Flashcards</h1>
        <span className="text-sm text-gray-500">{currentIndex + 1} / {terms.length}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
        <div
          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Swipe hint — shown on touch devices */}
      <p className="text-xs text-center text-gray-400 mb-4 md:hidden">
        Tap to flip · Swipe left/right to navigate
      </p>

      {/* Card — tap to flip, swipe to navigate */}
      <div
        className="cursor-pointer select-none touch-pan-y"
        onClick={() => setFlipped(!flipped)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ perspective: '1000px' }}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '300px',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-4">Term</p>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">{current.term}</h2>
            {current.category && (
              <span className="mt-4 text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">
                {current.category}
              </span>
            )}
            <p className="text-sm text-gray-400 mt-6">Tap to reveal definition</p>
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
            <p className="text-white text-lg leading-relaxed">{current.definition}</p>
            {current.example_sentence && (
              <p className="text-blue-200 text-sm italic mt-4 border-t border-blue-500 pt-4">
                &ldquo;{current.example_sentence}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={prev}
          disabled={currentIndex === 0}
          className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[48px]"
        >
          ← Previous
        </button>

        <button
          onClick={restart}
          className="text-sm text-gray-400 hover:text-gray-600 py-3 min-h-[48px]"
        >
          Restart
        </button>

        {currentIndex < terms.length - 1 ? (
          <button
            onClick={next}
            className="px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors min-h-[48px]"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={restart}
            className="px-5 py-3 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors min-h-[48px]"
          >
            Finished! Restart
          </button>
        )}
      </div>
    </div>
  )
}
