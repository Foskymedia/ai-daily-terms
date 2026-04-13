import { createClient } from '@/lib/supabase/server'
import { Term } from '@/types'
import AuthForm from '@/components/AuthForm'
import Link from 'next/link'

async function getTodaysTerm(): Promise<Term | null> {
  try {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    const { data: term } = await supabase
      .from('terms')
      .select('*')
      .eq('vertical_id', 'general')
      .eq('published', true)
      .eq('publish_date', today)
      .single()
    if (term) return term as Term
    const { data: fallback } = await supabase
      .from('terms')
      .select('*')
      .eq('vertical_id', 'general')
      .eq('published', true)
      .order('publish_date', { ascending: false })
      .limit(1)
      .single()
    return (fallback as Term) ?? null
  } catch {
    return null
  }
}

export default async function AuthPage() {
  const term = await getTodaysTerm()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel — benefits + blurred term preview (desktop only) */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 bg-blue-600 p-16">
        <Link href="/" className="text-white/70 text-sm mb-12 hover:text-white transition-colors">
          ← Back to home
        </Link>

        <h2 className="text-3xl font-bold text-white mb-4 leading-snug">
          Build your AI vocabulary,<br />one term at a time
        </h2>
        <p className="text-blue-100 mb-10 leading-relaxed">
          Join thousands of professionals, students, and creators who learn one plain-English
          AI term every single day.
        </p>

        <ul className="space-y-4 mb-12">
          {[
            'Join thousands learning AI one term at a time',
            'No credit card required',
            'Cancel anytime',
          ].map((b) => (
            <li key={b} className="flex items-center gap-3 text-blue-100 text-sm">
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs flex-shrink-0">
                ✓
              </span>
              {b}
            </li>
          ))}
        </ul>

        {/* Blurred term preview */}
        {term && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20 relative overflow-hidden">
            <p className="text-xs font-semibold text-blue-200 uppercase tracking-wide mb-2">
              Today&apos;s Term
            </p>
            <p className="text-lg font-bold text-white mb-3">{term.term}</p>
            <p className="text-blue-100 text-sm leading-relaxed blur-sm select-none">
              {term.plain_explanation ?? term.definition}
            </p>
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/90 via-transparent to-transparent flex items-end justify-center pb-5">
              <p className="text-white text-xs font-medium">
                Sign up free to read the full definition
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <AuthForm />
      </div>
    </div>
  )
}
