# Gear Up Backend

Gear Up Backend is the server-side API for a gear rental platform. It provides user authentication, gear management, rental ordering, reviews, and Stripe-based payments for customers and providers.

## Api Documentation Link-

https://documenter.getpostman.com/view/40260868/2sBY4LSN7r

## Live Link-

https://gear-up-backend-ebon.vercel.app/

## Admin Credentials

email: ijesun30@gmail.com
pass: 12345678

## Features

- User registration, login, and token refresh
- Role-based authentication for customers, providers, and admins
- Category management
- Gear listing, creation, update, and deletion
- Provider-specific gear management
- Rental order creation and tracking
- Review submission for gear and services
- Secure payment flow with Stripe Checkout and webhook support
- Centralized error handling and standardized API responses

## Technology Stack

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT for authentication
- Stripe for payments
- Cookie-based auth support
- CORS and dotenv

## Project Structure

- src/app/modules/auth - authentication routes and controllers
- src/app/modules/category - category management
- src/app/modules/gear - gear CRUD and provider gear APIs
- src/app/modules/rental - rental order APIs
- src/app/modules/review - review APIs
- src/app/modules/payment - Stripe checkout and webhook APIs
- prisma - Prisma schema and migrations

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- PostgreSQL database

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add the required environment variables
4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file with the following variables:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=your_postgresql_connection_string
APP_URL=http://localhost:3000

JWT_ACCESS_TOKEN=your_access_token_secret
JWT_REFRESH_TOKEN=your_refresh_token_secret
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

BCRYPT_SALT_ROUNDS=10

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Available Scripts

```bash
npm run dev      # start development server
npm run build    # compile TypeScript
npm run start    # run compiled production build
npm run stripe:webhook  # start Stripe webhook listener
```

## API Overview

The API is organized under these base routes:

- `/api/auth` - authentication
- `/api/categories` - category endpoints
- `/api/gear` - gear endpoints
- `/api/provider` - provider-specific routes
- `/api/rentals` - rental order endpoints
- `/api/reviews` - review endpoints
- `/api/payments` - Stripe payments and webhook endpoints
- `/api/admin` - admin endpoints

## License

This project is licensed under ISC.
