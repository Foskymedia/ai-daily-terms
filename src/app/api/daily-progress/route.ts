import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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
  const flashcardDone = action === 'flashcard_done' ? true : (existing?.flashcard_done ?? false)
  const quizDone = action === 'quiz_done' ? true : (existing?.quiz_done ?? false)
  const qualifying = termViewed && (flashcardDone || quizDone)
  const nowIso = new Date().toISOString()

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
    if (qualifying && !existing.completed_at) {
      update.completed_at = nowIso
    }
    await supabase.from('daily_progress').update(update).eq('id', existing.id)
  }

  // Increment streak when qualifying condition first met today
  if (qualifying) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_streak, longest_streak, last_active_date')
      .eq('id', user.id)
      .single()

    if (profile && profile.last_active_date !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      const newStreak = profile.last_active_date === yesterday ? (profile.current_streak ?? 0) + 1 : 1
      const newLongest = Math.max(newStreak, profile.longest_streak ?? 0)
      await supabase
        .from('profiles')
        .update({ current_streak: newStreak, longest_streak: newLongest, last_active_date: today })
        .eq('id', user.id)
    }
  }

  return NextResponse.json({ ok: true, qualifying })
}
