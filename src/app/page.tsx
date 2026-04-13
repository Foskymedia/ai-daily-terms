import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Term } from '@/types'
import ThemeToggle from '@/components/ThemeToggle'

const audiences = [
  { icon: '👋', label: 'Beginners', desc: 'Never heard of ChatGPT? Start here' },
  { icon: '💼', label: 'Professionals', desc: 'Use AI at work but don\'t fully understand it' },
  { icon: '🎓', label: 'Students', desc: 'Get ahead in your field' },
  { icon: '✨', label: 'Creators', desc: 'Use AI tools more effectively' },
]

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Marketing Manager',
    text: 'I finally understand what my team is talking about. AI Daily Terms made it click for me.',
  },
  {
    name: 'James K.',
    role: 'Freelance Designer',
    text: 'One term a day was exactly the pace I needed. No overwhelm, just steady clarity.',
  },
  {
    name: 'Priya L.',
    role: 'MBA Student',
    text: 'The plain-English explanations are perfect. I use these to prep for class discussions.',
  },
]

const stats = [
  { value: '365', label: 'Terms' },
  { value: 'Daily', label: 'Updates' },
  { value: 'Plain', label: 'English' },
  { value: 'Free', label: 'to Start' },
]

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

function firstSentence(text: string): string {
  const match = text.match(/^[^.!?]+[.!?]/)
  return match ? match[0] : text
}

export default async function HomePage() {
  const todaysTerm = await getTodaysTerm()

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Nav */}
      <nav className="border-b border-gray-100 dark:border-white/[0.08] bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900 dark:text-slate-100">AI Daily Terms</span>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/pricing" className="text-sm text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100">Pricing</Link>
            <Link
              href="/auth"
              className="text-sm bg-gray-900 dark:bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-slate-600 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium px-3 py-1 rounded-full mb-6">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          New term published today
        </div>
        <h1 className="text-[28px] sm:text-5xl font-bold text-gray-900 dark:text-slate-100 mb-6 leading-tight">
          Finally understand what<br />everyone is talking about
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
          Get one plain-English AI term every day. No fluff, no jargon — just the vocabulary
          you need to keep up with the AI revolution.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/auth"
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-lg"
          >
            Start Learning Free
          </Link>
          <Link
            href="/auth"
            className="text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-white/[0.12] px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-lg"
          >
            Get Today&apos;s Term Free
          </Link>
        </div>
      </section>

      {/* Today's Term Preview */}
      {todaysTerm && (
        <section className="max-w-3xl mx-auto px-4 pb-20">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30 p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Today&apos;s Term</p>
            </div>
            <div className="flex items-start gap-3 flex-wrap mb-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{todaysTerm.term}</h2>
              <div className="flex gap-2 flex-wrap pt-1">
                {todaysTerm.category && (
                  <span className="text-xs bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 px-2.5 py-1 rounded-full font-medium">
                    {todaysTerm.category}
                  </span>
                )}
                {todaysTerm.difficulty && (
                  <span className="text-xs bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-white/[0.12] px-2.5 py-1 rounded-full font-medium capitalize">
                    {todaysTerm.difficulty}
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-700 dark:text-slate-200 text-lg leading-relaxed mb-6">
              {firstSentence(todaysTerm.plain_explanation ?? todaysTerm.definition)}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/auth"
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
              >
                Read full definition →
              </Link>
              <p className="text-sm text-gray-500 dark:text-slate-400">Free account required</p>
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="bg-gray-50 dark:bg-slate-800/50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-center text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-8">
            365 terms · updated daily · built for real people
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-white dark:bg-slate-800 rounded-2xl p-5 text-center border border-gray-100 dark:border-white/[0.08]">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{s.value}</p>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who this is for */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 text-center mb-4">Who this is for</h2>
        <p className="text-center text-gray-500 dark:text-slate-400 mb-12">Whether you&apos;re just starting out or leveling up your career</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((a) => (
            <div key={a.label} className="border border-gray-100 dark:border-white/[0.08] bg-white dark:bg-slate-800 rounded-2xl p-6 hover:shadow-sm transition-shadow text-center">
              <div className="text-4xl mb-4">{a.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">{a.label}</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 dark:bg-slate-800/50 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Sign up free', desc: 'Create your free account in seconds — no credit card required.' },
              { step: '2', title: 'Get today\'s term', desc: 'Every day we publish a new AI term with a clear, plain-English definition and real-world example.' },
              { step: '3', title: 'Build fluency', desc: 'Upgrade to Pro for the full glossary, flashcards, quizzes, and your complete learning history.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white text-xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">{s.title}</h3>
                <p className="text-gray-500 dark:text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 text-center mb-12">What people are saying</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="border border-gray-100 dark:border-white/[0.08] bg-white dark:bg-slate-800 rounded-2xl p-6">
              <p className="text-gray-700 dark:text-slate-200 mb-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              <div>
                <p className="font-semibold text-gray-900 dark:text-slate-100 text-sm">{t.name}</p>
                <p className="text-gray-500 dark:text-slate-400 text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-500 dark:text-slate-500 mt-6">
          Testimonials are representative examples — real names pending.
        </p>
      </section>

      {/* Pricing teaser */}
      <section className="bg-blue-600 py-20 text-center text-white">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to go deeper?</h2>
          <p className="text-blue-100 text-[17px] sm:text-lg mb-8">
            Upgrade to Pro for the full glossary, flashcards, quizzes, and unlimited history.
            Just $4.99/month.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/auth"
              className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-lg inline-block"
            >
              Start Learning Free
            </Link>
            <Link
              href="/pricing"
              className="text-blue-100 border border-blue-400 px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-lg inline-block"
            >
              See all plans
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-white/[0.08] py-10 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-400 dark:text-slate-500 font-medium">
              AI Daily Terms — One word a day. A lifetime of clarity.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-400 dark:text-slate-500 mb-4">
            <Link href="/privacy" className="hover:text-gray-600 dark:hover:text-slate-300">Privacy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-gray-600 dark:hover:text-slate-300">Terms</Link>
            <span>·</span>
            <Link href="/contact" className="hover:text-gray-600 dark:hover:text-slate-300">Contact</Link>
            <span>·</span>
            <Link href="/billing" className="hover:text-gray-600 dark:hover:text-slate-300">Billing</Link>
            <span>·</span>
            <Link href="/pricing" className="hover:text-gray-600 dark:hover:text-slate-300">Pricing</Link>
            <span>·</span>
            <Link href="/auth" className="hover:text-gray-600 dark:hover:text-slate-300">Sign in</Link>
          </div>
          <p className="text-center text-xs text-gray-400 dark:text-slate-500">© 2026 Fosky Media</p>
        </div>
      </footer>
    </div>
  )
}
