# Citrus-Expense-Tracker - Server

A robust RESTful API backend for the NexusPay Finance application, built with Node.js, Express, and MongoDB.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs)
![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-8.2-47A248?logo=mongodb)

## 🚀 Features

- **User Authentication** - Secure JWT-based authentication with HTTP-only cookies
- **Account Management** - CRUD operations for financial accounts/vaults
- **Transaction Tracking** - Full transaction management with balance calculations
- **Fund Transfers** - Transfer money between accounts with paired transactions
- **Data Sync** - Import local guest data when users register/login
- **Rate Limiting** - API protection against abuse
- **Request Logging** - Comprehensive logging for debugging
- **Error Handling** - Centralized error handling with meaningful messages

## 📁 Project Structure

```
server/
├── src/
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT authentication
│   │   ├── errorHandler.js      # Global error handling
│   │   ├── rateLimiter.js       # Rate limiting
│   │   └── validation.js        # Request validation
│   ├── models/
│   │   ├── Account.js           # Account/Vault model
│   │   ├── AccountType.js       # Account type model
│   │   ├── Transaction.js       # Transaction model
│   │   └── User.js              # User model
│   ├── routes/
│   │   ├── authRoutes.js        # Authentication endpoints
│   │   └── financeRoutes.js     # Finance CRUD endpoints
│   ├── utils/
│   │   └── logger.js            # Logging utility
│   └── server.js                # Application entry point
├── views/
│   └── status.ejs               # Server status page
├── package.json
└── .env
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Citrus-Expense-Tracker/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Connection
   MONGO_URI=mongodb://localhost:27017/nexuspay
   # OR for MongoDB Atlas:
   # MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/nexuspay
   
   # JWT Secret (use a strong random string)
   JWT_SECRET=your_super_secret_jwt_key_here
   ```

4. **Start the server**
   
   Development (with hot reload):
   ```bash
   npm run dev
   ```
   
   Production:
   ```bash
   npm start
   ```
   
   The server will be available at `http://localhost:5000`

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon |

## 🔗 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/logout` | User logout | No |
| GET | `/me` | Get current user | Yes |

### Finance (`/api/finance`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all accounts, transactions, types | Yes |
| POST | `/sync` | Sync local data to server | Yes |
| POST | `/accounts` | Create new account | Yes |
| PUT | `/accounts/:id` | Update account | Yes |
| DELETE | `/accounts/cleanup` | Remove duplicate accounts | Yes |
| POST | `/transactions` | Create transaction | Yes |
| PUT | `/transactions/:id` | Update transaction | Yes |
| DELETE | `/transactions/:id` | Delete transaction | Yes |
| DELETE | `/transactions/bulk-delete` | Bulk delete transactions | Yes |
| POST | `/transfer` | Transfer between accounts | Yes |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Redirect to status page |
| GET | `/status` | Server status page (EJS) |
| GET | `/health` | Health check JSON |

## 🔧 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Express.js** | Web framework |
| **Mongoose** | MongoDB ODM |
| **JWT** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **cookie-parser** | Cookie handling |
| **cors** | Cross-origin support |
| **compression** | Response compression |
| **express-rate-limit** | Rate limiting |
| **validator** | Input validation |
| **EJS** | Server-side templates |

## 🔐 Security Features

- **JWT Authentication** - Tokens stored in HTTP-only cookies
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - Prevent brute force attacks
- **CORS Configuration** - Whitelist allowed origins
- **Input Validation** - Sanitize and validate all inputs
- **Secure Cookies** - SameSite and Secure flags in production

## 🌐 CORS Configuration

Allowed origins are configured in `server.js`:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://citrus-expense-tracker.web.app',
  'https://citrus-expense-tracker.firebaseapp.com',
];
```

Add your frontend URL to this list for production.

## 🌐 Deployment

### Vercel

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Heroku

```bash
heroku create nexuspay-backend
heroku config:set MONGO_URI=your_mongo_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set NODE_ENV=production
git push heroku main
```

### Railway / Render

Similar process - add environment variables and deploy.

## 📊 Database Models

### User
- `name` - User's display name
- `email` - Unique email address
- `password` - Hashed password
- `avatar` - Profile picture URL

### Account
- `user` - Reference to User
- `name` - Account name
- `type` - Account type (Family, Salary, etc.)
- `balance` - Current balance
- `cardNumber` - Masked card number
- `cardHolder` - Card holder name
- `color` - Theme color

### Transaction
- `user` - Reference to User
- `account` - Reference to Account
- `type` - 'income' or 'expense'
- `amount` - Transaction amount
- `category` - Transaction category
- `description` - Optional description
- `date` - Transaction date

### AccountType
- `user` - Reference to User
- `label` - Type label
- `theme` - Color theme


