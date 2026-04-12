import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Term, Profile } from '@/types'

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const [profileResult, termResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('terms')
      .select('*')
      .eq('vertical_id', 'general')
      .eq('published', true)
      .eq('publish_date', new Date().toISOString().split('T')[0])
      .single(),
  ])
  const profile = profileResult.data as Profile | null
  const term = termResult.data as Term | null

  // Fallback to most recent if no term today
  let todaysTerm = term
  if (!todaysTerm) {
    const fallbackResult = await supabase
      .from('terms')
      .select('*')
      .eq('vertical_id', 'general')
      .eq('published', true)
      .order('publish_date', { ascending: false })
      .limit(1)
      .single()
    todaysTerm = fallbackResult.data as Term | null
  }

  const isPro = profile?.tier === 'pro' || profile?.tier === 'lifetime'
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  // Quiz stats (Pro only)
  let quizzableCount = 0
  let masteredQuizCount = 0
  if (isPro) {
    const [quizzableResult, masteredProgressResult] = await Promise.all([
      supabase
        .from('terms')
        .select('id', { count: 'exact', head: true })
        .eq('vertical_id', 'general')
        .eq('published', true)
        .not('quiz_question', 'is', null),
      supabase
        .from('user_progress')
        .select('term_id')
        .eq('user_id', user.id)
        .eq('status', 'mastered'),
    ])
    quizzableCount = quizzableResult.count ?? 0
    const masteredTermIds = masteredProgressResult.data?.map((p: { term_id: string }) => p.term_id) ?? []
    if (masteredTermIds.length > 0) {
      const { count } = await supabase
        .from('terms')
        .select('id', { count: 'exact', head: true })
        .eq('vertical_id', 'general')
        .not('quiz_question', 'is', null)
        .in('id', masteredTermIds)
      masteredQuizCount = count ?? 0
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Welcome banner */}
      <div className="mb-8">
        <p className="text-sm text-gray-400 uppercase tracking-wide font-medium">{today}</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-1">
          {isPro ? 'Your AI term for today' : "Today's free term"}
        </h1>
      </div>

      {todaysTerm ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {todaysTerm.category && (
                <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">
                  {todaysTerm.category}
                </span>
              )}
              {todaysTerm.difficulty && (
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${difficultyColors[todaysTerm.difficulty]}`}>
                  {todaysTerm.difficulty.charAt(0).toUpperCase() + todaysTerm.difficulty.slice(1)}
                </span>
              )}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">{todaysTerm.term}</h2>
          <p className="text-gray-600 leading-relaxed text-lg mb-6">{todaysTerm.definition}</p>

          {todaysTerm.example_sentence && (
            <div className="bg-gray-50 rounded-xl p-5 border-l-4 border-blue-400">
              <p className="text-sm text-gray-400 font-medium uppercase tracking-wide mb-2">Example</p>
              <p className="text-gray-700 italic">&ldquo;{todaysTerm.example_sentence}&rdquo;</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          No term published yet for today. Check back soon.
        </div>
      )}

      {/* Free user upsell */}
      {!isPro && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Want more than one term a day?</h3>
          <p className="text-gray-600 mb-4">
            Upgrade to Pro for the full glossary (100+ terms), flashcards, quizzes, and history.
          </p>
          <Link href="/pricing" className="inline-flex bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm">
            Upgrade to Pro
          </Link>
        </div>
      )}

      {/* Pro: quick links */}
      {isPro && (
        <>
          <div className="mt-8 grid grid-cols-3 gap-4">
            <Link href="/dashboard/glossary" className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
              <div className="text-2xl mb-2">📚</div>
              <div className="font-semibold text-gray-900">Glossary</div>
              <div className="text-sm text-gray-500">Browse all terms</div>
            </Link>
            <Link href="/dashboard/flashcards" className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
              <div className="text-2xl mb-2">🃏</div>
              <div className="font-semibold text-gray-900">Flashcards</div>
              <div className="text-sm text-gray-500">Practice & review</div>
            </Link>
            <Link href="/dashboard/quiz" className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
              <div className="text-2xl mb-2">🧠</div>
              <div className="font-semibold text-gray-900">Quiz Mode</div>
              <div className="text-sm text-gray-500">Test your knowledge</div>
            </Link>
          </div>

          {/* Quiz stats */}
          <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Quiz Score</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  <span className="font-semibold text-gray-900">{masteredQuizCount}</span> mastered out of{' '}
                  <span className="font-semibold text-gray-900">{quizzableCount}</span> quizzable terms
                </p>
              </div>
              <Link
                href="/dashboard/quiz"
                className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                Take Quiz →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
