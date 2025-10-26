# Aeroskop Smart AI Storage Calculator

An intelligent application that provides accurate storage recommendations for surveillance camera footage using AI technology.

## Features

- AI-powered storage calculations
- Gemini AI integration for intelligent recommendations
- AWS RDS PostgreSQL database
- Real-time chat interface
- Analytics and usage tracking

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Setup

1. Copy `env.template` to `.env.local`
2. Fill in your environment variables:
   - `DATABASE_URL`: Your PostgreSQL database connection string
   - `GEMINI_API_KEY`: Your Google Gemini AI API key
   - Other configuration variables

## Deployment

This application is designed to run on AWS EC2 with RDS PostgreSQL database.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
