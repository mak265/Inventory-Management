# Inventory Management System

A full-stack web application for managing inventory, orders, sales, and user roles.

## Tech Stack
- **Frontend**: Vue 3 + Vite + TailwindCSS + Pinia + Vue Router
- **Backend**: Node.js + Express + Mongoose
- **Database**: MongoDB
- **Email**: Nodemailer

## Features
- Multi-role authentication (Admin, Engineer, Client)
- Inventory tracking with categories
- Order management and catalog
- Point-of-Sale (POS) system
- Sales history and reports
- Project management
- Audit trail and activity logs
- Password reset and account activation

## Setup

### 1. Clone the repository
```bash
git clone https://github.com/mak265/Inventory-Management.git
cd Inventory-Management
```

### 2. Install dependencies
```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

### 3. Environment variables
Create `.env` files in both `server` and `client` directories:

**server/.env**
```
MONGO_URI=mongodb://localhost:27017/inventory-db
JWT_SECRET=your_jwt_secret
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_password
PORT=5000
```

**client/.env**
```
VITE_API_URL=http://localhost:5000/api
```

### 4. Run the application
```bash
# Start server (from server directory)
npm run dev

# Start client (from client directory)
npm run dev
```
## Default Credentials
After seeding the database, you can login with:
- Admin: `admin@example.com` / `admin123`
- Engineer: `engineer@example.com` / `engineer123`
- Client: `client@example.com` / `client123`
