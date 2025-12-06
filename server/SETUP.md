# MongoDB Backend Setup Guide

## 🎯 Overview

Your productivity app now has a complete backend with MongoDB Atlas for cloud storage and multi-device sync!

## 📋 Prerequisites

- Node.js installed (you already have this)
- MongoDB Atlas account (free tier)
- Internet connection

## 🚀 Step-by-Step Setup

### 1. Create MongoDB Atlas Account (5 minutes)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with your email or Google account
3. Choose the **FREE M0 tier** (512MB storage - perfect for personal use)
4. Select a cloud provider (AWS recommended) and region (choose closest to you)
5. Click "Create Cluster" (takes 1-3 minutes to provision)

### 2. Configure Database Access

1. In MongoDB Atlas dashboard, click "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and **strong password** (save these!)
5. Set user privileges to "Read and write to any database"
6. Click "Add User"

### 3. Configure Network Access

1. Click "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development, click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, you'd restrict this to specific IPs
4. Click "Confirm"

### 4. Get Your Connection String

1. Click "Database" in the left sidebar
2. Click "Connect" button on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/...`)
5. **Important**: Replace `<password>` with your actual database user password

### 5. Configure Backend Environment

1. Navigate to the server directory:
   ```bash
   cd /home/abdul-qadir/myassistant/server
   ```

2. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file and add your values:
   ```env
   MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/productivity?retryWrites=true&w=majority
   JWT_SECRET=your_random_secret_key_here_make_it_long_and_random
   PORT=5000
   NODE_ENV=development
   ```

   **Generate a secure JWT_SECRET**:
   - Visit https://randomkeygen.com/
   - Copy any "Fort Knox Password" and use it as JWT_SECRET

### 6. Install Backend Dependencies

```bash
cd /home/abdul-qadir/myassistant/server
npm install
```

### 7. Start the Backend Server

```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
🚀 Server running on port 5000
📡 API available at http://localhost:5000/api
```

### 8. Test the Backend

Open a new terminal and test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

You should get: `{"status":"OK","message":"Server is running"}`

## 🔧 Next Steps

After the backend is running, I'll update the frontend to:
1. Add login/register pages
2. Connect to the backend API
3. Migrate your localStorage data to MongoDB
4. Enable multi-device sync

## 🆘 Troubleshooting

### "MongoNetworkError: connection refused"
- Check your MongoDB connection string
- Verify your IP is whitelisted in Network Access
- Ensure your database user password is correct

### "JWT_SECRET is not defined"
- Make sure you created the `.env` file
- Verify JWT_SECRET is set in `.env`
- Restart the server after editing `.env`

### Port 5000 already in use
- Change PORT in `.env` to 5001 or another available port
- Update frontend API URL accordingly

## 📊 MongoDB Atlas Dashboard

Access your data at: https://cloud.mongodb.com/

You can:
- View all your data in the "Collections" tab
- Monitor usage and performance
- Set up automated backups
- Upgrade to paid tiers for more storage (if needed later)

## 💰 Free Tier Limits

- **Storage**: 512MB (plenty for personal productivity data)
- **RAM**: 512MB shared
- **Connections**: 500 max
- **Backups**: Manual only (automatic backups in paid tiers)

For a personal productivity app, you'll likely never hit these limits!

## 🔐 Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use strong passwords** for database users
3. **Rotate JWT_SECRET** periodically
4. **Restrict IP access** in production
5. **Enable 2FA** on your MongoDB Atlas account

---

**Ready to proceed?** Let me know when your backend server is running successfully, and I'll update the frontend to connect to it! 🚀
