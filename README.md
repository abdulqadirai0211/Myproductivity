# My Assistant - Personal Productivity App

A comprehensive personal productivity web application with cloud sync, featuring task management, markdown notes, goal tracking, daily routines, and automated reports.

## 🌟 Features

- ✅ **Task Management** - Create, organize, and track tasks with deadlines and priorities
- 📝 **Markdown Notebook** - Write and organize notes with full markdown support
- 🎯 **Goal Tracking** - Set monthly/weekly goals and break them into milestones
- 🔄 **Daily Routines** - Track daily habits with automatic reset
- 📊 **Progress Dashboard** - Visual analytics and charts
- 📈 **Automated Reports** - Daily, weekly, and monthly performance reports
- ☁️ **Cloud Sync** - Access your data from any device with MongoDB Atlas
- 🔐 **Secure Authentication** - JWT-based user authentication

## 🚀 Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **React Markdown** - Markdown rendering

### Backend
- **FastAPI** - Modern Python web framework
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **PyJWT** - JWT authentication
- **Passlib** - Password hashing (bcrypt)

### Database
- **MongoDB Atlas** - Cloud database (free tier)

## 📂 Project Structure

```
myassistant/
├── src/                    # Frontend React app
│   ├── components/         # React components
│   ├── services/          # API service layer
│   ├── utils/             # Utility functions
│   └── index.css          # Design system
├── server/                # FastAPI backend
│   ├── routers/           # API routers
│   ├── models.py          # Pydantic models
│   ├── auth.py            # Authentication
│   ├── database.py        # MongoDB connection
│   └── main.py            # FastAPI app
└── README.md
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v16+)
- Python 3.8+
- MongoDB Atlas account (free)

### Frontend Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend runs on: `http://localhost:5173`

### Backend Setup

```bash
# Navigate to server directory
cd server

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Run development server
uvicorn main:app --reload --port 8000
```

Backend runs on: `http://localhost:8000`

**API Documentation**: `http://localhost:8000/docs`

## 🌐 Deployment

### Frontend (Vercel)
- Deployed at: https://myproductivity.vercel.app
- Auto-deploys from GitHub main branch

### Backend (Render/Railway)
- FastAPI backend
- Environment variables configured
- MongoDB Atlas connection

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🔐 Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens for secure authentication
- Protected API routes
- User data isolation
- CORS enabled for frontend access

## 🎨 Design

- Modern glassmorphism UI
- Vibrant gradient color scheme
- Smooth animations and transitions
- Fully responsive (mobile & desktop)
- Dark mode optimized

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Resources (All Protected)
- Tasks: Full CRUD operations
- Notes: Full CRUD operations
- Goals: Full CRUD operations
- Routines: Full CRUD + completion tracking

## 🚀 Quick Start

1. **Clone the repository**
2. **Setup MongoDB Atlas** (see server/README.md)
3. **Install frontend dependencies**: `npm install`
4. **Install backend dependencies**: `cd server && pip install -r requirements.txt`
5. **Configure environment**: Create `.env` files
6. **Run backend**: `uvicorn main:app --reload` (in server/)
7. **Run frontend**: `npm run dev` (in root)
8. **Open**: `http://localhost:5173`

## 📝 License

MIT

## 🤝 Contributing

This is a personal project, but feel free to fork and customize!

---

**Built with ❤️ for productivity**
