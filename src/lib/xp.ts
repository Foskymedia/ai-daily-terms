// XP values for each action
export const XP_VALUES = {
  READ_TERM: 5,
  FLASHCARD: 10,
  QUIZ_CORRECT: 10,
  DAILY_COMPLETE: 15,
} as const

// Streak milestone → bonus XP (awarded once when streak first hits that number)
export const STREAK_XP_BONUSES: Record<number, number> = {
  3: 10,
  7: 25,
  14: 50,
  30: 100,
}

/** Returns the streak bonus XP for an exact streak day count, or 0 if none. */
export function getStreakBonus(streak: number): number {
  return STREAK_XP_BONUSES[streak] ?? 0
}
