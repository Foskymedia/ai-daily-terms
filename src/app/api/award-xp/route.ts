import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getLevelFromXP, getXPToNextLevel } from '@/lib/levels'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const amount = body.amount as number
  if (typeof amount !== 'number' || amount <= 0 || amount > 200) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('total_xp, level')
    .eq('id', user.id)
    .single()

  const currentXP = (profile?.total_xp ?? 0) as number
  const newXP = currentXP + amount
  const newLevelInfo = getLevelFromXP(newXP)
  const leveledUp = newLevelInfo.level > ((profile?.level ?? 1) as number)

  await supabase
    .from('profiles')
    .update({
      total_xp: newXP,
      level: newLevelInfo.level,
      xp_to_next_level: getXPToNextLevel(newXP),
    })
    .eq('id', user.id)

  return NextResponse.json({
    ok: true,
    xpGained: amount,
    newXP,
    newLevel: newLevelInfo.level,
    levelName: newLevelInfo.name,
    leveledUp,
  })
}
