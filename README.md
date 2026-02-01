## Quick Start Guide

### Prerequisites
- MongoDB connection string configured in `server/.env`

### Starting the Application

1. **Start Backend Server**:
   ```bash
   cd server
   npm start
   ```
   Server will run on `http://localhost:5000`

2. **Start Frontend** (in a new terminal):
   ```bash
   npm run dev
   ```
   App will run on `http://localhost:3000`

### Features
- **Guest Mode**: Use the app without login (LocalStorage)
- **Cloud Sync**: Login to sync data to MongoDB
- **Hybrid Storage**: Seamless transition from local to cloud

### API Endpoints
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/finance/data` - Fetch accounts & transactions
- `POST /api/finance/transactions` - Create transaction
- `POST /api/finance/accounts` - Create account

### Status Page
Visit `http://localhost:5000/status` to check server and database connection.
