# Personal Productivity App - Backend API

Backend server for the Personal Productivity App with MongoDB Atlas integration.

## Features

- ✅ User authentication with JWT
- ✅ Secure password hashing with bcrypt
- ✅ RESTful API for all features
- ✅ MongoDB Atlas cloud database
- ✅ Protected routes with middleware
- ✅ Input validation
- ✅ Error handling

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas (Free Tier)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Tasks
- `GET /api/tasks` - Get all tasks (protected)
- `POST /api/tasks` - Create task (protected)
- `PUT /api/tasks/:id` - Update task (protected)
- `DELETE /api/tasks/:id` - Delete task (protected)

### Notes
- `GET /api/notes` - Get all notes (protected)
- `POST /api/notes` - Create note (protected)
- `PUT /api/notes/:id` - Update note (protected)
- `DELETE /api/notes/:id` - Delete note (protected)

### Goals
- `GET /api/goals` - Get all goals (protected)
- `POST /api/goals` - Create goal (protected)
- `PUT /api/goals/:id` - Update goal (protected)
- `DELETE /api/goals/:id` - Delete goal (protected)

### Routines
- `GET /api/routines` - Get all routines (protected)
- `POST /api/routines` - Create routine (protected)
- `PUT /api/routines/:id` - Update routine (protected)
- `DELETE /api/routines/:id` - Delete routine (protected)
- `POST /api/routines/:id/toggle/:date` - Toggle completion (protected)

## Setup

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Add your MongoDB URI and JWT secret to `.env`

4. Start development server:
   ```bash
   npm run dev
   ```

## Environment Variables

- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT signing
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

## Security

- Passwords are hashed using bcrypt (10 salt rounds)
- JWT tokens expire after 30 days
- All data routes require authentication
- User can only access their own data
- Input validation on all endpoints

## Development

```bash
npm run dev  # Start with nodemon (auto-reload)
npm start    # Start production server
```

## Database Models

- **User**: email, password (hashed), name, createdAt
- **Task**: title, description, deadline, priority, completed, user ref
- **Note**: title, content, tags, user ref
- **Goal**: title, description, period, targetDate, progress, milestones, user ref
- **Routine**: title, description, startTime, endTime, category, completions, user ref

## License

MIT
