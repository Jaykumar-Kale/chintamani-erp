# Chintamani ERP

A production-ready billing and lightweight ERP platform for **Shree Chintamani Electricals**, built for day-to-day business operations such as billing, customer management, warranty tracking, analytics, PDF generation, and WhatsApp sharing.

## Live Links

- Frontend (Vercel): https://chintamani-erp.vercel.app
- Backend API (Render): https://chintamani-erp.onrender.com
- Login Page: https://chintamani-erp.vercel.app/login

## Overview

Chintamani ERP is designed for small business workflows where speed and clarity matter. The application is mobile-friendly and optimized for practical usage on phones, tablets, and desktop devices.

Core goals:

- Fast bill creation with itemized inputs
- Customer history and bill traceability
- Warranty status tracking
- Analytics dashboard (revenue, profit, monthly trends)
- PDF generation and WhatsApp-ready bill sharing
- Secure JWT-based authentication

## Key Features

- Authentication: Register and login with JWT token auth
- Billing: Create, read, update, delete bills
- Bill Search: Search by customer name/mobile
- Bill Number Lookup: Find bills directly by bill number
- Customer Module: Customer listing and bill history
- Analytics: Overall and monthly bill/revenue/profit metrics
- Share Workflow: Download/print bill and share via WhatsApp
- Responsive UI: Optimized layout for mobile-first usage

## Tech Stack

### Frontend

- React (CRA)
- React Router
- Tailwind CSS
- Axios
- React Hot Toast
- html2canvas + jsPDF

### Backend

- Node.js
- Express
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- CORS
- dotenv

### Deployment

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## Project Structure

```text
chintamani-erp/
	client/   # React frontend
	server/   # Express API
```

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/Jaykumar-Kale/chintamani-erp.git
cd chintamani-erp
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_secret_key
PORT=5000
```

Run backend:

```bash
npm start
```

### 3. Frontend Setup

```bash
cd ../client
npm install
```

Create `client/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Run frontend:

```bash
npm start
```

Build frontend:

```bash
npm run build
```

## Environment Variables

### Backend (`server/.env`)

- `MONGO_URI` - MongoDB Atlas URI
- `JWT_SECRET` - JWT signing secret
- `PORT` - API server port (default: `5000`)

### Frontend (`client/.env`)

- `REACT_APP_API_URL` - API base URL (example: `https://chintamani-erp.onrender.com/api`)

## API Summary

Base URL:

- Local: `http://localhost:5000/api`
- Production: `https://chintamani-erp.onrender.com/api`

### Auth

- `POST /auth/register`
- `POST /auth/login`

### Bills (Protected)

- `POST /bills`
- `GET /bills`
- `GET /bills/analytics`
- `GET /bills/number/:billNo`
- `GET /bills/:id`
- `PUT /bills/:id`
- `DELETE /bills/:id`

### Customers (Protected)

- `GET /customers`
- `GET /customers/:id`

## Deployment Notes

### Vercel (Frontend)

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `build`
- Required env var: `REACT_APP_API_URL=https://chintamani-erp.onrender.com/api`

### Render (Backend)

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Required env vars: `MONGO_URI`, `JWT_SECRET`

## Production Readiness Checklist

- Mobile responsive layout verified
- Frontend production build passes
- Backend deployed and reachable
- Frontend-backend integration through env-based API URL
- JWT-protected endpoints for business data

## Author

**Jaykumar Kale**

- GitHub: https://github.com/Jaykumar-Kale

## License

This project is currently unlicensed and maintained as a private/portfolio business application.
