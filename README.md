

# Stock Management App

A modern inventory and transaction management dashboard built with Next.js, Prisma, and NextAuth.

This project helps businesses track products, monitor stock, record transactions, and generate printable reports with charts.

<img width="1710" height="1112" alt="Screenshot 2026-06-09 at 15 23 26" src="https://github.com/user-attachments/assets/fb964edf-ab03-42d4-8135-b70b38e53a9e" />

## Features

- Secure login and session handling with NextAuth
- Product catalog with stock tracking and low stock alerts
- Transaction history for incoming and outgoing stock
- Dashboard summaries for key inventory metrics
- Printable report page with a stock activity chart
- Responsive admin UI with a sidebar, profile area, and reports link

## Tech Stack

- Next.js App Router
- React + TypeScript
- Prisma ORM
- NextAuth for authentication
- Tailwind CSS for styling
- Recharts for charting

## Local Setup

```bash
npm install
npm run dev
```

Klik this for demo [krisna-stock.vercel.app/login](https://krisna-stock.vercel.app/)

## Project Structure

- `app/` — app routes, pages, and API endpoints
- `components/` — UI components like sidebar, charts, and forms
- `lib/` — helper utilities and auth/database helpers
- `prisma/` — schema, migrations, and seed data
- `public/` — static assets and icons

## Notes

- Configure your database in `prisma/schema.prisma`
- Use `npm run build` to create a production build
- Seed data is available in `prisma/seed.ts`
