<p align="center">
  <img src="https://img.icons8.com/fluency/96/books.png" alt="Odisha Book Store Logo" width="120"/>
</p>

<h1 align="center">📚 Odisha Book Store</h1>

<p align="center">
  <strong>A Full-Stack E-Commerce Platform Celebrating Odia Literature</strong>
</p>

<p align="center">
  <em>Bringing authentic Odia books from Orissa Book Store to readers worldwide</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/MongoDB-6.0+-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Expo-54+-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo"/>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-api-reference">API</a>
</p>

---

## 📖 About

Odisha Book Store is a modern e-commerce platform dedicated to Odia literature, featuring **150+ authentic Odia books** across 20+ categories including Biography, Poetry, Novels, Short Stories, Educational materials, Health, Travel, and Literary Criticism. The platform supports **bilingual titles** (ଓଡ଼ିଆ/English) and provides a rich shopping experience with a built-in AI chatbot assistant.

---

## ✨ Features

### 🛒 Customer Experience
| Feature | Description |
|---------|-------------|
| **Smart Search** | Fuzzy search with Fuse.js - handles typos, autocomplete suggestions |
| **AI Chatbot** | Intent-based assistant for book search, order tracking, recommendations |
| **Bilingual Support** | Books displayed in Odia (ଓଡ଼ିଆ) and English |
| **Shopping Cart** | Persistent cart with real-time price updates |
| **Guest Checkout** | Order without creating an account |
| **Wishlist** | Save books for later |
| **Order Tracking** | Real-time order status updates |

### 👤 User Management
| Feature | Description |
|---------|-------------|
| **JWT Authentication** | Secure token-based auth with bcrypt password hashing |
| **Role-Based Access** | User and Admin roles with protected routes |
| **Profile Management** | Address book, order history, account settings |
| **Password Policies** | Enforced strong passwords (uppercase, lowercase, number) |

### 📚 Book Catalog
| Feature | Description |
|---------|-------------|
| **150+ Books** | Curated collection from Orissa Book Store |
| **20+ Categories** | Biography, Poetry, Novel, Educational, Health, etc. |
| **Discount System** | Original and discounted pricing with percentage display |
| **Soft Delete** | Books are archived, not permanently deleted |
| **Reviews & Ratings** | User reviews with star ratings |

### 🛠️ Admin Panel
| Feature | Description |
|---------|-------------|
| **Dashboard Analytics** | Sales charts with Recharts |
| **Book Management** | Full CRUD with image upload |
| **Order Management** | Status updates (Pending → Delivered) |
| **User Management** | View and manage customers |

### 📱 Mobile App (React Native)
| Feature | Description |
|---------|-------------|
| **Expo SDK 54** | Cross-platform iOS/Android |
| **Native Navigation** | Expo Router with tabs |
| **Zustand State** | Global cart, wishlist, auth state |
| **Animations** | React Native Reanimated |

---

## 🏗️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express.js | 4.18 | Web framework |
| MongoDB | 6.0+ | Database |
| Mongoose | 8.0 | ODM |
| JWT | 9.0 | Authentication |
| Fuse.js | 7.1 | Fuzzy search |
| Winston | 3.11 | Logging |
| Helmet | 8.1 | Security headers |
| Jest | 29.7 | Testing |

### Frontend (Customer App)
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2 | UI library |
| Vite | 7.1 | Build tool |
| TanStack Query | 5.90 | Data fetching |
| Framer Motion | 12.23 | Animations |
| GSAP | 3.14 | Advanced animations |
| Tailwind CSS | 3.3 | Styling |
| Axios | 1.6 | HTTP client |

### Admin Panel
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2 | UI library |
| TypeScript | 5.9 | Type safety |
| Vite | 7.2 | Build tool |
| Recharts | 3.6 | Analytics charts |
| Lucide React | 0.562 | Icons |

### Mobile App
| Technology | Version | Purpose |
|------------|---------|---------|
| Expo | 54.0 | Development platform |
| React Native | 0.81 | Mobile framework |
| Expo Router | 6.0 | File-based routing |
| Zustand | 5.0 | State management |
| React Native Reanimated | 4.1 | Animations |

---

## 📁 Project Structure

```
odisha_book_store/
│
├── 📂 backend/                    # Express.js API Server
│   ├── src/
│   │   ├── controllers/           # Route handlers (7 controllers)
│   │   │   ├── authController.js      # Login, register, profile
│   │   │   ├── bookController.js      # CRUD for books
│   │   │   ├── orderController.js     # Order management
│   │   │   ├── userController.js      # User management
│   │   │   ├── adminController.js     # Admin dashboard
│   │   │   ├── chatbotController.js   # AI chatbot endpoints
│   │   │   └── aiController.js        # AI recommendations
│   │   │
│   │   ├── models/                # MongoDB schemas
│   │   │   ├── Book.js               # Bilingual titles, pricing, reviews
│   │   │   ├── User.js               # Auth, roles, addresses
│   │   │   └── Order.js              # Guest & user orders
│   │   │
│   │   ├── services/              # Business logic
│   │   │   ├── searchService.js      # Fuse.js fuzzy search
│   │   │   ├── chatbotService.js     # Intent detection, responses
│   │   │   ├── authService.js        # JWT, password hashing
│   │   │   └── bookService.js        # Book operations
│   │   │
│   │   ├── middleware/            # Express middleware
│   │   │   ├── authMiddleware.js     # JWT verification
│   │   │   ├── rateLimiter.js        # DDoS protection
│   │   │   └── errorHandler.js       # Global error handling
│   │   │
│   │   ├── routes/                # API routes (8 route files)
│   │   ├── validators/            # Input validation
│   │   ├── utils/                 # Helpers (logger, jwt, cache)
│   │   └── seed/                  # Database seeding (150+ books)
│   │
│   └── scripts/                   # Migration & utility scripts
│
├── 📂 frontend/                   # React Customer Web App
│   └── src/
│       ├── pages/                 # 11 pages
│       │   ├── Home.jsx              # Hero, bestsellers, categories
│       │   ├── Books.jsx             # Catalog with filters
│       │   ├── BookDetails.jsx       # Product page with reviews
│       │   ├── Cart.jsx              # Shopping cart
│       │   ├── Checkout.jsx          # Multi-step checkout
│       │   ├── Orders.jsx            # Order history
│       │   ├── Wishlist.jsx          # Saved items
│       │   └── Login/Register.jsx    # Authentication
│       │
│       ├── components/            # 23+ reusable components
│       │   ├── ChatbotWidget.jsx     # AI assistant
│       │   ├── SearchAutocomplete.jsx # Smart search
│       │   ├── BookCard.jsx          # Product card
│       │   ├── HeroSection.jsx       # Landing hero
│       │   └── ...
│       │
│       └── services/              # API clients
│
├── 📂 admin/                      # React/TypeScript Admin Panel
│   └── src/
│       ├── pages/
│       │   ├── DashboardPage.tsx     # Analytics & charts
│       │   ├── ProductsPage.tsx      # Book management
│       │   ├── OrdersPage.tsx        # Order fulfillment
│       │   └── LoginPage.tsx         # Admin authentication
│       │
│       └── components/            # Admin UI components
│
├── 📂 mobile/                     # React Native / Expo App
│   ├── app/
│   │   ├── (auth)/                # Login, signup screens
│   │   └── (tabs)/                # Main app tabs
│   │       ├── index.jsx             # Home
│   │       ├── cart.jsx              # Cart
│   │       ├── wishlist.jsx          # Wishlist
│   │       ├── orders.jsx            # Order history
│   │       └── profile.jsx           # User profile
│   │
│   ├── components/                # Mobile UI components
│   └── store/                     # Zustand stores
│
├── 📂 shared/                     # Shared resources
│   ├── constants/
│   │   └── categories.json           # Book categories
│   └── docs/
│       ├── API_REFERENCE.md          # API documentation
│       └── SYSTEM_DESIGN.md          # Architecture docs
│
└── docker-compose.yml             # Docker deployment
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **npm** or **yarn**

### 1️⃣ Clone & Install

```bash
# Clone the repository
git clone https://github.com/soumnemishra/odisha_book_store_.git
cd odisha_book_store_

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# (Optional) Install admin panel
cd ../admin
npm install

# (Optional) Install mobile app
cd ../mobile
npm install
```

### 2️⃣ Configure Environment

Create `backend/.env`:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/odisha_book_store

# Authentication (min 32 characters)
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters
JWT_EXPIRE=30d

# URLs
API_BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3️⃣ Seed Database

```bash
cd backend
npm run seed    # Imports 150+ Odia books
```

### 4️⃣ Start Development

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev     # Starts on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev     # Starts on http://localhost:5173
```

**Terminal 3 - Admin (Optional):**
```bash
cd admin
npm run dev     # Starts on http://localhost:5174
```

**Terminal 4 - Mobile (Optional):**
```bash
cd mobile
npx expo start  # Opens Expo Go
```

---

## 📚 API Reference

### Base URL
```
http://localhost:5000/api
```

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login & get JWT token |
| `GET` | `/auth/me` | Get current user profile |

### Books

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/books` | List books (with pagination, filters) |
| `GET` | `/books/:id` | Get single book details |
| `GET` | `/books/search?q=` | Fuzzy search books |
| `GET` | `/books/suggestions?q=` | Autocomplete suggestions |
| `POST` | `/books` | Create book (Admin) |
| `PUT` | `/books/:id` | Update book (Admin) |
| `DELETE` | `/books/:id` | Soft delete book (Admin) |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/orders` | Create new order |
| `GET` | `/orders/myorders` | Get user's orders |
| `GET` | `/orders/:id` | Get order details |
| `PUT` | `/orders/:id/status` | Update order status (Admin) |

### Chatbot

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/chatbot/message` | Send message to chatbot |
| `GET` | `/chatbot/suggestions` | Get quick action suggestions |

### Health & Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |
| `GET` | `/admin/dashboard` | Dashboard analytics (Admin) |

---

## 🐳 Docker Deployment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Services:**
- Backend API: `http://localhost:5000`
- Frontend: `http://localhost:3000`
- MongoDB: `localhost:27017`

---

## 📜 Available Scripts

### Backend
| Script | Description |
|--------|-------------|
| `npm run dev` | Start with nodemon (hot reload) |
| `npm start` | Start production server |
| `npm run seed` | Import 150+ books |
| `npm test` | Run Jest tests |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format |

### Frontend
| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview build |

### Mobile
| Script | Description |
|--------|-------------|
| `npx expo start` | Start Expo |
| `npx expo start --android` | Android emulator |
| `npx expo start --ios` | iOS simulator |

---

## 📂 Book Categories

The platform features books in the following categories:

| Category | Examples |
|----------|----------|
| **Biography** | ପ୍ରିୟଦର୍ଶିନୀ ଇନ୍ଦିରା, ସର୍ଦ୍ଦାର ପଟେଲ |
| **Autobiography** | ମୋ ବାରବୁଲା ଜୀବନ, ସାନ ଗୋଟିଏ ଜୀବନ |
| **Novel** | ଅମାବାସ୍ୟାର ଚନ୍ଦ୍ର, ଜଙ୍ଗଲି ସହର |
| **Short Story** | ଫୁଟରୁ ଫାଟରୁ, ଶକୁନିର ଛକା |
| **Poetry** | ଗାନ୍ଧି ଗାଥା, ଗୀତାଞ୍ଜଳି |
| **Educational** | English Grammar, Word Books |
| **Health** | ଆମ ଯୋଗ ଚିକିତ୍ସା, ସ୍ବାସ୍ଥ୍ୟ Guides |
| **Travel** | ଆଜିର ଆମେରିକା, ମାର୍କିନ୍ ପରିକ୍ରମା |
| **Literary Criticism** | ଉପନ୍ୟାସ ତତ୍ତ୍ଵ, ସାରସ୍ୱତ ସମୀକ୍ଷା |
| **Science** | ବିଜ୍ଞାନ କୁଇଜ୍, ପିରାମିଡ୍ |

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Soumen Mishra**

[![GitHub](https://img.shields.io/badge/GitHub-@soumnemishra-181717?style=flat-square&logo=github)](https://github.com/soumnemishra)

---

<p align="center">
  Made with ❤️ for Odia Literature 📚
</p>

<p align="center">
  <strong>ଓଡ଼ିଆ ସାହିତ୍ୟକୁ ବିଶ୍ୱ ଦରବାରରେ ପହଞ୍ଚାଇବା</strong><br/>
  <em>Bringing Odia Literature to the World</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/ଓଡ଼ିଆ-ସାହିତ୍ୟ-FF6B35?style=for-the-badge" alt="Odia Literature"/>
  <img src="https://img.shields.io/badge/Made_in-Odisha-00A651?style=for-the-badge" alt="Made in Odisha"/>
</p>
