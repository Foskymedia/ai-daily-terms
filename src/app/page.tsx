import Link from 'next/link'

const features = [
  { icon: '📅', title: 'One Term a Day', desc: 'A carefully chosen AI term delivered daily — free forever.' },
  { icon: '📚', title: 'Full Glossary', desc: 'Pro members get instant access to the complete AI vocabulary library.' },
  { icon: '🃏', title: 'Flashcards', desc: 'Reinforce what you\'ve learned with spaced-repetition flashcards.' },
  { icon: '🧠', title: 'Quizzes', desc: 'Test your knowledge and track mastery across all terms.' },
]

const steps = [
  { step: '1', title: 'Sign up free', desc: 'Create an account in seconds — no credit card required.' },
  { step: '2', title: 'Get today\'s term', desc: 'Every day we publish a new AI vocabulary term with a clear definition and example.' },
  { step: '3', title: 'Go Pro for more', desc: 'Upgrade to unlock the full glossary, flashcards, quizzes, and history.' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">AI Daily Terms</span>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="/auth" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          New term published today
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Learn AI vocabulary<br />one term at a time
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          A new AI term every day — with a plain-English definition and real-world example.
          Build fluency in AI without the overwhelm.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/auth" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-lg">
            Start learning free
          </Link>
          <Link href="/pricing" className="text-gray-700 border border-gray-200 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-lg">
            View plans
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white text-xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Everything you need to speak AI</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((f) => (
            <div key={f.title} className="border border-gray-100 rounded-2xl p-6 hover:shadow-sm transition-shadow">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="bg-blue-600 py-20 text-center text-white">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to go deeper?</h2>
          <p className="text-blue-100 text-lg mb-8">
            Upgrade to Pro for the full glossary, flashcards, quizzes, and unlimited history.
          </p>
          <Link href="/pricing" className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-lg inline-block">
            See pricing
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} AI Daily Terms · <Link href="/pricing" className="hover:text-gray-600">Pricing</Link> · <Link href="/auth" className="hover:text-gray-600">Sign in</Link></p>
      </footer>
    </div>
  )
}
