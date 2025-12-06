# Deployment Guide - Personal Productivity App

## 🚀 Quick Deploy (Recommended)

### Prerequisites
- GitHub account
- Vercel account (free)
- Render account (free)
- MongoDB Atlas cluster (already set up)

---

## Frontend Deployment (Vercel)

### 1. Prepare Repository
```bash
cd /home/abdul-qadir/myassistant
git init
git add .
git commit -m "Initial commit"
```

### 2. Push to GitHub
- Create new repository on GitHub
- Follow GitHub's instructions to push

### 3. Deploy on Vercel
1. Go to https://vercel.com/
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository
5. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

6. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```
   (Update after deploying backend)

7. Click "Deploy"

### 4. Get Your URL
- Vercel will give you: `https://your-app.vercel.app`
- You can add custom domain later

---

## Backend Deployment (Render)

### 1. Push Backend to GitHub
```bash
cd /home/abdul-qadir/myassistant
# Backend is already in the repo
```

### 2. Deploy on Render
1. Go to https://render.com/
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository
5. Configure:
   - **Name**: productivity-backend
   - **Root Directory**: `server`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

6. **Environment Variables** (Add these):
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://theaiguy066_db_user:YOUR_PASSWORD@cluster0.ofjubxg.mongodb.net/myassistant?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   ```

7. Click "Create Web Service"

### 3. Update Frontend
- Copy your Render backend URL (e.g., `https://productivity-backend.onrender.com`)
- Go back to Vercel
- Update `VITE_API_URL` environment variable
- Redeploy

---

## Alternative: Netlify + Railway

### Frontend (Netlify)
1. Go to https://netlify.com/
2. Drag and drop your `dist` folder (after running `npm run build`)
3. Or connect GitHub repo

### Backend (Railway)
1. Go to https://railway.app/
2. "New Project" → "Deploy from GitHub"
3. Select your repo
4. Add environment variables
5. Deploy

---

## Option 2: Single Server (DigitalOcean/AWS)

### Using DigitalOcean Droplet ($6/month)

1. **Create Droplet**:
   - Ubuntu 22.04
   - Basic plan ($6/month)

2. **SSH into server**:
   ```bash
   ssh root@your_server_ip
   ```

3. **Install Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

4. **Clone and setup**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/myassistant.git
   cd myassistant
   
   # Backend
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB credentials
   pm2 start server.js --name backend
   
   # Frontend
   cd ..
   npm install
   npm run build
   sudo npm install -g serve
   pm2 start "serve -s dist -l 3000" --name frontend
   ```

5. **Setup Nginx**:
   ```bash
   sudo apt install nginx
   # Configure reverse proxy
   ```

---

## Option 3: Docker + Cloud Run (Google Cloud)

### 1. Create Dockerfiles

**Frontend Dockerfile**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

**Backend Dockerfile**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm install
COPY server/ .
EXPOSE 5000
CMD ["npm", "start"]
```

### 2. Deploy to Google Cloud Run
```bash
gcloud run deploy productivity-app --source .
```

---

## MongoDB Atlas Configuration for Production

### 1. Network Access
- Go to MongoDB Atlas
- Network Access → Add IP Address
- Add your deployment server IPs
- Or use `0.0.0.0/0` (less secure but works everywhere)

### 2. Database User
- Ensure `theaiguy066_db_user` has correct password
- Role: `atlasAdmin@admin` (already set)

---

## Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and accessible
- [ ] MongoDB connection working
- [ ] Environment variables set correctly
- [ ] CORS configured for your frontend domain
- [ ] Test user registration
- [ ] Test user login
- [ ] Test creating tasks/notes
- [ ] Verify data persists in MongoDB
- [ ] Check mobile responsiveness
- [ ] Set up custom domain (optional)
- [ ] Enable HTTPS (Vercel/Render do this automatically)

---

## Custom Domain Setup

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Render
1. Go to Settings → Custom Domains
2. Add domain
3. Update DNS

---

## Monitoring & Maintenance

### Free Monitoring Tools
- **Vercel Analytics**: Built-in
- **Render Logs**: Check for errors
- **MongoDB Atlas**: Monitor database usage
- **UptimeRobot**: Free uptime monitoring

### Backup Strategy
- MongoDB Atlas: Enable automated backups (paid feature)
- Or: Export data regularly via the app

---

## Cost Breakdown

### Free Tier (Recommended for starting)
- **Vercel**: Free (100GB bandwidth/month)
- **Render**: Free (750 hours/month, sleeps after 15min inactivity)
- **MongoDB Atlas**: Free (512MB storage)
- **Total**: $0/month

### Paid Tier (Better performance)
- **Vercel Pro**: $20/month
- **Render Starter**: $7/month
- **MongoDB Atlas M10**: $0.08/hour (~$57/month)
- **Total**: ~$84/month

### Budget Option
- **Vercel**: Free
- **Railway**: $5/month
- **MongoDB Atlas**: Free
- **Total**: $5/month

---

## Troubleshooting

### Backend won't connect to MongoDB
- Check MongoDB Atlas IP whitelist
- Verify connection string
- Check environment variables

### Frontend can't reach backend
- Verify CORS settings in backend
- Check `VITE_API_URL` environment variable
- Ensure backend is running

### App is slow
- Render free tier sleeps after 15min
- Upgrade to paid tier for always-on
- Or use Railway/DigitalOcean

---

## Support

For issues:
1. Check Vercel/Render logs
2. Check MongoDB Atlas logs
3. Check browser console for frontend errors
4. Check Network tab for API calls

---

**Ready to deploy? Start with Vercel + Render (free tier) and scale up as needed!** 🚀
