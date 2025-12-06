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

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (free tier)

### Installation

1. **Clone or navigate to the project**:
   ```bash
   cd /home/abdul-qadir/myassistant
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Install backend dependencies**:
   ```bash
   cd server
   npm install
   ```

4. **Configure MongoDB** (see [Backend Setup](#backend-setup) below)

### Running the Application

You need to run both the backend and frontend:

**Terminal 1 - Backend**:
```bash
cd server
npm run dev
```
Backend runs on: `http://localhost:5000`

**Terminal 2 - Frontend**:
```bash
npm run dev
```
Frontend runs on: `http://localhost:5173`

Open `http://localhost:5173` in your browser!

## 🔧 Backend Setup

### 1. Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up (free)
3. Create a new cluster (M0 Free tier - 512MB)
4. Create a database user with password
5. Whitelist your IP (or use 0.0.0.0/0 for development)
6. Get your connection string

### 2. Configure Environment Variables

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your values:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/myassistant?retryWrites=true&w=majority
   JWT_SECRET=your_random_secret_key_here
   PORT=5000
   NODE_ENV=development
   ```

**Important**: 
- Replace `username:password` with your MongoDB database user credentials
- Generate a secure JWT_SECRET at https://randomkeygen.com/

For detailed setup instructions, see [server/SETUP.md](server/SETUP.md)

## 📱 First Time Use

1. **Create an account**: Open the app and register with your email
2. **Login**: Use your credentials to access the app
3. **Migrate existing data** (if you used localStorage version):
   - Open browser console (F12)
   - Run: `window.migrateData()` (feature coming soon)
4. **Start being productive!**

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **React Markdown** - Markdown rendering

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📂 Project Structure

```
myassistant/
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── services/          # API service layer
│   ├── utils/             # Utility functions
│   └── index.css          # Design system
├── server/                # Backend source
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── config/            # Configuration
│   └── server.js          # Main server file
└── README.md
```

## 🔐 Security

- Passwords are hashed with bcrypt (10 salt rounds)
- JWT tokens for secure authentication
- Protected API routes
- User data isolation
- CORS enabled for local development

## 💾 Data Storage

- **Cloud**: MongoDB Atlas (primary storage)
- **Local**: Browser localStorage (legacy, for migration)
- **Sync**: Automatic cloud sync across devices

## 🆘 Troubleshooting

### Backend won't start
- Check MongoDB connection string in `.env`
- Verify database user credentials
- Ensure IP is whitelisted in MongoDB Atlas

### Can't login
- Make sure backend is running on port 5000
- Check browser console for errors
- Verify MongoDB connection

### Port already in use
- Change `PORT` in `server/.env`
- Update `API_URL` in `src/services/api.js`

## 📊 MongoDB Atlas Dashboard

Access your data: https://cloud.mongodb.com/

- View collections
- Monitor usage
- Manual backups
- Performance metrics

## 🎨 Design

- Modern glassmorphism UI
- Vibrant gradient color scheme
- Smooth animations and transitions
- Fully responsive (mobile & desktop)
- Dark mode optimized

## 📝 License

MIT

## 🤝 Contributing

This is a personal project, but feel free to fork and customize!

---

**Built with ❤️ for productivity**
