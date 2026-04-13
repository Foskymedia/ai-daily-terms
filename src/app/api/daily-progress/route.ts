import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getLevelFromXP, getXPToNextLevel } from '@/lib/levels'
import { XP_VALUES, getStreakBonus } from '@/lib/xp'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const action = body.action as string
  if (!['flashcard_done', 'quiz_done'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const today = new Date().toISOString().split('T')[0]

  // Fetch today's row
  const { data: existing } = await supabase
    .from('daily_progress')
    .select('id, term_viewed, flashcard_done, quiz_done, completed_at')
    .eq('user_id', user.id)
    .eq('date', today)
    .maybeSingle()

  const termViewed = existing?.term_viewed ?? false
  const flashcardAlreadyDone = existing?.flashcard_done ?? false
  const quizAlreadyDone = existing?.quiz_done ?? false
  const flashcardDone = action === 'flashcard_done' ? true : flashcardAlreadyDone
  const quizDone = action === 'quiz_done' ? true : quizAlreadyDone
  const qualifying = termViewed && (flashcardDone || quizDone)
  const nowIso = new Date().toISOString()

  // Determine if this action is being completed for the first time today
  const actionAlreadyDone = action === 'flashcard_done' ? flashcardAlreadyDone : quizAlreadyDone
  const isFirstCompletion = qualifying && !existing?.completed_at

  if (!existing) {
    await supabase.from('daily_progress').insert({
      user_id: user.id,
      date: today,
      term_viewed: false,
      flashcard_done: action === 'flashcard_done',
      quiz_done: action === 'quiz_done',
      ...(qualifying ? { completed_at: nowIso } : {}),
    })
  } else {
    const update: Record<string, boolean | string> = { [action]: true }
    if (isFirstCompletion) {
      update.completed_at = nowIso
    }
    await supabase.from('daily_progress').update(update).eq('id', existing.id)
  }

  // ── XP accumulation ────────────────────────────────────────────────
  let xpGained = 0
  let streakBonus = 0
  let newStreak = 0

  // +10 XP for the action if not already done today
  if (!actionAlreadyDone) {
    xpGained += XP_VALUES.FLASHCARD // same value for flashcard and quiz (both 10)
  }

  // +15 XP for completing all daily steps (first time today)
  if (isFirstCompletion) {
    xpGained += XP_VALUES.DAILY_COMPLETE
  }

  // ── Streak increment ───────────────────────────────────────────────
  if (qualifying) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_streak, longest_streak, last_active_date, total_xp, level')
      .eq('id', user.id)
      .single()

    if (profile && profile.last_active_date !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      newStreak = profile.last_active_date === yesterday ? (profile.current_streak ?? 0) + 1 : 1
      const newLongest = Math.max(newStreak, profile.longest_streak ?? 0)

      // Check for streak XP bonus
      streakBonus = getStreakBonus(newStreak)
      xpGained += streakBonus

      // Recalculate level from updated XP
      const currentXP = (profile.total_xp ?? 0) as number
      const newXP = currentXP + xpGained
      const newLevelInfo = getLevelFromXP(newXP)

      await supabase
        .from('profiles')
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_active_date: today,
          total_xp: newXP,
          level: newLevelInfo.level,
          xp_to_next_level: getXPToNextLevel(newXP),
        })
        .eq('id', user.id)
    } else if (xpGained > 0 && profile) {
      // Streak already updated today — just add XP
      const currentXP = (profile.total_xp ?? 0) as number
      const newXP = currentXP + xpGained
      const newLevelInfo = getLevelFromXP(newXP)

      await supabase
        .from('profiles')
        .update({
          total_xp: newXP,
          level: newLevelInfo.level,
          xp_to_next_level: getXPToNextLevel(newXP),
        })
        .eq('id', user.id)
    }
  } else if (xpGained > 0) {
    // Not qualifying yet — still award action XP
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_xp, level')
      .eq('id', user.id)
      .single()

    if (profile) {
      const currentXP = (profile.total_xp ?? 0) as number
      const newXP = currentXP + xpGained
      const newLevelInfo = getLevelFromXP(newXP)

      await supabase
        .from('profiles')
        .update({
          total_xp: newXP,
          level: newLevelInfo.level,
          xp_to_next_level: getXPToNextLevel(newXP),
        })
        .eq('id', user.id)
    }
  }

  return NextResponse.json({ ok: true, qualifying, xpGained, streakBonus, newStreak })
}
