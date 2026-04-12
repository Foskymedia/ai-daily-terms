import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Profile } from '@/types'
import BottomNav from '@/components/BottomNav'
import AddToHomeScreen from '@/components/AddToHomeScreen'

async function signOut() {
  'use server'
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/auth')
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null }

  const isPro = profile?.tier === 'pro' || profile?.tier === 'lifetime'

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Desktop nav — hidden on mobile */}
      <nav className="hidden md:block bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-gray-900">AI Daily Terms</Link>
          <div className="flex items-center gap-1">
            <Link href="/dashboard" className="text-sm px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              Today
            </Link>
            <Link
              href="/dashboard/glossary"
              className={`text-sm px-3 py-2 rounded-lg transition-colors ${isPro ? 'text-gray-600 hover:bg-gray-50' : 'text-gray-400 cursor-not-allowed'}`}
            >
              Glossary {!isPro && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded ml-1">Pro</span>}
            </Link>
            <Link
              href="/dashboard/flashcards"
              className={`text-sm px-3 py-2 rounded-lg transition-colors ${isPro ? 'text-gray-600 hover:bg-gray-50' : 'text-gray-400 cursor-not-allowed'}`}
            >
              Flashcards {!isPro && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded ml-1">Pro</span>}
            </Link>
            <Link
              href="/dashboard/quiz"
              className={`text-sm px-3 py-2 rounded-lg transition-colors ${isPro ? 'text-gray-600 hover:bg-gray-50' : 'text-gray-400 cursor-not-allowed'}`}
            >
              Quiz {!isPro && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded ml-1">Pro</span>}
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {!isPro && (
              <Link href="/pricing" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Upgrade to Pro
              </Link>
            )}
            {isPro && (
              <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded-full">PRO</span>
            )}
            <form action={signOut}>
              <button type="submit" className="text-sm text-gray-500 hover:text-gray-700">Sign out</button>
            </form>
          </div>
        </div>
      </nav>

      {/* Mobile header — shown on mobile only */}
      <nav className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="text-lg font-bold text-gray-900">AI Daily Terms</Link>
        <div className="flex items-center gap-3">
          {isPro && (
            <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded-full">PRO</span>
          )}
          {!isPro && (
            <Link href="/pricing" className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold">
              Upgrade
            </Link>
          )}
          <form action={signOut}>
            <button type="submit" className="text-sm text-gray-500">Sign out</button>
          </form>
        </div>
      </nav>

      {/* Main content — extra bottom padding on mobile for bottom nav */}
      <main className="max-w-5xl mx-auto px-4 py-8 md:py-10 pb-24 md:pb-10">
        {children}
      </main>

      {/* Bottom tab bar (mobile only) */}
      <BottomNav isPro={isPro} />

      {/* Add to Home Screen banner */}
      <AddToHomeScreen />
    </div>
  )
}
