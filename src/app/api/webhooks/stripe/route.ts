import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('[webhook] event type:', event.type)

  const supabase = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      console.log('[webhook] checkout.session.completed metadata:', session.metadata)
      const userId = session.metadata?.supabase_user_id
      if (!userId) break

      const isLifetime = session.mode === 'payment'

      await supabase
        .from('profiles')
        .update({
          tier: isLifetime ? 'lifetime' : 'pro',
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: isLifetime ? null : session.subscription as string,
          subscription_status: isLifetime ? 'lifetime' : 'active',
        })
        .eq('id', userId)

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      await supabase
        .from('profiles')
        .update({
          tier: 'free',
          subscription_status: 'cancelled',
          stripe_subscription_id: null,
          current_period_end: null,
        })
        .eq('stripe_customer_id', customerId)

      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscriptionId = (invoice as any).subscription as string | undefined

      if (!subscriptionId) break

      const subscription = await getStripe().subscriptions.retrieve(subscriptionId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const periodEnd = (subscription as any).current_period_end as number | undefined

      await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        })
        .eq('stripe_customer_id', customerId)

      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const periodEnd = (subscription as any).current_period_end as number | undefined

      await supabase
        .from('profiles')
        .update({
          subscription_status: subscription.status,
          current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        })
        .eq('stripe_customer_id', customerId)

      break
    }
  }

  return NextResponse.json({ received: true })
}
