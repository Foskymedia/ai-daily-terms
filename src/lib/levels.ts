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
