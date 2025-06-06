# CenterNailsSpa Booking System

A comprehensive booking system for CenterNailsSpa, providing a seamless experience across web and mobile platforms.

## Project Structure

```
centernailsspa/
├── frontend/           # React web application
├── mobile/            # React Native mobile application
├── backend/           # Node.js backend server
└── shared/            # Shared types and utilities
```

## Features

- 📱 Cross-platform support (Web, iOS, Android)
- 🔐 Secure authentication
- 📅 Real-time appointment booking
- 💅 Service catalog management
- 👥 Customer and staff profiles
- 🔔 Appointment reminders
- 💳 Payment processing
- 📊 Admin dashboard

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Mobile**: React Native
- **Backend**: Node.js, Express, MongoDB
- **Authentication**: JWT
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB
- React Native development environment setup

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install

   # Install mobile dependencies
   cd ../mobile
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in each directory
   - Fill in the required environment variables

4. Start the development servers:
   ```bash
   # Start backend
   cd backend
   npm run dev

   # Start frontend
   cd ../frontend
   npm run dev

   # Start mobile
   cd ../mobile
   npm run start
   ```

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License. 