'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Term } from '@/types'

type QuizTerm = Term & { quiz_question: string; correct_answer: string }

type AnswerState = {
  selected: string
  correct: string
  isCorrect: boolean
}

type CategoryResult = { correct: number; wrong: number }

function getWeakCategories(results: Record<string, CategoryResult>): string[] {
  return Object.entries(results)
    .filter(([, { correct, wrong }]) => {
      const total = correct + wrong
      return total >= 2 && correct / total < 0.5
    })
    .map(([cat]) => cat)
}

function getDifficultyLabel(masteredCount: number): string {
  if (masteredCount < 10) return 'Beginner'
  if (masteredCount < 25) return 'Beginner + Intermediate'
  return 'All difficulties'
}

function getDifficultyHint(masteredCount: number): string | null {
  if (masteredCount < 10) return `Intermediate unlocks after 10 correct (${masteredCount}/10)`
  if (masteredCount < 25) return `Advanced unlocks after 25 correct (${masteredCount}/25)`
  return null
}

export default function QuizPage() {
  const [allTerms, setAllTerms] = useState<QuizTerm[]>([])
  const [terms, setTerms] = useState<QuizTerm[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answerState, setAnswerState] = useState<AnswerState | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [incorrectCount, setIncorrectCount] = useState(0)
  const [categoryResults, setCategoryResults] = useState<Record<string, CategoryResult>>({})
  const [loading, setLoading] = useState(true)
  const [isPro, setIsPro] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [quizDone, setQuizDone] = useState(false)
  const [masteredCount, setMasteredCount] = useState(0)
  const [xpFlash, setXpFlash] = useState<string | null>(null)
  const dailyProgressCalled = useRef(false)

  const load = useCallback(async (weakFilter?: string[]) => {
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
      // Get mastered count for difficulty unlock
      const { count } = await supabase
        .from('user_progress')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'mastered')

      const mc = count ?? 0
      setMasteredCount(mc)

      let query = supabase
        .from('terms')
        .select('*')
        .eq('vertical_id', 'general')
        .eq('published', true)
        .not('quiz_question', 'is', null)

      // Difficulty gating
      if (mc < 10) {
        query = query.eq('difficulty', 'beginner')
      } else if (mc < 25) {
        query = query.in('difficulty', ['beginner', 'intermediate'])
      }

      // Weak area filter
      if (weakFilter && weakFilter.length > 0) {
        query = query.in('category', weakFilter)
      }

      const { data } = await query
      if (data) {
        const shuffled = [...data].sort(() => Math.random() - 0.5)
        setAllTerms(shuffled as QuizTerm[])
        setTerms(shuffled as QuizTerm[])
      }
    }

    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function restart() {
    setTerms([...allTerms].sort(() => Math.random() - 0.5))
    setCurrentIndex(0)
    setAnswerState(null)
    setConfidence(null)
    setCorrectCount(0)
    setIncorrectCount(0)
    setCategoryResults({})
    setQuizDone(false)
  }

  function reviewWeakAreas() {
    const weak = getWeakCategories(categoryResults)
    const filtered = allTerms.filter((t) => t.category && weak.includes(t.category))
    if (filtered.length === 0) return
    const shuffled = [...filtered].sort(() => Math.random() - 0.5)
    setTerms(shuffled)
    setCurrentIndex(0)
    setAnswerState(null)
    setConfidence(null)
    setCorrectCount(0)
    setIncorrectCount(0)
    setCategoryResults({})
    setQuizDone(false)
  }

  function handleAnswer(selectedKey: string) {
    if (answerState) return
    const current = terms[currentIndex]
    const correctKey = (current.correct_answer ?? '').toUpperCase()
    const isCorrect = selectedKey.toUpperCase() === correctKey

    setAnswerState({ selected: selectedKey, correct: correctKey, isCorrect })
    if (isCorrect) {
      setCorrectCount((c) => c + 1)
    } else {
      setIncorrectCount((c) => c + 1)
    }

    // Track per-category results
    const cat = current.category ?? 'Uncategorized'
    setCategoryResults((prev) => ({
      ...prev,
      [cat]: {
        correct: (prev[cat]?.correct ?? 0) + (isCorrect ? 1 : 0),
        wrong: (prev[cat]?.wrong ?? 0) + (isCorrect ? 0 : 1),
      },
    }))

    // Log quiz attempt
    if (userId) {
      const supabase = createClient()
      supabase.from('quiz_attempts').insert({
        user_id: userId,
        term_id: current.id,
        correct: isCorrect,
        category: current.category ?? null,
      }).then(() => {})
    }

    // Award +10 XP for each correct answer
    if (isCorrect) {
      fetch('/api/award-xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 10 }),
      }).then(() => {})
      setXpFlash('+10 XP')
      setTimeout(() => setXpFlash(null), 1800)
    }

    // Mark quiz_done on first answer of the session
    if (!dailyProgressCalled.current) {
      dailyProgressCalled.current = true
      fetch('/api/daily-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'quiz_done' }),
      }).catch(() => {})
    }
  }

  async function nextQuestion() {
    const current = terms[currentIndex]
    if (userId && answerState) {
      const supabase = createClient()
      await supabase.from('user_progress').upsert(
        {
          user_id: userId,
          term_id: current.id,
          vertical_id: 'general',
          status: answerState.isCorrect ? 'mastered' : 'seen',
          confidence: confidence,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,term_id' }
      )
    }

    setConfidence(null)

    if (currentIndex + 1 >= terms.length) {
      setQuizDone(true)
    } else {
      setCurrentIndex((i) => i + 1)
      setAnswerState(null)
    }
  }

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 text-gray-500">
        Loading quiz...
      </div>
    )
  }

  // ── Gate ─────────────────────────────────────────────────────────
  if (!isPro) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Quiz Mode is a Pro feature</h1>
        <p className="text-gray-600 mb-8">
          Upgrade to Pro to test your knowledge and track mastery across all AI terms.
        </p>
        <Link href="/pricing" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          Upgrade to Pro
        </Link>
      </div>
    )
  }

  if (terms.length === 0) {
    return (
      <div className="text-center text-gray-400 py-16">No quiz questions available yet.</div>
    )
  }

  // ── Results screen ───────────────────────────────────────────────
  if (quizDone) {
    const total = correctCount + incorrectCount
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0
    const weakCategories = getWeakCategories(categoryResults)

    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
        <p className="text-gray-600 mb-6">You answered all {total} questions.</p>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm mb-6">
          <div className="text-6xl font-bold text-blue-600 mb-1">{pct}%</div>
          <p className="text-gray-500 mb-6">Final score</p>
          <div className="flex justify-center gap-16">
            <div>
              <div className="text-4xl font-bold text-green-600">{correctCount}</div>
              <div className="text-sm text-gray-600 mt-1">Correct</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-500">{incorrectCount}</div>
              <div className="text-sm text-gray-600 mt-1">Incorrect</div>
            </div>
          </div>
        </div>

        {/* Weak areas */}
        {weakCategories.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-6 text-left">
            <p className="text-sm font-semibold text-amber-800 mb-3">
              You struggled with:
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {weakCategories.map((cat) => (
                <span
                  key={cat}
                  className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium"
                >
                  {cat}
                </span>
              ))}
            </div>
            <button
              onClick={reviewWeakAreas}
              className="text-sm text-amber-700 font-semibold hover:text-amber-900 transition-colors"
            >
              Review Weak Areas →
            </button>
          </div>
        )}

        {/* Done for today banner — quiz is the final step */}
        <div className="bg-green-50 border border-green-100 rounded-2xl p-5 mb-6">
          <p className="text-sm font-semibold text-green-800 mb-0.5">You&apos;re done for today!</p>
          <p className="text-sm text-green-700">
            Read → Flashcards → Quiz. Come back tomorrow to keep your streak alive.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={restart}
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Retake Quiz
          </button>
          <Link
            href="/dashboard/progress"
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            View Progress →
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // ── Active quiz ──────────────────────────────────────────────────
  const current = terms[currentIndex]
  const answered = answerState !== null
  const total = terms.length
  const progress = Math.round(((currentIndex + 1) / total) * 100)
  const difficultyHint = getDifficultyHint(masteredCount)

  const options =
    current.quiz_type === 'true_false'
      ? [
          { key: 'A', text: 'True' },
          { key: 'B', text: 'False' },
        ]
      : [
          { key: 'A', text: current.option_a ?? '' },
          { key: 'B', text: current.option_b ?? '' },
          { key: 'C', text: current.option_c ?? '' },
          { key: 'D', text: current.option_d ?? '' },
        ].filter((o) => o.text)

  return (
    <div className="max-w-2xl mx-auto">
      {/* XP flash overlay */}
      {xpFlash && (
        <div className="fixed top-4 right-4 z-[70] bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold animate-fade-in">
          <span>⚡</span> {xpFlash}
        </div>
      )}

      {/* Header */}
      <div className="mb-2 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quiz</h1>
          <p className="text-xs text-gray-500 mt-0.5">{getDifficultyLabel(masteredCount)}</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold text-green-600">{correctCount} correct</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-600">{correctCount + incorrectCount} answered</span>
        </div>
      </div>

      {/* Difficulty unlock hint */}
      {difficultyHint && !answered && (
        <p className="text-xs text-blue-600 font-medium mb-2">{difficultyHint}</p>
      )}

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
        <div
          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 text-right mb-6 -mt-4">
        {currentIndex + 1} / {total}
      </p>

      {/* Question card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm mb-6">
        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-2">
          {current.term}
        </p>
        <h2 className="text-[18px] md:text-xl font-bold text-gray-900 mb-8 leading-snug">
          {current.quiz_question}
        </h2>

        <div className="space-y-3">
          {options.map((opt) => {
            const isCorrectOpt = opt.key === answerState?.correct
            const isWrongSelected = opt.key === answerState?.selected && !answerState?.isCorrect

            let cls =
              'w-full text-left px-5 py-4 rounded-xl border-2 font-medium text-base transition-all min-h-[52px] '

            if (!answered) {
              cls += 'border-gray-200 text-gray-800 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
            } else if (isCorrectOpt) {
              cls += 'border-green-500 bg-green-50 text-green-800'
            } else if (isWrongSelected) {
              cls += 'border-red-400 bg-red-50 text-red-700'
            } else {
              cls += 'border-gray-100 text-gray-500 cursor-default'
            }

            return (
              <button
                key={opt.key}
                onClick={() => handleAnswer(opt.key)}
                disabled={answered}
                className={cls}
              >
                <span className="inline-block w-6 font-bold text-gray-500 mr-2">{opt.key}.</span>
                {opt.text}
              </button>
            )
          })}
        </div>
      </div>

      {/* After answer: explanation + confidence + next */}
      {answered && (
        <div className="space-y-4">
          <div
            className={`rounded-xl p-5 border-l-4 ${
              answerState!.isCorrect ? 'bg-green-50 border-green-500' : 'bg-amber-50 border-amber-400'
            }`}
          >
            <p className="text-sm font-semibold text-gray-900 mb-1">
              {answerState!.isCorrect
                ? "✓ Correct! You're getting strong in this topic."
                : "✗ Not quite — let's reinforce this concept."}
            </p>
            {current.quiz_explanation && (
              <p className="text-sm text-gray-700 mt-1">{current.quiz_explanation}</p>
            )}
          </div>

          {/* Confidence rating */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-sm font-medium text-gray-700 mb-3">How confident were you?</p>
            <div className="flex items-center gap-3">
              {[
                { value: 1, label: 'Guessing', color: 'text-red-400 hover:text-red-600' },
                { value: 2, label: 'Unsure', color: 'text-amber-400 hover:text-amber-600' },
                { value: 3, label: 'Confident', color: 'text-green-400 hover:text-green-600' },
              ].map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => setConfidence(value)}
                  className={`flex flex-col items-center gap-1 transition-all ${color} ${
                    confidence === value ? 'scale-110 opacity-100' : 'opacity-60'
                  }`}
                >
                  <span className="text-2xl">{'⭐'.repeat(value)}</span>
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
              {confidence !== null && (
                <button
                  onClick={() => setConfidence(null)}
                  className="text-xs text-gray-400 hover:text-gray-600 ml-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <button
            onClick={nextQuestion}
            className="w-full py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            {currentIndex + 1 < total ? 'Next Question →' : 'See Results'}
          </button>
        </div>
      )}
    </div>
  )
}
