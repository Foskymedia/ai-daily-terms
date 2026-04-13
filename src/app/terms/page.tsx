import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <nav className="border-b border-gray-100 dark:border-white/[0.08]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-slate-100">AI Daily Terms</Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/auth" className="text-sm text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100">Sign in</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-12">Last updated: April 2026</p>

        <div className="space-y-8 text-gray-600 dark:text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-3">1. Agreement</h2>
            <p>
              By creating an account or using AI Daily Terms (aidailyterms.com), you agree to these
              Terms of Service. If you don&apos;t agree, please don&apos;t use the service. These terms
              are provided by Fosky Media.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-3">2. The service</h2>
            <p>
              AI Daily Terms provides a daily AI vocabulary service. The Free plan provides one term
              per day. The Pro plan provides access to the full glossary, flashcards, and quiz mode.
              The Lifetime plan provides permanent Pro access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-3">3. Your account</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must be 13 years or older to create an account.</li>
              <li>You are responsible for keeping your password secure.</li>
              <li>You may not share your account with others.</li>
              <li>One account per person — duplicate accounts may be removed.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-3">4. Payments and subscriptions</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Payments are processed by Stripe. By subscribing, you agree to Stripe&apos;s terms.</li>
              <li>Pro Monthly and Pro Annual subscriptions renew automatically until cancelled.</li>
              <li>You may cancel at any time through your billing portal. Access continues until the end of the paid period.</li>
              <li>Lifetime access is a one-time payment with no recurring charges.</li>
              <li>Refunds are handled on a case-by-case basis. Contact us within 7 days of purchase.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-3">5. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Scrape, copy, or redistribute our content without permission.</li>
              <li>Use the service for any unlawful purpose.</li>
              <li>Attempt to access other users&apos; accounts or data.</li>
              <li>Reverse-engineer or copy the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-3">6. Intellectual property</h2>
            <p>
              All content on AI Daily Terms — including term definitions, examples, and quizzes —
              is owned by Fosky Media. Personal use for learning is permitted; redistribution
              or commercial use requires written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-3">7. Availability</h2>
            <p>
              We aim for high availability but don&apos;t guarantee uninterrupted service. We may
              update, pause, or discontinue features with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-3">8. Limitation of liability</h2>
            <p>
              AI Daily Terms is provided &quot;as is.&quot; To the fullest extent permitted by law,
              Fosky Media is not liable for any indirect, incidental, or consequential damages
              arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-3">9. Changes</h2>
            <p>
              We may update these terms from time to time. Continued use after changes means
              you accept the new terms. We&apos;ll notify you of material changes by email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-3">10. Contact</h2>
            <p>
              Questions? Email us at{' '}
              <a href="mailto:foskymedia@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                foskymedia@gmail.com
              </a>{' '}
              or use our{' '}
              <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">
                contact form
              </Link>
              .
            </p>
          </section>
        </div>
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
