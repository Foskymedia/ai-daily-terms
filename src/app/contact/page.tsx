'use client'

import { useState } from 'react'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })
      if (!res.ok) throw new Error('Failed to send')
      setSuccess(true)
    } catch {
      setError('Something went wrong. Please email us directly at foskymedia@gmail.com.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <nav className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-white/[0.08]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-slate-100">AI Daily Terms</Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/auth" className="text-sm text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100">Sign in</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100 mb-2">Contact us</h1>
        <p className="text-gray-500 dark:text-slate-400 mb-12">
          Have a question, feedback, or need help? We&apos;d love to hear from you.
        </p>

        {success ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">✓</div>
            <h2 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">Message sent!</h2>
            <p className="text-green-700 dark:text-green-400">
              Thanks for reaching out. We&apos;ll get back to you within 1–2 business days.
            </p>
            <Link
              href="/"
              className="inline-block mt-6 text-sm text-green-700 dark:text-green-400 font-medium hover:underline"
            >
              ← Back to home
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-white/[0.08] p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                className="w-full border border-gray-200 dark:border-white/[0.12] rounded-xl px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full border border-gray-200 dark:border-white/[0.12] rounded-xl px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                placeholder="How can we help?"
                className="w-full border border-gray-200 dark:border-white/[0.12] rounded-xl px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl border border-red-100 dark:border-red-800/40">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send message'}
            </button>

            <p className="text-xs text-center text-gray-500 dark:text-slate-400">
              Or email us directly at{' '}
              <a href="mailto:foskymedia@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                foskymedia@gmail.com
              </a>
            </p>
          </form>
        )}
      </div>

      <footer className="border-t border-gray-100 dark:border-white/[0.08] py-8">
        <div className="max-w-3xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-400 dark:text-slate-500">
          <Link href="/privacy" className="hover:text-gray-600 dark:hover:text-slate-300">Privacy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-gray-600 dark:hover:text-slate-300">Terms</Link>
          <span>·</span>
          <Link href="/contact" className="hover:text-gray-600 dark:hover:text-slate-300">Contact</Link>
          <span>·</span>
          <Link href="/billing" className="hover:text-gray-600 dark:hover:text-slate-300">Billing</Link>
        </div>
        <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-3">© 2026 Fosky Media</p>
      </footer>
    </div>
  )
}
