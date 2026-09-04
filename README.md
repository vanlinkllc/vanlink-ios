# VanLink Mobile App

A React Native + Expo + TypeScript iOS application for VanLink, connecting to the existing backend API.

## Project Structure

```
vanlink-ios/
├── src/
│   ├── screens/          # App screens (Login, Home, Account)
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom hooks (useAuth, etc)
│   ├── lib/              # API client and services
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── constants/        # App constants
│   ├── navigation/       # Navigation setup
│   └── App.tsx           # Main app component
├── assets/               # App assets (icons, images)
├── app.json              # Expo configuration
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── babel.config.js       # Babel config for Expo
```

## Setup

### Prerequisites
- Node.js 16+ and npm
- Expo CLI: `npm install -g expo-cli`
- Xcode (for iOS development)
- iOS Simulator or physical iPhone

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create/update `.env` file with API configuration:
```
EXPO_PUBLIC_API_URL=https://vanlinkllc-backend-production.up.railway.app
```

3. Start the development server:
```bash
npm start
```

4. Run on iOS simulator:
```bash
npm run ios
```

## Architecture

### Authentication
- JWT-based authentication with AsyncStorage token persistence
- Zustand for state management (`useAuth` hook)
- Automatic token refresh on app initialization
- Role-based access control (customer, driver, business, logistics, admin)

### API Integration
- Axios-based API client (`src/lib/api-client.ts`)
- Reuses backend endpoints from the existing NestJS API
- Token management and request/response interceptors
- Error handling with automatic 401 logout

### UI Components
- Custom native components (TextInput, Button)
- React Navigation for app navigation
- Native iOS styling and UI patterns
- Tab-based navigation for authenticated users

## Key Features

- ✅ User authentication (login/logout)
- ✅ Profile viewing and management
- ✅ Role-based UI
- ✅ Wallet balance display
- ✅ Job viewing and acceptance
- ✅ Performance stats and ratings
- 🔄 Connection to existing VanLink backend API
- 🔄 Push notifications (planned)
- 🔄 Real-time job updates (planned)
- 🔄 Map integration for deliveries (planned)

## Development

### Hot Reload
The app supports fast refresh for quick development iteration. Changes to `.tsx` and `.ts` files are automatically reloaded.

### Debugging
- Use Expo DevTools: Press `j` for logs, `r` for reload, `m` for menu
- Use React Native Debugger for more detailed debugging
- Check browser DevTools at http://localhost:19000

### Building for Production
```bash
npm run build
eas build --platform ios
```

## Integration with Existing Backend

The mobile app connects to the same backend API as the web frontend:
- **API Base URL**: `https://vanlinkllc-backend-production.up.railway.app`
- **Authentication**: JWT tokens sent in Authorization header
- **Endpoints**: Reuses all existing backend endpoints (auth, jobs, wallet, etc)
- **Data Models**: Shares types with backend (Profile, Job, Bid, WalletTransaction)

## Migration Notes

The existing VanLink React/Vite web frontend in the parent repository remains **completely unchanged**. The mobile app is a separate codebase that shares:
- Same backend API
- Same authentication flows
- Same business logic and data models
- Same user roles and permissions

## Next Steps

1. Complete authentication flow (password reset, email verification)
2. Build job listing and search screens
3. Implement job details and bidding UI
4. Add payment/wallet screens
5. Integrate push notifications
6. Add real-time updates
7. Implement driver map view
8. Add customer tracking

## Troubleshooting

### Metro bundler errors
```bash
npm start -- --clear
```

### Dependencies not installed
```bash
npm install
npm install --save-peer react-native
```

### iOS build issues
```bash
npx expo prebuild --clean
npm run ios
```

### API connection issues
- Verify `.env` has correct `EXPO_PUBLIC_API_URL`
- Check backend is running at specified URL
- Verify network connectivity in iOS simulator
