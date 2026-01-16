# System Design

## Architecture Overview

The Odisha Book Store is a full-stack e-commerce application built with:

### Backend
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Language**: Node.js

### Frontend
- **Framework**: React with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **State Management**: React Context API
- **HTTP Client**: Axios

## Project Structure

```
ODISHA_BOOK_STORE_/
├── backend/          # Express API server
├── frontend/         # React SPA
├── shared/           # Shared constants and documentation
└── scripts/          # DevOps scripts
```

## Database Schema

### User Model
- name, email, password
- role (user/admin)
- address, phone

### Book Model
- title, author, description
- price, category, isbn
- stock, image
- rating, reviews

### Order Model
- user (reference)
- orderItems (array of {book, quantity, price})
- shippingAddress
- paymentMethod, paymentResult
- itemsPrice, shippingPrice, totalPrice
- isPaid, paidAt
- isDelivered, deliveredAt

## Features

### Current
- User authentication (register/login)
- Book catalog with search and filters
- Shopping cart
- Order management
- Admin book management

### Future
- AI-powered recommendations
- AI-enhanced search
- Payment gateway integration
- Email notifications
- Book reviews and ratings
- Wishlist functionality

## Deployment

### Development
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Production
- Docker containerization
- Environment variable configuration
- MongoDB connection string
- JWT secret key

## Security

- Password hashing with bcrypt
- JWT token authentication
- Input validation
- Error handling middleware
- CORS configuration

