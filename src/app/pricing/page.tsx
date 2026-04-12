'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const plans = [
  {
    name: 'Free',
    price: { monthly: '$0', annual: '$0' },
    priceId: null,
    billing: 'forever',
    features: ['1 term per day', 'Plain-English definitions', 'Real-world examples'],
    cta: 'Get started free',
    highlight: false,
  },
  {
    name: 'Pro Monthly',
    price: { monthly: '$4.99', annual: '$39.99' },
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
    billing: '/month',
    features: ['Everything in Free', 'Full glossary (100+ terms)', 'Flashcards & quizzes', 'Term history', 'Search & filter'],
    cta: 'Start Pro Monthly',
    highlight: true,
  },
  {
    name: 'Pro Annual',
    price: { monthly: '$39.99', annual: '$39.99' },
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID,
    billing: '/year · save 27%',
    features: ['Everything in Pro Monthly', 'Best value', 'Priority support'],
    cta: 'Start Pro Annual',
    highlight: false,
  },
  {
    name: 'Lifetime',
    price: { monthly: '$79.99', annual: '$79.99' },
    priceId: process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID,
    billing: 'one-time',
    features: ['Everything in Pro', 'Pay once, own forever', 'All future verticals included', 'Lifetime updates'],
    cta: 'Get Lifetime Access',
    highlight: false,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  async function handleCheckout(priceId: string | null, planName: string) {
    if (!priceId) {
      router.push('/auth')
      return
    }

    setLoading(planName)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth')
      setLoading(null)
      return
    }

    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    })

    const { url, error } = await res.json()
    if (error) {
      console.error(error)
      setLoading(null)
      return
    }

    window.location.href = url
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">AI Daily Terms</Link>
          <Link href="/auth" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h1>
          <p className="text-xl text-gray-500">Start free. Upgrade when you&apos;re ready to go deeper.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl p-6 border-2 ${plan.highlight ? 'border-blue-500 shadow-lg' : 'border-gray-100'
                } relative flex flex-col`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most popular
                </div>
              )}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">{plan.price.monthly}</span>
                </div>
                <p className="text-sm text-gray-400 mt-0.5">{plan.billing}</p>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => plan.priceId && handleCheckout(plan.priceId, plan.name)}
                disabled={loading === plan.name}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 ${plan.highlight
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-900 text-white hover:bg-gray-700'
                  }`}
              >
                {loading === plan.name ? 'Loading...' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-10">
          All payments are processed securely by Stripe. Cancel anytime.
        </p>
      </div>
    </div>
  )
}
