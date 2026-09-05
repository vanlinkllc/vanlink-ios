# Backend Contract Status

The native VanLink iOS app is a secure client of the VanLink backend.

## Confirmed Native-Safe Backend Features

- Auth: `/auth/send-email-code`, `/auth/verify-email-code`, `/auth/forgot-password`, `/auth/reset-password`
- Notifications: `/notifications`, `/notifications/unread-count`, `/notifications/{id}/read`, `/notifications/read-all`, `/notifications/clear-all`
- Wallet: `/wallet/balance`, `/wallet/transactions`, `/wallet/topup`, `/wallet/topup/confirm/{transactionId}`, `/wallet/payout`
- Stripe: `/stripe/payment-intent`, `/stripe/connect/onboard`, `/stripe/connect/account-session`, `/stripe/connect/status`, `/stripe/payout`, `/stripe/vlv/subscribe`, `/stripe/vlv/cancel`, `/stripe/vlv/status`

## Blocked Until Backend Endpoints Exist

Do not add Google API keys or direct privileged Google integration to the native app.

Blocked Google-backed features:

- Places autocomplete
- Place details
- Geocoding
- Route and distance calculation

The native app should call backend-controlled Google proxy endpoints after they are added to the VanLink backend.

## Stripe Client Work Still Required

The backend creates PaymentIntents, Checkout sessions, and Connect sessions. Native card collection still needs a configured native Stripe client SDK using backend-created client secrets. No Stripe secret key should ever be bundled in the app.
