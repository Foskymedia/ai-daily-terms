'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const plans = [
  {
    name: 'Free',
    price: '$0',
    billing: 'forever',
    priceId: null,
    cta: 'Start Learning Free',
    highlight: false,
    features: ['1 term per day', 'Plain-English definitions', 'Real-world examples'],
  },
  {
    name: 'Pro Monthly',
    price: '$4.99',
    billing: '/month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
    cta: 'Start Pro Monthly',
    highlight: true,
    features: [
      'Everything in Free',
      'Full glossary (365+ terms)',
      'Flashcards',
      'Quiz Mode with score tracking',
      'Term history',
    ],
  },
  {
    name: 'Pro Annual',
    price: '$39.99',
    billing: '/year · save 27%',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID,
    cta: 'Start Pro Annual',
    highlight: false,
    features: [
      'Everything in Pro Monthly',
      'Best value',
      '2 months free vs monthly',
    ],
  },
  {
    name: 'Lifetime',
    price: '$79.99',
    billing: 'one-time payment',
    priceId: process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID,
    cta: 'Get Lifetime Access',
    highlight: false,
    features: [
      'Everything in Pro',
      'Pay once, own forever',
      'All future features included',
      'Lifetime updates',
    ],
  },
]

const comparisonRows = [
  { feature: 'Daily term', free: true, pro: true, lifetime: true },
  { feature: 'Plain-English definitions', free: true, pro: true, lifetime: true },
  { feature: 'Real-world examples', free: true, pro: true, lifetime: true },
  { feature: 'Full glossary (365+ terms)', free: false, pro: true, lifetime: true },
  { feature: 'Flashcards', free: false, pro: true, lifetime: true },
  { feature: 'Quiz Mode', free: false, pro: true, lifetime: true },
  { feature: 'Term history', free: false, pro: true, lifetime: true },
  { feature: 'All future features', free: false, pro: false, lifetime: true },
]

const faqs = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes — cancel your Pro subscription at any time from your billing portal. You\'ll retain Pro access until the end of your current billing period.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'All major credit and debit cards (Visa, Mastercard, Amex) via Stripe. No PayPal at this time.',
  },
  {
    q: 'Is there a free trial?',
    a: 'The Free plan is free forever — no trial needed. You can start learning immediately without a credit card.',
  },
  {
    q: 'What happens when my subscription ends?',
    a: 'You\'ll automatically drop back to the Free plan. You keep access to the daily term, but Pro features (Glossary, Flashcards, Quiz) will be locked.',
  },
]

function Check({ locked }: { locked?: boolean }) {
  if (locked) return <span className="text-gray-300 text-lg">✗</span>
  return <span className="text-green-500 text-lg">✓</span>
}

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const router = useRouter()

  async function handleCheckout(priceId: string | null | undefined, planName: string) {
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
          <h1 className="text-[28px] sm:text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h1>
          <p className="text-lg sm:text-xl text-gray-600">Start free. Upgrade when you&apos;re ready to go deeper.</p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl p-6 border-2 relative flex flex-col ${
                plan.highlight ? 'border-blue-500 shadow-lg' : 'border-gray-100'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{plan.billing}</p>
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
                onClick={() => handleCheckout(plan.priceId, plan.name)}
                disabled={loading === plan.name}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 ${
                  plan.highlight
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-900 text-white hover:bg-gray-700'
                }`}
              >
                {loading === plan.name ? 'Loading...' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Feature comparison table */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Compare plans</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-4 font-semibold text-gray-900">Feature</th>
                  <th className="text-center p-4 font-semibold text-gray-900">Free</th>
                  <th className="text-center p-4 font-semibold text-blue-600">Pro</th>
                  <th className="text-center p-4 font-semibold text-gray-900">Lifetime</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? 'bg-gray-50/50' : ''}>
                    <td className="p-4 text-gray-700">{row.feature}</td>
                    <td className="p-4 text-center"><Check locked={!row.free} /></td>
                    <td className="p-4 text-center"><Check locked={!row.pro} /></td>
                    <td className="p-4 text-center"><Check locked={!row.lifetime} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left p-5 flex items-center justify-between font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  {faq.q}
                  <span className="text-gray-400 ml-4 flex-shrink-0">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-50">
                    <p className="pt-4">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500">
          All payments processed securely by Stripe. Cancel anytime.{' '}
          <Link href="/billing" className="hover:text-gray-600 underline">Billing help</Link>
        </p>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-400 mb-3">
            <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-gray-600">Terms</Link>
            <span>·</span>
            <Link href="/contact" className="hover:text-gray-600">Contact</Link>
            <span>·</span>
            <Link href="/billing" className="hover:text-gray-600">Billing</Link>
          </div>
          <p className="text-center text-xs text-gray-400">© 2026 Fosky Media</p>
        </div>
      </footer>
    </div>
  )
}
