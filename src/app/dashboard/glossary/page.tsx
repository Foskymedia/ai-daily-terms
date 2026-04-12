import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Term, Profile } from '@/types'

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
}

export default async function GlossaryPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const profileResult = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single()
  const profile = profileResult.data as Pick<Profile, 'tier'> | null

  const isPro = profile?.tier === 'pro' || profile?.tier === 'lifetime'

  if (!isPro) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Glossary is a Pro feature</h1>
        <p className="text-gray-500 mb-8">
          Upgrade to Pro to browse the complete AI glossary with 100+ terms, search, and filtering.
        </p>
        <Link href="/pricing" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          Upgrade to Pro
        </Link>
      </div>
    )
  }

  const termsResult = await supabase
    .from('terms')
    .select('*')
    .eq('vertical_id', 'general')
    .eq('published', true)
    .order('term', { ascending: true })
  const terms = termsResult.data as Term[] | null

  const grouped = (terms ?? []).reduce((acc, term) => {
    const letter = term.term[0].toUpperCase()
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(term)
    return acc
  }, {} as Record<string, Term[]>)

  const letters = Object.keys(grouped).sort()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Glossary</h1>
        <p className="text-gray-500 mt-1">{terms?.length ?? 0} terms · General vertical</p>
      </div>

      <div className="space-y-10">
        {letters.map((letter) => (
          <div key={letter}>
            <h2 className="text-xl font-bold text-gray-300 mb-4 border-b border-gray-100 pb-2">{letter}</h2>
            <div className="space-y-4">
              {grouped[letter].map((term) => (
                <div key={term.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">{term.term}</h3>
                    <div className="flex gap-2 flex-shrink-0">
                      {term.difficulty && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColors[term.difficulty]}`}>
                          {term.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600">{term.definition}</p>
                  {term.example_sentence && (
                    <p className="text-sm text-gray-400 italic mt-3 border-l-2 border-gray-200 pl-3">
                      &ldquo;{term.example_sentence}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
