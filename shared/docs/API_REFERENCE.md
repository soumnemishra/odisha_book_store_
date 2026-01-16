# API Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication

### Register
```
POST /api/auth/register
Body: { name, email, password }
Response: { success, data: { user, token } }
```

### Login
```
POST /api/auth/login
Body: { email, password }
Response: { success, data: { user, token } }
```

### Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { success, data: { user } }
```

## Books

### Get All Books
```
GET /api/books?category=&search=&page=1&limit=10
Response: { success, data: [...books], pagination: {...} }
```

### Get Single Book
```
GET /api/books/:id
Response: { success, data: { book } }
```

### Create Book (Admin)
```
POST /api/books
Headers: Authorization: Bearer <token>
Body: { title, author, description, price, category, stock, ... }
Response: { success, data: { book } }
```

### Update Book (Admin)
```
PUT /api/books/:id
Headers: Authorization: Bearer <token>
Body: { ...fields to update }
Response: { success, data: { book } }
```

### Delete Book (Admin)
```
DELETE /api/books/:id
Headers: Authorization: Bearer <token>
Response: { success, message }
```

## Orders

### Create Order
```
POST /api/orders
Headers: Authorization: Bearer <token>
Body: { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice }
Response: { success, data: { order } }
```

### Get My Orders
```
GET /api/orders/myorders
Headers: Authorization: Bearer <token>
Response: { success, data: [...orders] }
```

### Get Order by ID
```
GET /api/orders/:id
Headers: Authorization: Bearer <token>
Response: { success, data: { order } }
```

### Update Order to Paid
```
PUT /api/orders/:id/pay
Headers: Authorization: Bearer <token>
Body: { paymentResult }
Response: { success, data: { order } }
```

## AI Endpoints (Future)

### Get Recommendations
```
GET /api/ai/recommendations
Headers: Authorization: Bearer <token>
Response: { success, data: [...books] }
```

### AI Search
```
POST /api/ai/search
Body: { query }
Response: { success, data: [...results] }
```

