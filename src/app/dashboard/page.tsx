import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Term, Profile } from '@/types'
import { getLevel, getLevelProgress } from '@/lib/levels'
import TodayTermActions from '@/components/TodayTermActions'
import MilestoneToast from '@/components/MilestoneToast'

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
}

function getMotivationalMessage(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning! Ready to learn something new?'
  if (hour < 18) return 'Keep the streak going!'
  return 'End your day smarter.'
}

function getStreakMilestoneMessage(streak: number): string | null {
  if (streak === 3) return "You're building a habit! 🎯"
  if (streak === 7) return 'One week strong! 💪'
  if (streak === 30) return "30 days — you're on fire! 🔥"
  return null
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // Parallel fetches
  const [profileResult, masteredCountResult, milestonesResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('user_progress')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'mastered'),
    supabase
      .from('milestones')
      .select('milestone_type')
      .eq('user_id', user.id),
  ])

  const profile = profileResult.data as Profile | null
  const masteredCount = masteredCountResult.count ?? 0
  const achievedMilestones = new Set(
    milestonesResult.data?.map((m: { milestone_type: string }) => m.milestone_type) ?? []
  )

  // ── Streak update ─────────────────────────────────────────────────
  let currentStreak = profile?.current_streak ?? 0
  let longestStreak = profile?.longest_streak ?? 0
  const lastActive = profile?.last_active_date

  if (lastActive !== today) {
    currentStreak = lastActive === yesterday ? (profile?.current_streak ?? 0) + 1 : 1
    longestStreak = Math.max(currentStreak, profile?.longest_streak ?? 0)

    await supabase
      .from('profiles')
      .update({ current_streak: currentStreak, longest_streak: longestStreak, last_active_date: today })
      .eq('id', user.id)
  }

  // Record daily view (unique per day)
  await supabase
    .from('daily_views')
    .upsert({ user_id: user.id, vertical_id: 'general', viewed_at: today }, { onConflict: 'user_id,viewed_at,vertical_id', ignoreDuplicates: true })

  // ── Milestone checks ──────────────────────────────────────────────
  const levelInfo = getLevel(masteredCount)
  const newMilestones: string[] = []

  if (currentStreak >= 3 && !achievedMilestones.has('streak_3')) newMilestones.push('streak_3')
  if (currentStreak >= 7 && !achievedMilestones.has('streak_7')) newMilestones.push('streak_7')
  if (currentStreak >= 30 && !achievedMilestones.has('streak_30')) newMilestones.push('streak_30')
  if (masteredCount >= 1 && !achievedMilestones.has('first_term')) newMilestones.push('first_term')
  for (let lvl = 2; lvl <= 6; lvl++) {
    if (levelInfo.level >= lvl && !achievedMilestones.has(`level_${lvl}`)) {
      newMilestones.push(`level_${lvl}`)
    }
  }

  if (newMilestones.length > 0) {
    await supabase.from('milestones').insert(
      newMilestones.map((type) => ({ user_id: user.id, milestone_type: type }))
    )
  }

  // ── Fetch today's term ────────────────────────────────────────────
  let todaysTerm: Term | null = null
  const { data: termData } = await supabase
    .from('terms')
    .select('*')
    .eq('vertical_id', 'general')
    .eq('published', true)
    .eq('publish_date', today)
    .single()

  if (termData) {
    todaysTerm = termData as Term
  } else {
    const { data: fallback } = await supabase
      .from('terms')
      .select('*')
      .eq('vertical_id', 'general')
      .eq('published', true)
      .order('publish_date', { ascending: false })
      .limit(1)
      .single()
    todaysTerm = (fallback as Term) ?? null
  }

  // ── User progress for today's term ───────────────────────────────
  let termSaved = false
  let termMastered = false
  let lastTerm: { term: string; id: string } | null = null

  if (todaysTerm) {
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('status')
      .eq('user_id', user.id)
      .eq('term_id', todaysTerm.id)
      .single()

    if (progressData) {
      termSaved = progressData.status === 'saved'
      termMastered = progressData.status === 'mastered'
    }

    // Last term studied (for Resume Learning)
    const { data: lastProgress } = await supabase
      .from('user_progress')
      .select('term_id, updated_at')
      .eq('user_id', user.id)
      .neq('term_id', todaysTerm.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (lastProgress) {
      const { data: lt } = await supabase
        .from('terms')
        .select('term, id')
        .eq('id', lastProgress.term_id)
        .single()
      lastTerm = lt
    }
  }

  const isPro = profile?.tier === 'pro' || profile?.tier === 'lifetime'
  const daysSinceSignup = Math.floor(
    (Date.now() - new Date(profile?.created_at ?? Date.now()).getTime()) / (1000 * 60 * 60 * 24)
  )
  const showUpgradeBanner = !isPro && daysSinceSignup >= 3
  const levelProgress = getLevelProgress(masteredCount)
  const todayFormatted = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const motivational = getMotivationalMessage()
  const streakMilestoneMsg = getStreakMilestoneMessage(currentStreak)

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
    const masteredIds = masteredProgressResult.data?.map((p: { term_id: string }) => p.term_id) ?? []
    if (masteredIds.length > 0) {
      const { count } = await supabase
        .from('terms')
        .select('id', { count: 'exact', head: true })
        .eq('vertical_id', 'general')
        .not('quiz_question', 'is', null)
        .in('id', masteredIds)
      masteredQuizCount = count ?? 0
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Top row: motivational + streak + level */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{todayFormatted}</p>
          <p className="text-sm text-gray-500 mt-0.5">{motivational}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Streak badge */}
          <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full text-sm font-semibold">
            🔥 {currentStreak} day{currentStreak !== 1 ? 's' : ''}
          </div>
          {/* Level badge */}
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-semibold">
            ⭐ {levelInfo.name}
          </div>
        </div>
      </div>

      {/* Streak milestone message */}
      {streakMilestoneMsg && (
        <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mb-5 text-sm text-orange-700 font-medium">
          {streakMilestoneMsg}
        </div>
      )}

      {/* Level progress bar */}
      <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500">
            Level {levelInfo.level} — {levelInfo.name}
          </span>
          <span className="text-xs text-gray-400">
            {masteredCount}{levelInfo.max !== null ? ` / ${levelInfo.max}` : '+'} mastered
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
        {levelInfo.max !== null && (
          <p className="text-xs text-gray-400 mt-1.5">
            {levelInfo.max - masteredCount} more to reach {getLevel(levelInfo.max + 1).name}
          </p>
        )}
      </div>

      {/* Today's term heading */}
      <div className="mb-3">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {isPro ? 'Your AI term for today' : "Today's free term"}
        </h1>
      </div>

      {/* Today's term card */}
      {todaysTerm ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-8 shadow-sm mb-5">
          <div className="flex items-center gap-2 flex-wrap mb-4">
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

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {todaysTerm.term}
          </h2>
          <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-6">
            {todaysTerm.plain_explanation ?? todaysTerm.definition}
          </p>

          {todaysTerm.example_sentence && (
            <div className="bg-gray-50 rounded-xl p-4 md:p-5 border-l-4 border-blue-400 mb-6">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Example</p>
              <p className="text-gray-700 italic text-sm md:text-base">
                &ldquo;{todaysTerm.example_sentence}&rdquo;
              </p>
            </div>
          )}

          {/* Action buttons + completion indicator */}
          <div className="space-y-4 pt-2 border-t border-gray-50">
            <TodayTermActions
              termId={todaysTerm.id}
              termName={todaysTerm.term}
              userId={user.id}
              isPro={isPro}
              initialSaved={termSaved}
              isMastered={termMastered}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 mb-5">
          No term published yet for today. Check back soon.
        </div>
      )}

      {/* Free user: quiz upsell after term */}
      {!isPro && todaysTerm && (
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 mb-5">
          <p className="text-sm font-semibold text-purple-900 mb-1">
            Want to quiz yourself on this?
          </p>
          <p className="text-sm text-purple-700 mb-3">
            Test your knowledge of &quot;{todaysTerm.term}&quot; and track your mastery with Pro.
          </p>
          <Link
            href="/pricing"
            className="inline-block text-sm bg-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            Upgrade to Pro →
          </Link>
        </div>
      )}

      {/* Resume learning */}
      {lastTerm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Resume Learning</p>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Continue where you left off: <span className="font-semibold">{lastTerm.term}</span>
            </p>
            {isPro ? (
              <Link
                href="/dashboard/glossary"
                className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                Continue →
              </Link>
            ) : (
              <Link href="/pricing" className="text-sm text-blue-600 font-medium hover:text-blue-700">
                Upgrade →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Upgrade banner (after 3 days, free users only) */}
      {showUpgradeBanner && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 mb-5">
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            You&apos;ve learned {masteredCount > 0 ? masteredCount : 'a few'} terms already!
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Pro unlocks 365 terms + quiz + flashcards. Go beyond one term a day.
          </p>
          <Link
            href="/pricing"
            className="inline-flex bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
          >
            Upgrade to Pro
          </Link>
        </div>
      )}

      {/* Pro: quick links */}
      {isPro && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Link
              href="/dashboard/glossary"
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow"
            >
              <div className="text-2xl mb-2">📚</div>
              <div className="font-semibold text-gray-900 text-sm">Glossary</div>
              <div className="text-xs text-gray-500 mt-0.5">Browse all terms</div>
            </Link>
            <Link
              href="/dashboard/flashcards"
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow"
            >
              <div className="text-2xl mb-2">🃏</div>
              <div className="font-semibold text-gray-900 text-sm">Flashcards</div>
              <div className="text-xs text-gray-500 mt-0.5">Practice &amp; review</div>
            </Link>
            <Link
              href="/dashboard/quiz"
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow"
            >
              <div className="text-2xl mb-2">🧠</div>
              <div className="font-semibold text-gray-900 text-sm">Quiz Mode</div>
              <div className="text-xs text-gray-500 mt-0.5">Test knowledge</div>
            </Link>
          </div>

          {/* Quiz stats + Progress link */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Quiz Progress</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  <span className="font-semibold text-gray-900">{masteredQuizCount}</span> mastered out of{' '}
                  <span className="font-semibold text-gray-900">{quizzableCount}</span> quizzable terms
                </p>
              </div>
              <Link
                href="/dashboard/progress"
                className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                View Progress →
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Milestone toast */}
      <MilestoneToast milestones={newMilestones} />
    </div>
  )
}
