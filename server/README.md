# Personal Productivity API - FastAPI Backend

A high-performance FastAPI backend for the Personal Productivity application with MongoDB Atlas integration.

## Features

- ✅ FastAPI framework (high performance)
- ✅ Async MongoDB operations with Motor
- ✅ JWT authentication
- ✅ Pydantic data validation
- ✅ Auto-generated API documentation (Swagger/OpenAPI)
- ✅ CORS enabled
- ✅ Type-safe Python code

## Tech Stack

- **FastAPI**: Modern, fast web framework
- **Motor**: Async MongoDB driver
- **Pydantic**: Data validation
- **PyJWT**: JWT authentication
- **Passlib**: Password hashing (bcrypt)
- **Uvicorn**: ASGI server

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Tasks
- `GET /api/tasks` - Get all tasks (protected)
- `POST /api/tasks` - Create task (protected)
- `PUT /api/tasks/{id}` - Update task (protected)
- `DELETE /api/tasks/{id}` - Delete task (protected)

### Notes
- `GET /api/notes` - Get all notes (protected)
- `POST /api/notes` - Create note (protected)
- `PUT /api/notes/{id}` - Update note (protected)
- `DELETE /api/notes/{id}` - Delete note (protected)

### Goals
- `GET /api/goals` - Get all goals (protected)
- `POST /api/goals` - Create goal (protected)
- `PUT /api/goals/{id}` - Update goal (protected)
- `DELETE /api/goals/{id}` - Delete goal (protected)

### Routines
- `GET /api/routines` - Get all routines (protected)
- `POST /api/routines` - Create routine (protected)
- `PUT /api/routines/{id}` - Update routine (protected)
- `DELETE /api/routines/{id}` - Delete routine (protected)
- `POST /api/routines/{id}/toggle/{date}` - Toggle completion (protected)

## Setup

### 1. Create Virtual Environment

```bash
cd fastapi_server
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 4. Run Development Server

```bash
uvicorn main:app --reload --port 8000
```

Or:

```bash
python main.py
```

## API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Environment Variables

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200
PORT=8000
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173,https://yourapp.vercel.app
```

## Deployment

### Render

1. Create new Web Service
2. Connect GitHub repository
3. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables
5. Deploy!

### Railway

1. Create new project from GitHub
2. Add environment variables
3. Railway auto-detects Python and deploys

## Testing

```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Register user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## Project Structure

```
fastapi_server/
├── main.py              # FastAPI app
├── config.py            # Settings
├── database.py          # MongoDB connection
├── models.py            # Pydantic models
├── auth.py              # Authentication utilities
├── routers/             # API routers
│   ├── auth.py
│   ├── tasks.py
│   ├── notes.py
│   ├── goals.py
│   └── routines.py
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables
└── README.md
```

## Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- Protected routes with dependencies
- CORS configured for allowed origins
- Input validation with Pydantic

## Performance

- Async/await for all database operations
- Connection pooling with Motor
- Fast JSON serialization
- Efficient MongoDB queries

## License

MIT
