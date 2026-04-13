import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Term, Profile } from '@/types'
import GlossaryClient from '@/components/GlossaryClient'

export default async function GlossaryPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single()
  const profile = profileData as Pick<Profile, 'tier'> | null
  const isPro = profile?.tier === 'pro' || profile?.tier === 'lifetime'

  if (!isPro) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Glossary is a Pro feature</h1>
        <p className="text-gray-500 mb-8">
          Upgrade to Pro to browse the complete AI glossary with 365+ terms, search, and filtering.
        </p>
        <Link
          href="/pricing"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Upgrade to Pro
        </Link>
      </div>
    )
  }

  const [termsResult, progressResult] = await Promise.all([
    supabase
      .from('terms')
      .select('*')
      .eq('vertical_id', 'general')
      .eq('published', true)
      .order('term', { ascending: true }),
    supabase
      .from('user_progress')
      .select('term_id, status')
      .eq('user_id', user.id)
      .eq('vertical_id', 'general'),
  ])

  const terms = (termsResult.data ?? []) as Term[]
  const progressMap: Record<string, 'seen' | 'saved' | 'mastered'> = {}
  for (const p of progressResult.data ?? []) {
    progressMap[p.term_id] = p.status as 'seen' | 'saved' | 'mastered'
  }

  return (
    <div className="max-w-3xl mx-auto">
      <GlossaryClient
        terms={terms}
        progressMap={progressMap}
        userId={user.id}
        totalPublished={terms.length}
      />
    </div>
  )
}
