import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">AI Daily Terms</Link>
          <Link href="/auth" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-12">Last updated: April 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Who we are</h2>
            <p>
              AI Daily Terms is operated by Fosky Media. We provide a daily AI vocabulary service
              at aidailyterms.com. Questions? Email us at{' '}
              <a href="mailto:foskymedia@gmail.com" className="text-blue-600 hover:underline">
                foskymedia@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. What data we collect</h2>
            <p>We collect only what&apos;s necessary to provide the service:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Account data:</strong> email address, name, and password (hashed) when you sign up.</li>
              <li><strong>Usage data:</strong> which terms you&apos;ve viewed, saved, or quizzed yourself on.</li>
              <li><strong>Payment data:</strong> billing information processed by Stripe. We never store your card details.</li>
              <li><strong>Technical data:</strong> browser type, IP address, and basic analytics to improve the product.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. How we use your data</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and improve the AI Daily Terms service.</li>
              <li>To send you the daily term and product-related emails (you can opt out).</li>
              <li>To process payments and manage your subscription.</li>
              <li>To detect and prevent fraud or abuse.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Third-party services</h2>
            <p>We use the following third-party services to operate AI Daily Terms:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                <strong>Supabase</strong> — authentication, database, and storage. Your data is stored
                on Supabase infrastructure (AWS-hosted). See their privacy policy at supabase.com/privacy.
              </li>
              <li>
                <strong>Stripe</strong> — payment processing. We share your email and billing details
                with Stripe to process subscriptions. See their privacy policy at stripe.com/privacy.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data retention</h2>
            <p>
              We keep your data as long as your account is active. If you delete your account,
              we remove your personal data within 30 days. Anonymised usage data may be retained
              for analytics purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Your rights</h2>
            <p>
              You have the right to access, correct, or delete your personal data at any time.
              To exercise these rights, email us at{' '}
              <a href="mailto:foskymedia@gmail.com" className="text-blue-600 hover:underline">
                foskymedia@gmail.com
              </a>
              . We&apos;ll respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Cookies</h2>
            <p>
              We use session cookies to keep you logged in. We don&apos;t use third-party tracking
              cookies or sell your data to advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Changes to this policy</h2>
            <p>
              We may update this policy occasionally. We&apos;ll notify you by email for material
              changes. Continued use of the service constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Contact</h2>
            <p>
              For privacy concerns, contact us at{' '}
              <a href="mailto:foskymedia@gmail.com" className="text-blue-600 hover:underline">
                foskymedia@gmail.com
              </a>
              .
            </p>
          </section>
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
