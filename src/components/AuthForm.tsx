'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AuthForm() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, vertical_id: 'general' } },
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email to confirm your account, then sign in.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    }

    setLoading(false)
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/[0.08] w-full max-w-sm p-8">
      <div className="text-center mb-8">
        <Link href="/" className="text-xl font-bold text-gray-900 dark:text-slate-100">AI Daily Terms</Link>
        <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm">
          {mode === 'signin' ? 'Welcome back' : 'Create your free account'}
        </p>
      </div>

      {/* Google OAuth */}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 border border-gray-200 dark:border-white/[0.12] rounded-xl py-3 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors mb-6 disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100 dark:border-white/[0.08]" />
        </div>
        <div className="relative flex justify-center text-xs text-gray-400 dark:text-slate-500 bg-white dark:bg-slate-800 px-2">or</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-gray-200 dark:border-white/[0.12] dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your name"
              required
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 dark:border-white/[0.12] dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-200 dark:border-white/[0.12] dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}
        {message && (
          <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm px-4 py-3 rounded-xl">{message}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading
            ? 'Loading...'
            : mode === 'signin'
            ? 'Sign in'
            : 'Start Learning Free'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-6">
        {mode === 'signin' ? (
          <>
            Don&apos;t have an account?{' '}
            <button onClick={() => setMode('signup')} className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Sign up free
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button onClick={() => setMode('signin')} className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Sign in
            </button>
          </>
        )}
      </p>

      <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-4">
        No credit card required · Cancel anytime
      </p>
    </div>
  )
}
