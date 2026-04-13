import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Profile } from '@/types'
import BottomNav from '@/components/BottomNav'
import AddToHomeScreen from '@/components/AddToHomeScreen'
import DashboardNav from '@/components/DashboardNav'
import OnboardingFlow from '@/components/OnboardingFlow'

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
  const onboardingCompleted = profile?.onboarding_completed ?? false

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <DashboardNav isPro={isPro} />

      {/* Main content — extra bottom padding on mobile for bottom nav */}
      <main className="max-w-5xl mx-auto px-4 py-8 md:py-10 pb-24 md:pb-10">
        {children}
      </main>

      <BottomNav isPro={isPro} />
      <AddToHomeScreen />

      {!onboardingCompleted && (
        <OnboardingFlow userId={user.id} onboardingCompleted={onboardingCompleted} />
      )}
    </div>
  )
}
