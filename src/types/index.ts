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
  updated_at: string
}
