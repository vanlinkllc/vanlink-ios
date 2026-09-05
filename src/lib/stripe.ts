export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

export function requireStripePublishableKey(): void {
  if (!STRIPE_PUBLISHABLE_KEY) {
    throw new Error(
      'Stripe publishable key is not configured. Set EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY for native card collection.'
    );
  }
}
