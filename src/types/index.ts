export type VerticalId = 'general' | 'safety_pro' | 'kids'

export interface Term {
  id: string
  vertical_id: VerticalId
  slug: string
  term: string
  definition: string
  example_sentence: string | null
  category: string | null
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null
  published: boolean
  publish_date: string | null
  created_at: string
  // Enrichment fields (v1 seed pack)
  short_definition: string | null
  plain_explanation: string | null
  use_case: string | null
  why_it_matters: string | null
  common_mistake: string | null
  related_terms: string[] | null
  // Quiz fields
  quiz_question: string | null
  quiz_type: string | null
  option_a: string | null
  option_b: string | null
  option_c: string | null
  option_d: string | null
  correct_answer: string | null
  quiz_explanation: string | null
}

export interface Profile {
  id: string
  vertical_id: VerticalId
  email: string | null
  full_name: string | null
  tier: 'free' | 'pro' | 'lifetime'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: string | null
  current_period_end: string | null
  onboarding_completed: boolean
  // Phase 2: streak + level
  current_streak: number
  longest_streak: number
  last_active_date: string | null
  level: number
  created_at: string
}

export interface DailyView {
  id: string
  user_id: string
  term_id: string
  vertical_id: VerticalId
  viewed_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  term_id: string
  vertical_id: VerticalId
  status: 'seen' | 'saved' | 'mastered'
  confidence: number | null
  next_review_date: string | null
  updated_at: string
}

export interface Milestone {
  id: string
  user_id: string
  milestone_type: string
  achieved_at: string
}

export interface DailyProgress {
  id: string
  user_id: string
  date: string
  term_viewed: boolean
  flashcard_done: boolean
  quiz_done: boolean
  completed_at: string | null
  created_at: string
}

export interface QuizAttempt {
  id: string
  user_id: string
  term_id: string
  correct: boolean
  category: string | null
  created_at: string
}
