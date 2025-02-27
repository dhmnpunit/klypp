# Klypp - Subscription Management System

Klypp is a modern web application built with Next.js that helps users manage their subscriptions and shared plans. Keep track of your recurring payments, manage members, and never miss a renewal.

## Features

- 👤 User authentication with email and password
- 💳 Create and manage subscription plans
- 👥 Track members for each plan
- 📅 Automatic renewal date calculation
- 💰 Total cost tracking
- 🎨 Modern, responsive UI

## Tech Stack

- **Framework:** Next.js 15.2
- **Authentication:** NextAuth.js
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** Tailwind CSS
- **Language:** TypeScript

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- PostgreSQL database server running
- npm or yarn package manager

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/klypp.git
   cd klypp
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then update the `.env` file with your configuration:
   - Set up your PostgreSQL database URL
   - Generate a NEXTAUTH_SECRET (you can use `openssl rand -base64 32`)
   - Update NEXTAUTH_URL for your environment

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
klypp/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── plan/             # Plan management pages
├── components/            # Reusable components
├── lib/                   # Utility functions and configurations
└── prisma/               # Database schema and migrations
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
