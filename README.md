<p align="center">
  <img src="https://img.icons8.com/color/96/books.png" alt="Odisha Book Store Logo" width="100"/>
</p>

<h1 align="center">📚 Odisha Book Store</h1>

<p align="center">
  <strong>A Modern Full-Stack E-Commerce Platform for Odia Literature</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#api-docs">API Docs</a> •
  <a href="#deployment">Deployment</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/MongoDB-6.0+-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License"/>
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square" alt="PRs Welcome"/>
  <img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
</p>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🛒 Shopping Experience
- **Smart Search** with autocomplete & filters
- **Shopping Cart** with persistent storage
- **Wishlist** for saving favorites
- **Category Browsing** for easy navigation

</td>
<td width="50%">

### 👤 User Management
- **JWT Authentication** with secure tokens
- **Role-based Access** (User/Admin)
- **Profile Management** with order history
- **Password Encryption** with bcrypt

</td>
</tr>
<tr>
<td width="50%">

### 📚 Book Catalog
- **Bilingual Support** (Odia/English)
- **Rich Book Details** with images
- **Stock Management** for inventory
- **Category Organization** for browsing

</td>
<td width="50%">

### 🛠️ Admin Panel
- **Dashboard Analytics** for insights
- **Book CRUD Operations** for management
- **Order Management** for fulfillment
- **User Administration** for control

</td>
</tr>
</table>

### 🚀 Coming Soon
- 🤖 AI-Powered Book Recommendations
- 💳 Payment Gateway Integration (Razorpay)
- 📱 React Native Mobile App
- 📧 Email Notifications

---

## 🏗️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white) | Runtime Environment |
| ![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white) | Web Framework |
| ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white) | Database |
| ![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white) | Authentication |
| ![Jest](https://img.shields.io/badge/Jest-C21325?style=flat-square&logo=jest&logoColor=white) | Testing |

### Frontend
| Technology | Purpose |
|------------|---------|
| ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black) | UI Library |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) | Build Tool |
| ![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) | Styling |
| ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=reactrouter&logoColor=white) | Navigation |

### Admin Panel
| Technology | Purpose |
|------------|---------|
| ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black) | UI Library |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) | Type Safety |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) | Build Tool |

### Mobile App
| Technology | Purpose |
|------------|---------|
| ![Expo](https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white) | Development Platform |
| ![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=flat-square&logo=react&logoColor=black) | Mobile Framework |

---

## 📁 Project Structure

```
odisha_book_store/
├── 📂 backend/              # Express.js API Server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, validation, etc.
│   │   ├── services/        # Business logic
│   │   └── utils/           # Helper functions
│   ├── scripts/             # Migration & utility scripts
│   └── tests/               # Jest test suites
│
├── 📂 frontend/             # React Customer App
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   ├── services/        # API client
│   │   └── context/         # React context providers
│   └── public/              # Static assets
│
├── 📂 admin/                # React Admin Panel (TypeScript)
│   └── src/
│       ├── components/      # Admin UI components
│       ├── pages/           # Admin pages
│       └── services/        # Admin API client
│
├── 📂 mobile/               # React Native App (Expo)
│   ├── app/                 # Expo Router screens
│   ├── components/          # Mobile components
│   └── store/               # State management
│
├── 📂 shared/               # Shared constants & docs
└── 📂 scripts/              # Deployment scripts
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **npm** or **yarn**

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/soumnemishra/odisha_book_store_.git
cd odisha_book_store_
```

### 2️⃣ Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3️⃣ Setup Frontend

```bash
cd ../frontend
npm install
```

### 4️⃣ Configure Environment Variables

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/odisha_book_store
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters
JWT_EXPIRE=30d
```

**Frontend** (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 5️⃣ Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6️⃣ Open in Browser

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

---

## 📖 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login user |
| `GET` | `/auth/profile` | Get user profile |

### Book Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/books` | Get all books |
| `GET` | `/books/:id` | Get book by ID |
| `POST` | `/books` | Create book (Admin) |
| `PUT` | `/books/:id` | Update book (Admin) |
| `DELETE` | `/books/:id` | Delete book (Admin) |

### Order Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/orders` | Get user orders |
| `POST` | `/orders` | Create new order |
| `GET` | `/orders/:id` | Get order details |

> 📚 Full API documentation available at [shared/docs/API_REFERENCE.md](./shared/docs/API_REFERENCE.md)

---

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Services
- **Backend API**: http://localhost:5000
- **Frontend**: http://localhost:3000
- **MongoDB**: localhost:27017

---

## 🧪 Testing

### Run Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration
```

---

## 📜 Available Scripts

### Backend

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start dev server with hot reload |
| `npm run seed` | Seed database with sample books |
| `npm test` | Run test suite |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

### Frontend

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 🤝 Contributing

Contributions are always welcome! Here's how you can help:

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

- GitHub: [@soumnemishra](https://github.com/soumnemishra)

---

<p align="center">
  Made with ❤️ for Odia Literature 📚
</p>

<p align="center">
  <img src="https://img.shields.io/badge/ଓଡ଼ିଆ-ପ୍ରେମ-orange?style=for-the-badge" alt="Odia Pride"/>
</p>
