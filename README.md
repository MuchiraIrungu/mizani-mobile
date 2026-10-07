# Mizani Mobile

Mizani Mobile is the mobile companion for the Mizani platform — a React Native + Expo app built for sales teams, field operators, and SME owners who need fast access to inventory, orders, customer status, and business activity while on the move.

It is designed for a mobile-first workflow with clean navigation, role-aware screens, and a lightweight architecture that can talk to a backend service for authentication, data syncing, and reporting.

## Overview

Mizani Mobile helps businesses manage day-to-day operations from a phone without forcing users to sit at a desktop dashboard. The app is built to support:

- Quick login and secure session handling
- Sales and order workflows
- Inventory and product visibility
- Customer and supplier lookups
- Business overview screens for managers and staff
- A responsive, low-friction experience for field use

## Tech Stack

- React Native with Expo
- TypeScript
- Expo Router for file-based navigation
- NativeWind for utility-first styling
- Zustand for lightweight state management
- AsyncStorage / SecureStore for local persistence
- Axios for API integration
- React Navigation for app flows

## Key Features

- Mobile-first dashboard experience
- Product and inventory browsing
- Sales or order tracking flows
- Customer and profile management
- Secure auth/session persistence
- Role-based UI patterns for different user types
- Clean design system and reusable screen components
- Works well for rapid prototyping and iteration

## Project Structure

```bash
mizani-mobile/
├── app/                 # Expo Router screens and routes
├── components/          # Reusable UI components
├── constants/           # Shared constants and theme values
├── hooks/               # Custom hooks
├── services/            # API calls and backend integrations
├── store/               # Zustand stores
├── types/               # Shared TypeScript types
├── assets/              # Images, fonts, icons, and static resources
├── scripts/             # Project scripts and helper tasks
├── app.json             # Expo app configuration
├── babel.config.js      # Babel config
├── global.css           # NativeWind / global style entry
├── metro.config.js      # Metro bundler config
├── package.json         # App dependencies and scripts
├── tailwind.config.js   # Tailwind setup
├── tsconfig.json        # TypeScript config
├── README.md            # Project documentation
└── .gitignore
```

## Getting Started

### Prerequisites

Before running the app, make sure you have installed:

- Node.js 18+
- npm or yarn
- Expo CLI
- Android Studio / Xcode if you want to run emulators

### Install dependencies

```bash
npm install
```

### Start the app

```bash
npx expo start
```

You can then open the app in:

- Expo Go on a physical device
- Android emulator
- iOS simulator
- Web preview if supported

## Environment Configuration

For local development, create a `.env` file if the app needs backend configuration:

```env
EXPO_PUBLIC_API_URL=http://localhost:8080
EXPO_PUBLIC_ENV=development
```

If your backend exposes different routes, update the service layer in `services/` and the environment variables accordingly.

## Authentication and Session Handling

The app is structured to support secure authentication patterns using stored tokens and session data. The expected flow is:

1. User logs in with email/password or other configured auth
2. Access token is stored securely
3. Protected requests use the token in the API layer
4. Session data is restored on app launch when available

The app uses secure storage and local persistence so the session can survive restarts without forcing repeated logins.

## Development Notes

### Routing

The app uses Expo Router with file-based organization inside the `app/` directory. This keeps screens, layouts, and flows simple to navigate and extend.

### Styling

The project uses NativeWind and Tailwind utilities to keep styling consistent and fast to implement. Shared design tokens live in the constants and styling layers, making it easier to build consistent UI screens.

### State Management

Zustand is used for app-level state such as session details, user data, and cross-screen app state. The local pattern keeps the app lightweight while still allowing reusable state across screens.

## Recommended Workflow

- Create feature screens under `app/`
- Keep reusable UI in `components/`
- Put API logic in `services/`
- Store user or app state in `store/`
- Reuse `types/` for consistent TypeScript contracts

## Scripts

From `package.json`:

```bash
npm run start
npm run android
npm run ios
npm run web
npm run lint
```

## Roadmap

The project is structured for ongoing expansion with features such as:

- richer analytics dashboards
- product stock management
- improved order workflows
- offline sync support
- stronger role-based access control
- payment and reconciliation flows

## License

Copyright (c) 2026 MuchiraIrungu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
