# FullPrep Backend API

RESTful API backend for the FullPrep coding platform built with Node.js, Express, and MongoDB.

## 🚀 Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.19
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (jsonwebtoken)
- **Security:** Helmet, CORS, bcryptjs
- **Validation:** validator
- **Logging:** Morgan
- **Development:** Nodemon

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/            # Configuration files
│   │   └── db.js         # MongoDB connection
│   ├── controllers/       # Request handlers
│   │   └── authController.js
│   ├── middleware/        # Express middleware
│   │   └── authMiddleware.js
│   ├── models/           # Mongoose models
│   │   └── User.js
│   ├── routes/           # API routes
│   │   ├── authRoutes.js
│   │   └── healthRoutes.js
│   ├── utils/            # Utility functions
│   │   └── generateToken.js
│   └── app.js            # Express app setup
├── server.js             # Server entry point
├── package.json
└── .env                  # Environment variables
```

## 🛠️ Installation

```bash
cd backend
npm install
```

## ⚙️ Configuration

Create `.env` file:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fullprep?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## 🏃 Development

```bash
npm run dev
```

Backend will run on [http://localhost:5000](http://localhost:5000)

## 🏗️ Production

```bash
npm start
```

## 📡 API Endpoints

### Health Check
```
GET  /health              # Basic health check
GET  /api/health          # API health check
GET  /api/ready           # Readiness probe
```

### Authentication
```
POST /api/auth/register   # Create new account
POST /api/auth/login      # Authenticate user
POST /api/auth/logout     # Clear session
GET  /api/auth/me         # Get current user (Protected)
PATCH /api/auth/update-profile  # Update profile (Protected)
```

### 🚧 **MISSING ENDPOINTS** (To be implemented)

#### Problems
```
GET    /api/problems              # List all problems
GET    /api/problems/:id          # Get problem by ID
POST   /api/problems              # Create problem (Admin)
PUT    /api/problems/:id          # Update problem (Admin)
DELETE /api/problems/:id          # Delete problem (Admin)
```

#### Submissions
```
POST   /api/submissions           # Submit code
GET    /api/submissions/:id       # Get submission status
GET    /api/submissions/user      # Get user submissions
```

#### Learning Paths
```
GET    /api/learning-paths        # List learning paths
GET    /api/learning-paths/:id    # Get path details
PATCH  /api/learning-paths/:id/progress  # Update progress
```

#### AI Hints
```
POST   /api/hints/generate        # Generate AI hint
GET    /api/hints/:submissionId   # Get hints for submission
```

#### Analytics
```
GET    /api/analytics/dashboard   # Dashboard stats
GET    /api/analytics/submissions # Submission history
GET    /api/analytics/progress    # Learning progress
```

## 🔒 Authentication

Protected routes require JWT token in:
- **Header:** `Authorization: Bearer <token>`
- **Cookie:** `token=<jwt>`

## 🎯 Current Implementation Status

### ✅ Completed (20%)
- User authentication (register, login, logout)
- JWT token generation and validation
- Password hashing with bcrypt
- User model with XP, streak, level fields
- Basic security middleware (CORS, Helmet, Rate Limiting)
- Health check endpoints
- Error handling middleware

### ❌ Missing (80%)
- Problem management system
- Code execution integration (Judge0)
- Submission queue (Redis + Bull)
- AI hint generation (OpenAI/Claude)
- Gamification logic (XP, streaks)
- Learning path management
- Contest system
- Analytics APIs
- WebSocket support

## 📊 Database Models

### Implemented
- **User** - Authentication and profile

### To Be Implemented
- **Problem** - Coding problems
- **Submission** - Code submissions
- **Tag** - Problem tags
- **LearningPath** - Learning paths
- **UserProgress** - User progress tracking
- **Analytics** - User analytics
- **Contest** - Coding contests
- **ContestSubmission** - Contest submissions

## 🔧 Middleware

- **protect** - JWT authentication
- **restrictTo** - Role-based access control (RBAC)
- **Rate Limiting** - API rate limiting
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security headers

## 🚨 Error Handling

Global error handler catches:
- Mongoose validation errors
- Duplicate key errors (MongoDB)
- Cast errors (invalid ObjectId)
- CORS errors
- Custom application errors

## � Logging

- **Development:** Colorized console logs with Morgan
- **Production:** Combined format logs

## 🧪 Testing

```bash
npm test  # Not yet implemented
```

## 🔗 Related Repositories

- [Frontend Repository](../fullprep-frontend/README.md)
- [DevOps Repository](../fullprep-devops/README.md)

## 👥 Contributors

- **Member 2** - Backend Lead

## 📄 License

MIT
