import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Profile, Milestone } from '@/types'
import { getLevel, getLevelProgress, MILESTONE_LABELS } from '@/lib/levels'

interface CategoryStat {
  category: string
  seen: number
  mastered: number
  total: number
}

export default async function ProgressPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const [profileResult, progressResult, termsResult, milestonesResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('user_progress')
      .select('term_id, status')
      .eq('user_id', user.id)
      .eq('vertical_id', 'general'),
    supabase
      .from('terms')
      .select('id, category')
      .eq('vertical_id', 'general')
      .eq('published', true),
    supabase
      .from('milestones')
      .select('*')
      .eq('user_id', user.id)
      .order('achieved_at', { ascending: false })
      .limit(10),
  ])

  const profile = profileResult.data as Profile | null
  const isPro = profile?.tier === 'pro' || profile?.tier === 'lifetime'

  const progressRows = progressResult.data ?? []
  const progressByTermId = new Map(progressRows.map((p) => [p.term_id, p.status as string]))

  const allTerms = termsResult.data ?? []
  const milestones = (milestonesResult.data ?? []) as Milestone[]

  // Stats
  const seenIds = new Set(progressRows.map((p) => p.term_id))
  const masteredCount = progressRows.filter((p) => p.status === 'mastered').length
  const seenCount = seenIds.size
  const totalPublished = allTerms.length

  // Level
  const levelInfo = getLevel(masteredCount)
  const levelPct = getLevelProgress(masteredCount)

  // Category breakdown
  const catMap = new Map<string, { total: number; seen: number; mastered: number }>()
  for (const t of allTerms) {
    const cat = t.category ?? 'Uncategorized'
    if (!catMap.has(cat)) catMap.set(cat, { total: 0, seen: 0, mastered: 0 })
    const entry = catMap.get(cat)!
    entry.total++
    const status = progressByTermId.get(t.id)
    if (status) entry.seen++
    if (status === 'mastered') entry.mastered++
  }

  const categoryStats: CategoryStat[] = Array.from(catMap.entries())
    .map(([category, s]) => ({ category, ...s }))
    .sort((a, b) => b.mastered - a.mastered || b.seen - a.seen)

  const currentStreak = profile?.current_streak ?? 0
  const longestStreak = profile?.longest_streak ?? 0

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
        <p className="text-gray-500 mt-1">Your AI learning journey so far</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
          <p className="text-3xl font-bold text-gray-900">{seenCount}</p>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Terms Seen</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
          <p className="text-3xl font-bold text-green-600">{masteredCount}</p>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Mastered</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
          <p className="text-3xl font-bold text-orange-500">🔥 {currentStreak}</p>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Day Streak</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
          <p className="text-3xl font-bold text-blue-600">{longestStreak}</p>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Best Streak</p>
        </div>
      </div>

      {/* Level progress */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-bold text-gray-900">
              Level {levelInfo.level} — {levelInfo.name}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              {masteredCount} terms mastered
              {levelInfo.max !== null && ` · ${levelInfo.max - masteredCount} to next level`}
            </p>
          </div>
          <span className="text-3xl">⭐</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-700"
            style={{ width: `${levelPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>Level {levelInfo.level}</span>
          {levelInfo.max !== null && (
            <span>Level {levelInfo.level + 1} at {levelInfo.max + 1} mastered</span>
          )}
        </div>
      </div>

      {/* Category heatmap */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Category Breakdown</h2>
        {categoryStats.length === 0 ? (
          <p className="text-gray-400 text-sm">Start learning to see your category progress.</p>
        ) : (
          <div className="space-y-3">
            {categoryStats.map((cat) => {
              const masteredPct = cat.total > 0 ? Math.round((cat.mastered / cat.total) * 100) : 0
              const seenPct = cat.total > 0 ? Math.round((cat.seen / cat.total) * 100) : 0
              const isWeak = isPro && cat.seen >= 3 && masteredPct < 30
              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${isWeak ? 'text-amber-700' : 'text-gray-700'}`}>
                      {cat.category} {isWeak && '⚠️'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {cat.mastered}/{cat.total} mastered
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-blue-100 rounded-full"
                      style={{ width: `${seenPct}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 bg-green-500 rounded-full"
                      style={{ width: `${masteredPct}%` }}
                    />
                  </div>
                </div>
              )
            })}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded bg-blue-100 inline-block" /> Seen
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded bg-green-500 inline-block" /> Mastered
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Recent milestones */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Milestones</h2>
        {milestones.length === 0 ? (
          <p className="text-gray-400 text-sm">
            Keep learning to earn your first milestone! Start by reading today&apos;s term.
          </p>
        ) : (
          <div className="space-y-3">
            {milestones.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-sm flex-shrink-0">
                  🏆
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {MILESTONE_LABELS[m.milestone_type] ?? m.milestone_type}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(m.achieved_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary + CTA */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 text-center">
        <p className="text-gray-700 font-semibold mb-1">Your AI journey so far</p>
        <p className="text-gray-500 text-sm mb-4">
          You&apos;ve explored {seenCount} of {totalPublished} terms and mastered {masteredCount}.
          {currentStreak > 0 && ` You're on a ${currentStreak}-day streak.`}
          {' '}Keep going!
        </p>
        {!isPro ? (
          <Link
            href="/pricing"
            className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
          >
            Unlock Flashcards &amp; Quiz with Pro
          </Link>
        ) : (
          <Link
            href="/dashboard/quiz"
            className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
          >
            Take a Quiz →
          </Link>
        )}
      </div>
    </div>
  )
}
