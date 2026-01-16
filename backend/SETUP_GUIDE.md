# Backend Setup Guide

Complete guide to set up and run the Odisha Book Store backend.

## ✅ Pre-Setup Checklist

- [x] Node.js installed (v18 or higher)
- [x] MongoDB installed and running (or MongoDB Atlas account)
- [x] Git repository cloned
- [x] `.env` file created in `backend/` directory

## 📋 Step-by-Step Setup

### Step 1: Verify Environment Variables

Your `.env` file should be located at: `backend/.env`

Required content:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/odisha_book_store
JWT_SECRET=your_super_secret_jwt_key_minimum_10_characters
JWT_EXPIRE=30d
API_BASE_URL=http://localhost:5000
```

**Note**:

- Replace `your_super_secret_jwt_key_minimum_10_characters` with a strong random string
- For MongoDB Atlas, use: `mongodb+srv://username:password@cluster.mongodb.net/odisha_book_store`

### Step 2: Install Dependencies

```bash
cd backend
npm install
```

This will install all required packages:

- express
- mongoose
- dotenv
- bcryptjs
- jsonwebtoken
- cors
- winston

### Step 3: Verify Setup

Run the verification script:

```bash
node verify-setup.js
```

This will check:

- ✓ Environment variables are set
- ✓ MongoDB connection string format
- ✓ All dependencies are installed

### Step 4: Start MongoDB

**Option A: Local MongoDB**

```bash
# On Windows (if MongoDB is installed as a service, it's already running)
# Check if running:
# Open MongoDB Compass or check services

# If not running, start MongoDB service:
# Windows Services -> MongoDB Server -> Start
```

**Option B: MongoDB Atlas (Cloud)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env` file

### Step 5: Start the Backend Server

**Development Mode (with auto-reload):**

```bash
npm run dev
```

**Production Mode:**

```bash
npm start
```

You should see:

```
Server running in development mode on port 5000
MongoDB Connected: localhost:27017
```

### Step 6: Test the Server

Open your browser or use curl:

```
http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon (auto-reload)
- `npm run seed` - Seed database with sample books
- `npm test` - Run tests (when implemented)

## 📡 API Endpoints

Once running, your backend exposes:

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Books

- `GET /api/books` - Get all books (with pagination, search, filters)
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Create book (admin only)
- `PUT /api/books/:id` - Update book (admin only)
- `DELETE /api/books/:id` - Delete book (admin only)

### Orders

- `POST /api/orders` - Create new order (protected)
- `GET /api/orders/myorders` - Get user's orders (protected)
- `GET /api/orders/:id` - Get order by ID (protected)
- `PUT /api/orders/:id/pay` - Update order to paid (protected)
- `PUT /api/orders/:id/deliver` - Update order to delivered (admin only)

### Users

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (protected)
- `PUT /api/users/:id` - Update user (protected)
- `DELETE /api/users/:id` - Delete user (admin only)

### Health Check

- `GET /api/health` - Server health check

## 🐛 Troubleshooting

### MongoDB Connection Error

```
Error: MongoDB connection failed
```

**Solutions:**

1. Check if MongoDB is running
2. Verify `MONGODB_URI` in `.env` is correct
3. For Atlas: Check whitelist IP and credentials

### Port Already in Use

```
Error: Port 5000 is already in use
```

**Solutions:**

1. Change `PORT` in `.env` to another port (e.g., 5001)
2. Or kill the process using port 5000

### Missing Environment Variables

```
Error: Cannot read property 'MONGODB_URI' of undefined
```

**Solutions:**

1. Ensure `.env` file exists in `backend/` directory
2. Verify all required variables are set
3. Restart the server after changing `.env`

### Dependencies Not Installed

```
Error: Cannot find module 'express'
```

**Solution:**

```bash
npm install
```

## 📝 Database Schema

### User

- name, email, password
- role (user/admin)
- address, phone

### Book

- title, author, description
- price, category, isbn
- stock, image
- rating, reviews

### Order

- user (reference)
- orderItems (array of {book, quantity, price})
- shippingAddress
- paymentMethod, paymentResult
- itemsPrice, shippingPrice, totalPrice
- isPaid, paidAt
- isDelivered, deliveredAt

## 🚀 Next Steps

1. ✅ Backend is running
2. Set up frontend (see frontend setup guide)
3. Test API endpoints with Postman or similar
4. Seed database with sample books: `npm run seed`

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
