'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Term } from '@/types'

type QuizTerm = Term & {
  quiz_question: string
  correct_answer: string
}

type AnswerState = {
  selected: string
  correct: string
  isCorrect: boolean
}

export default function QuizPage() {
  const [terms, setTerms] = useState<QuizTerm[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answerState, setAnswerState] = useState<AnswerState | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [incorrectCount, setIncorrectCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isPro, setIsPro] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [quizDone, setQuizDone] = useState(false)

  const load = useCallback(async () => {
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
        .not('quiz_question', 'is', null)

      if (data) {
        const shuffled = [...data].sort(() => Math.random() - 0.5)
        setTerms(shuffled as QuizTerm[])
      }
    }

    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function restart() {
    setTerms(prev => [...prev].sort(() => Math.random() - 0.5))
    setCurrentIndex(0)
    setAnswerState(null)
    setCorrectCount(0)
    setIncorrectCount(0)
    setQuizDone(false)
  }

  async function handleAnswer(selectedKey: string) {
    if (answerState) return

    const current = terms[currentIndex]
    const correctKey = (current.correct_answer ?? '').toUpperCase()
    const isCorrect = selectedKey.toUpperCase() === correctKey

    setAnswerState({ selected: selectedKey, correct: correctKey, isCorrect })

    if (isCorrect) {
      setCorrectCount(c => c + 1)
    } else {
      setIncorrectCount(c => c + 1)
    }

    if (userId) {
      const supabase = createClient()
      await supabase
        .from('user_progress')
        .upsert(
          {
            user_id: userId,
            term_id: current.id,
            vertical_id: 'general',
            status: isCorrect ? 'mastered' : 'seen',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,term_id' }
        )
    }
  }

  function nextQuestion() {
    if (currentIndex + 1 >= terms.length) {
      setQuizDone(true)
    } else {
      setCurrentIndex(i => i + 1)
      setAnswerState(null)
    }
  }

  // ── Loading ──────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 text-gray-400">
        Loading quiz...
      </div>
    )
  }

  // ── Gate: free users ────────────────────────────────────

  if (!isPro) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Quiz Mode is a Pro feature</h1>
        <p className="text-gray-500 mb-8">
          Upgrade to Pro to test your knowledge and track mastery across all AI terms.
        </p>
        <Link
          href="/pricing"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
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

  // ── Results screen ───────────────────────────────────────

  if (quizDone) {
    const total = correctCount + incorrectCount
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0

    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
        <p className="text-gray-500 mb-8">You answered all {total} questions.</p>

        <div className="bg-white rounded-2xl border border-gray-100 p-10 shadow-sm mb-8">
          <div className="text-6xl font-bold text-blue-600 mb-1">{pct}%</div>
          <p className="text-gray-400 mb-8">Final score</p>
          <div className="flex justify-center gap-16">
            <div>
              <div className="text-4xl font-bold text-green-600">{correctCount}</div>
              <div className="text-sm text-gray-400 mt-1">Correct</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-500">{incorrectCount}</div>
              <div className="text-sm text-gray-400 mt-1">Incorrect</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={restart}
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Retake Quiz
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // ── Quiz question ────────────────────────────────────────

  const current = terms[currentIndex]
  const answered = answerState !== null
  const total = terms.length
  const progress = Math.round(((currentIndex + 1) / total) * 100)

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
        ].filter(o => o.text)

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Quiz</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{currentIndex + 1} / {total}</span>
          <span className="text-sm font-semibold text-green-600">{correctCount} ✓</span>
          {incorrectCount > 0 && (
            <span className="text-sm font-semibold text-red-500">{incorrectCount} ✗</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-8">
        <div
          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm mb-6">
        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-2">
          {current.term}
        </p>
        <h2 className="text-xl font-bold text-gray-900 mb-8 leading-snug">
          {current.quiz_question}
        </h2>

        <div className="space-y-3">
          {options.map((opt) => {
            const isCorrectOpt = opt.key === answerState?.correct
            const isWrongSelected =
              opt.key === answerState?.selected && !answerState?.isCorrect

            let cls =
              'w-full text-left px-5 py-4 rounded-xl border-2 font-medium text-sm transition-all min-h-[52px] '

            if (!answered) {
              cls += 'border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
            } else if (isCorrectOpt) {
              cls += 'border-green-500 bg-green-50 text-green-800'
            } else if (isWrongSelected) {
              cls += 'border-red-400 bg-red-50 text-red-700'
            } else {
              cls += 'border-gray-100 text-gray-400 cursor-default'
            }

            return (
              <button
                key={opt.key}
                onClick={() => handleAnswer(opt.key)}
                disabled={answered}
                className={cls}
              >
                <span className="inline-block w-6 font-bold text-gray-400 mr-2">
                  {opt.key}.
                </span>
                {opt.text}
              </button>
            )
          })}
        </div>
      </div>

      {/* Explanation + Next */}
      {answered && (
        <div className="space-y-4">
          <div
            className={`rounded-xl p-5 border-l-4 ${
              answerState!.isCorrect
                ? 'bg-green-50 border-green-500'
                : 'bg-red-50 border-red-400'
            }`}
          >
            <p className="text-sm font-semibold text-gray-900 mb-1">
              {answerState!.isCorrect ? '✓ Correct!' : '✗ Not quite'}
            </p>
            {current.quiz_explanation && (
              <p className="text-sm text-gray-700">{current.quiz_explanation}</p>
            )}
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
