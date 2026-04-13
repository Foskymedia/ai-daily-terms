import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const faqs = [
  {
    q: 'How do I cancel my subscription?',
    a: 'Click "Manage Billing" above to open your Stripe billing portal. From there you can cancel, update your payment method, or download invoices.',
  },
  {
    q: 'What happens after I cancel?',
    a: 'You keep Pro access until the end of your current billing period. After that, you\'ll automatically drop back to the free plan.',
  },
  {
    q: 'Can I get a refund?',
    a: 'We handle refunds on a case-by-case basis. Contact us at foskymedia@gmail.com within 7 days of your purchase.',
  },
  {
    q: 'How do I update my payment method?',
    a: 'Open the Stripe billing portal via the button above. You can update your card, view past invoices, and manage all billing details there.',
  },
  {
    q: 'I\'m on the Lifetime plan — do I ever get billed again?',
    a: 'No. Lifetime is a one-time payment. You\'ll never be charged again.',
  },
  {
    q: 'My payment failed — what should I do?',
    a: 'Stripe will retry automatically. Open the billing portal to update your payment method, or contact us if the issue persists.',
  },
]

export default async function BillingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">AI Daily Terms</Link>
          {user ? (
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</Link>
          ) : (
            <Link href="/auth" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
          )}
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Billing</h1>
        <p className="text-gray-500 mb-12">
          Manage your subscription, update payment details, and view invoices.
        </p>

        {/* Manage billing CTA */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-12 text-center">
          <div className="text-4xl mb-4">💳</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Manage your subscription</h2>
          <p className="text-gray-500 mb-6">
            Update payment methods, cancel, or download invoices — all through Stripe&apos;s
            secure billing portal.
          </p>
          {user ? (
            <a
              href="/api/billing-portal"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Manage Billing →
            </a>
          ) : (
            <div>
              <p className="text-sm text-gray-400 mb-4">You need to be signed in to manage billing.</p>
              <Link
                href="/auth"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Sign in to manage billing
              </Link>
            </div>
          )}
        </div>

        {/* FAQ */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing FAQ</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">
            Still need help?{' '}
            <Link href="/contact" className="text-blue-600 hover:underline">
              Contact us
            </Link>{' '}
            or email{' '}
            <a href="mailto:foskymedia@gmail.com" className="text-blue-600 hover:underline">
              foskymedia@gmail.com
            </a>
          </p>
        </div>
      </div>

      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-3xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-400">
          <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-gray-600">Terms</Link>
          <span>·</span>
          <Link href="/contact" className="hover:text-gray-600">Contact</Link>
          <span>·</span>
          <Link href="/billing" className="hover:text-gray-600">Billing</Link>
        </div>
        <p className="text-center text-xs text-gray-400 mt-3">© 2026 Fosky Media</p>
      </footer>
    </div>
  )
}
