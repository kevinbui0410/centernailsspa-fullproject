# Center Nails Mobile App

A beautiful mobile application for Center Nails Spa, allowing customers to book appointments, manage their loyalty points, and redeem rewards.

## Features

- User authentication (login/register)
- Service booking with Stripe payment integration
- Loyalty points system
- Reward redemption
- Appointment management
- Beautiful UI with nail salon theme

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Studio (for Android development)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd centernails-mobile
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your environment variables:
```
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
API_URL=your_backend_api_url
```

4. Start the development server:
```bash
npm start
# or
yarn start
```

5. Run on your preferred platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your physical device

## Project Structure

```
src/
├── assets/          # Images, fonts, and other static files
├── components/      # Reusable UI components
├── navigation/      # Navigation configuration
├── screens/         # Screen components
│   ├── auth/       # Authentication screens
│   ├── booking/    # Booking related screens
│   └── points/     # Points and rewards screens
├── services/       # API and other services
├── theme/          # Theme configuration
└── utils/          # Utility functions
```

## Development

### Adding New Features

1. Create new components in the `components` directory
2. Add new screens in the `screens` directory
3. Update navigation in `navigation/AppNavigator.tsx`
4. Add new services in the `services` directory

### Styling

The app uses a consistent color scheme defined in `theme/colors.ts`. Use these colors for maintaining the app's visual consistency.

### API Integration

API calls are handled through the `services` directory. Use the provided API service for making HTTP requests to the backend.

## Testing

Run tests using:
```bash
npm test
# or
yarn test
```

## Building for Production

1. Configure app.json with your app details
2. Build for iOS:
```bash
expo build:ios
```

3. Build for Android:
```bash
expo build:android
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
