# Backend Contract Status

The native VanLink iOS app is a secure client of the VanLink backend.

## Confirmed Native-Safe Backend Features

- Auth: `/auth/send-email-code`, `/auth/verify-email-code`, `/auth/forgot-password`, `/auth/reset-password`
- Notifications: `/notifications`, `/notifications/unread-count`, `/notifications/{id}/read`, `/notifications/read-all`, `/notifications/clear-all`
- Wallet: `/wallet/balance`, `/wallet/transactions`, `/wallet/topup`, `/wallet/topup/confirm/{transactionId}`, `/wallet/payout`
- Stripe: `/stripe/payment-intent`, `/stripe/connect/onboard`, `/stripe/connect/account-session`, `/stripe/connect/status`, `/stripe/payout`, `/stripe/vlv/subscribe`, `/stripe/vlv/cancel`, `/stripe/vlv/status`
- Maps: `/maps/places/autocomplete`, `/maps/places/{placeId}`, `/maps/geocode`, `/maps/reverse-geocode`, `/maps/distance`, `/maps/route`

## Google Maps Architecture

Do not add Google API keys or direct privileged Google integration to the native app.

The native app must call the VanLink backend `/maps/*` endpoints only. The backend owns the Google API key and returns sanitized address, distance, duration, and route data.

The `/maps/*` endpoints require backend deployment and one of these backend environment variables:

- `GOOGLE_MAPS_API_KEY`
- `GOOGLE_PLACES_API_KEY`
- `GOOGLE_API_KEY`

Google-backed native features remain unavailable in any environment where the backend does not have a valid Google key or the Google APIs are not enabled.

## Stripe Client Work Still Required

The backend creates PaymentIntents, Checkout sessions, and Connect sessions. Native card collection still needs a configured native Stripe client SDK using backend-created client secrets. No Stripe secret key should ever be bundled in the app.
