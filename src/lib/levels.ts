export interface LevelInfo {
  level: number
  name: string
  min: number
  max: number | null
}

const LEVELS: LevelInfo[] = [
  { level: 1, name: 'AI Curious',  min: 0,   max: 10  },
  { level: 2, name: 'AI Aware',    min: 11,  max: 25  },
  { level: 3, name: 'AI Literate', min: 26,  max: 50  },
  { level: 4, name: 'AI Fluent',   min: 51,  max: 100 },
  { level: 5, name: 'AI Expert',   min: 101, max: 200 },
  { level: 6, name: 'AI Master',   min: 201, max: null },
]

export function getLevel(mastered: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (mastered >= LEVELS[i].min) return LEVELS[i]
  }
  return LEVELS[0]
}

export function getLevelProgress(mastered: number): number {
  const info = getLevel(mastered)
  if (info.max === null) return 100
  const range = info.max - info.min + 1
  const progress = mastered - info.min + 1
  return Math.min(100, Math.round((progress / range) * 100))
}

// ── XP-based level system ────────────────────────────────────────────────────

export interface XPLevelInfo {
  level: number
  name: string
  minXP: number
  maxXP: number | null
}

const XP_LEVELS: XPLevelInfo[] = [
  { level: 1, name: 'Beginner',         minXP: 0,   maxXP: 49  },
  { level: 2, name: 'Learner',          minXP: 50,  maxXP: 149 },
  { level: 3, name: 'Practitioner',     minXP: 150, maxXP: 299 },
  { level: 4, name: 'Skilled User',     minXP: 300, maxXP: 499 },
  { level: 5, name: 'Advanced Learner', minXP: 500, maxXP: 799 },
  { level: 6, name: 'AI Fluent',        minXP: 800, maxXP: null },
]

export function getLevelFromXP(xp: number): XPLevelInfo {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i].minXP) return XP_LEVELS[i]
  }
  return XP_LEVELS[0]
}

/**
 * Returns XP progress within the current level.
 * pct: 0–100 for the progress bar
 * xpInLevel: XP earned within this level band
 * xpNeeded: XP remaining to reach next level (null at max level)
 */
export function getXPProgress(xp: number): { pct: number; xpInLevel: number; xpNeeded: number | null } {
  const info = getLevelFromXP(xp)
  if (info.maxXP === null) return { pct: 100, xpInLevel: xp - info.minXP, xpNeeded: null }
  const range = info.maxXP - info.minXP + 1
  const progress = xp - info.minXP
  return {
    pct: Math.min(100, Math.round((progress / range) * 100)),
    xpInLevel: progress,
    xpNeeded: range - progress,
  }
}

/** XP needed to reach the next level, or null if already at max. */
export function getXPToNextLevel(xp: number): number | null {
  const info = getLevelFromXP(xp)
  if (info.maxXP === null) return null
  return info.maxXP + 1 - xp
}

export const MILESTONE_LABELS: Record<string, string> = {
  first_term: 'Read your first AI term 🎉',
  streak_3:   '3-day streak — you\'re building a habit! 🎯',
  streak_7:   '7-day streak — one week strong! 💪',
  streak_30:  '30-day streak — you\'re unstoppable! 🔥',
  level_2:    'Level up! You\'re now AI Aware 📚',
  level_3:    'Level up! AI Literate achieved 🧠',
  level_4:    'Level up! AI Fluent — impressive! 🌟',
  level_5:    'Level up! AI Expert status reached 🏆',
  level_6:    'Level up! AI Master — you\'ve done it! 🎓',
  quiz_10:    '10 quiz answers correct! 🎯',
  quiz_50:    '50 quiz answers correct! 🏅',
  all_categories: 'You\'ve explored every AI category! 🌐',
}
