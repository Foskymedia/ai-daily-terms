import Stripe from 'stripe'

export function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

export const PRICE_IDS = {
  proMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
  proAnnual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID!,
  lifetime: process.env.STRIPE_LIFETIME_PRICE_ID!,
} as const
