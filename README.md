# Chintamani ERP - Enterprise Resource Planning System

> A comprehensive ERP solution for **Shree Chintamani Electricals & Motor Winding** designed to manage bills, customers, inventory, and business analytics with seamless integration for WhatsApp notifications.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen.svg)

---

## Table of Contents

- Overview
- Features
- Tech Stack
- Project Structure
- Installation
- Configuration
- Usage Guide
- API Documentation
- Database Schema
- Deployment
- Troubleshooting
- Contributing
- License

---

## Overview

Chintamani ERP is a full-stack web application that streamlines business operations for an electrical motor winding and repair service company. The system enables efficient bill generation, customer relationship management, warranty tracking, and real-time business analytics—all with a user-friendly interface and mobile-first design.

**Key Capabilities:**
- Instant bill generation with PDF export
- Complete customer relationship management
- Direct WhatsApp integration for customer notifications
- Automated warranty tracking with dynamic calculations
- Real-time dashboard analytics
- Multi-language support (English & Marathi)
- Secure authentication & authorization
- Fully responsive design

**Live Deployment:**
- Frontend: https://chintamani-erp.vercel.app
- Backend API: https://chintamani-erp.onrender.com
- Login Page: https://chintamani-erp.vercel.app/login

---

## Security Notice

This is a confidential business application for authorized users only. Unauthorized access, data manipulation, or attempts to exploit system vulnerabilities are strictly prohibited and may be subject to legal action.

**Security Features:**
- JWT-based authentication with secure token management
- Role-based access control for user actions
- Encrypted database connections with SSL/TLS
- Password hashing with Bcryptjs
- Input validation and SQL injection prevention
- Comprehensive audit logging
- Regular security updates and patches

---

## Features

### Bill Management

- Create professional cash memos with custom items
- Insert custom items on-the-fly without predefined lists
- Automatic bill numbering with sequential tracking
- Cost price tracking for profit calculations
- PDF generation for easy sharing and printing
- Warranty information automatically embedded
- Support for both English and Marathi languages

### Customer Management

- Add and manage unlimited customers
- Store complete customer profiles (name, mobile, address)
- View complete customer history with bill details
- Track customer spending and warranty status
- One-click customer deletion with cascading bill removal
- Search by name or mobile number

### Warranty Tracking

- Automatic 12-month warranty calculation (v1.0 fix)
- Dynamic remaining warranty months display
- Real-time warranty expiry status (Active/Expiring/Expired)
- Visual indicators for warranty status
- Warranty details embedded in bills
- Automatic date-based updates

### Analytics Dashboard

- Real-time revenue tracking
- Profit calculations and analytics
- Monthly financial overview
- Recent bills snapshot
- Total customer base insights
- Total profit since company inception

### WhatsApp Integration

- Send bills directly to customers via WhatsApp
- Pre-filled message templates
- Instant payment request notifications
- Support for multiple languages in messages
- Payment and warranty information included

### User Management

- Secure login authentication
- Session management
- Role-based access control
- Token-based API security

---

## Tech Stack

### Frontend

| Technology | Purpose |
|-----------|---------|
| React.js 19.2.4 | UI framework & component library |
| Tailwind CSS | Utility-first CSS styling |
| React Router DOM | Client-side routing |
| Axios | HTTP client for API calls |
| React Hot Toast | Toast notifications |
| html2canvas | Bill preview to image conversion |
| jsPDF | PDF generation from HTML |
| FontAwesome | Icon library |

### Backend

| Technology | Purpose |
|-----------|---------|
| Node.js | Server runtime environment |
| Express.js | Web application framework |
| MongoDB Atlas | NoSQL cloud database |
| Mongoose | MongoDB object modeling |
| JWT (jsonwebtoken) | Authentication tokens |
| Bcryptjs | Password hashing |
| CORS | Cross-origin resource sharing |

### Deployment

| Service | Purpose |
|---------|---------|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| MongoDB Atlas | Production database |

---

## Project Structure

```
chintamani-erp/
├── client/                          # React frontend application
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── service-worker.js
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.js           # App layout wrapper
│   │   ├── pages/
│   │   │   ├── Login.js            # Authentication page
│   │   │   ├── Dashboard.js        # Analytics & overview
│   │   │   ├── NewBill.js          # Bill creation (MAIN)
│   │   │   ├── AllBills.js         # Bill listing & management
│   │   │   ├── Customers.js        # Customer management
│   │   │   └── Analytics.js        # Detailed analytics
│   │   ├── context/
│   │   │   └── AuthContext.js      # Global auth state
│   │   ├── config/
│   │   │   └── fontawesome.js      # Icon configuration
│   │   ├── utils/
│   │   │   └── api.js              # API client setup
│   │   ├── App.js
│   │   ├── index.js
│   │   └── package.json
│   └── build/                       # Production build output
│
├── server/                          # Express backend application
│   ├── controllers/
│   │   ├── authController.js       # Login/auth logic
│   │   ├── billController.js       # Bill CRUD operations
│   │   └── customerController.js   # Customer CRUD operations
│   ├── models/
│   │   ├── User.js                 # User schema
│   │   ├── Bill.js                 # Bill schema (12-month warranty)
│   │   └── Customer.js             # Customer schema
│   ├── routes/
│   │   ├── authRoutes.js           # Auth endpoints
│   │   ├── billRoutes.js           # Bill endpoints
│   │   └── customerRoutes.js       # Customer endpoints (DELETE)
│   ├── middleware/
│   │   └── auth.js                 # JWT verification
│   ├── config/
│   │   └── database.js             # MongoDB connection
│   ├── index.js                    # Server entry point
│   └── package.json
│
├── README.md                        # This file
└── .gitignore
```

---

## Installation

### Prerequisites

- Node.js (v14+ recommended)
- npm or yarn
- MongoDB Atlas account
- Git

### Step 1: Clone Repository

```bash
git clone https://github.com/Jaykumar-Kale/chintamani-erp.git
cd chintamani-erp
```

### Step 2: Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file
echo "MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chintamani-erp" > .env
echo "JWT_SECRET=your_jwt_secret_key_here" >> .env
echo "PORT=5000" >> .env

# Start server
npm start
```

### Step 3: Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Create .env file (if needed)
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Start development server
npm start
```

### Step 4: Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Login with authorized credentials (configured during setup)

---

## Configuration

### Environment Setup

**Backend Setup Required:**
- Secure MongoDB Atlas connection
- JWT authentication token configuration
- Server port configuration
- CORS settings for frontend communication

**Frontend Setup Required:**
- Backend API endpoint configuration
- Secure cookie settings for token storage

All sensitive configuration values must be stored securely in environment files and never committed to version control.

---

## Usage Guide

### User Login

1. Navigate to login page
2. Enter your authorized email credentials
3. Enter your secure password
4. Click Login to access Dashboard

**Note:** Only authorized users with valid accounts can access the system. Contact administrator for account creation.

### Creating a Bill (Main Workflow)

1. Click "New Bill" button
2. Fill Customer Details:
   - Customer Name (required)
   - Mobile Number (required)
   - Address (optional)
3. Language Selection: English (default) or Marathi
4. Select Items:
   - Check predefined items OR add custom items
   - Enter Quantity and Rate
   - Amount auto-calculates
5. Add Profit Info (optional):
   - Enter your cost price
   - See estimated profit live
6. Generate: Click "Save Bill" → View preview
7. Share: Click WhatsApp to send bill to customer

### Managing Customers

1. Go to Customers tab
2. Search: By name or mobile number
3. View History: Click customer to see all bills and warranty status
4. Delete: Click "Delete Customer" → Automatically deletes all their bills

### Viewing Analytics

1. Go to Dashboard for quick overview
2. See key metrics: Total Bills, Revenue, Monthly Profit, Lifetime Profit
3. View Recent 5 Bills snapshot

---

## API Documentation

The API is secured with JWT authentication. All endpoints require valid authentication tokens issued during login. API endpoints are not documented publicly for security purposes.

For internal development reference, contact the development team directly.

---

## Database Security

The application uses MongoDB Atlas with encrypted connections and secure authentication. Database schema details are kept confidential for security purposes to prevent unauthorized access or data manipulation.

All data is protected with:
- Encrypted database connections (SSL/TLS)
- Strong password hashing (Bcryptjs)
- JWT token-based authentication
- Role-based access control
- Input validation and sanitization

---

## Deployment

### Frontend Deployment (Vercel)

```bash
npm install -g vercel
vercel login
vercel --prod
```

**Vercel Configuration:**
- Root directory: client
- Build command: npm run build
- Output directory: build
- Environment: REACT_APP_API_URL=https://your-api.com/api

### Backend Deployment (Render)

1. Connect GitHub repository
2. Build command: npm install
3. Start command: npm start
4. Environment variables: MONGODB_URI, JWT_SECRET

### Database (MongoDB Atlas)

- Already cloud-hosted
- Update connection string in production .env

---

## Troubleshooting

### General Issues

For technical support and troubleshooting assistance, contact the development team:
- Email: development@company.com
- Phone: +91 9527370207

All issues are handled securely to maintain system integrity.

**Note:** Do not share error messages or system logs publicly as they may contain sensitive information.

---

## Version History

### v1.0.0 - Production Release

Production-ready release with all critical fixes:

- Fixed warranty: 18 months → 12 months
- Implemented cascading delete for customers
- Changed default language to English
- Dynamic warranty calculation
- Professional bill generation
- WhatsApp integration
- Complete analytics dashboard
- Production-ready deployment

---

## Contributing

1. Fork the repository
2. Create feature branch: git checkout -b feature/new-feature
3. Commit changes: git commit -m "Add new feature"
4. Push to branch: git push origin feature/new-feature
5. Submit Pull Request

**Code Standards:**
- Use ES6+ syntax
- Follow Airbnb JavaScript style guide
- Comment complex logic
- Test before submitting PR

---

## License

MIT License - See LICENSE file for details

---

## Contact & Support

For system access, user support, or technical assistance:

Company: Shree Chintamani Electricals & Motor Winding
Location: Hadapsar, Pune
Phone: +91 9527370207 / +91 9970780137

For security concerns or bug reports, contact the development team directly.

---

## Future Enhancements

- Inventory management system
- Purchase order tracking
- Supplier management
- SMS notifications
- Advanced financial reports
- Multi-user roles & permissions
- Mobile app (React Native)
- Machine learning forecasting
- Payment gateway integration
- Email invoice option

---

Built with care by Sagar Kale for Shree Chintamani Electricals

Last Updated: March 2026 | Status: Production Ready
