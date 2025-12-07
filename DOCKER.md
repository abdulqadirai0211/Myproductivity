# Docker Deployment Guide

## 🐳 Docker Setup

### Prerequisites
- Docker installed
- Docker Compose installed (optional, for easier management)

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

**1. Create `.env` file in project root:**
```bash
cp server/.env.example .env
# Edit .env with your MongoDB URI and secrets
```

**2. Start the backend:**
```bash
docker-compose up -d
```

**3. View logs:**
```bash
docker-compose logs -f backend
```

**4. Stop:**
```bash
docker-compose down
```

### Option 2: Docker CLI

**1. Build the image:**
```bash
cd server
docker build -t myassistant-backend .
```

**2. Run the container:**
```bash
docker run -d \
  --name myassistant-backend \
  -p 8000:8000 \
  -e MONGODB_URI="your_mongodb_uri" \
  -e JWT_SECRET="your_secret" \
  -e JWT_ALGORITHM="HS256" \
  -e ACCESS_TOKEN_EXPIRE_MINUTES="43200" \
  -e CORS_ORIGINS="http://localhost:5173,https://myproductivity.vercel.app" \
  myassistant-backend
```

**3. View logs:**
```bash
docker logs -f myassistant-backend
```

**4. Stop:**
```bash
docker stop myassistant-backend
docker rm myassistant-backend
```

---

## 📦 Dockerfile Features

### Multi-Stage Build
- **Stage 1 (builder)**: Compiles dependencies
- **Stage 2 (final)**: Minimal runtime image
- **Result**: Smaller image size (~200MB vs ~1GB)

### Security
- ✅ Non-root user (`appuser`)
- ✅ Minimal base image (Python 3.11 slim)
- ✅ No unnecessary packages
- ✅ Health checks enabled

### Optimization
- ✅ Layer caching (requirements installed first)
- ✅ `.dockerignore` excludes unnecessary files
- ✅ No cache for pip install (smaller image)

---

## 🌐 Production Deployment

### Deploy to Render

**1. Add Dockerfile to your repo:**
```bash
git add server/Dockerfile server/.dockerignore docker-compose.yml
git commit -m "Add Docker support"
git push origin main
```

**2. In Render Dashboard:**
- Create new "Web Service"
- Connect GitHub repo
- **Docker**: Render auto-detects Dockerfile
- **Root Directory**: `server`
- Add environment variables
- Deploy!

### Deploy to Railway

**1. Push to GitHub** (same as above)

**2. In Railway:**
- Create new project from GitHub
- Railway auto-detects Dockerfile
- Add environment variables
- Deploy!

### Deploy to Google Cloud Run

**1. Build and push to Google Container Registry:**
```bash
cd server
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/myassistant-backend
```

**2. Deploy to Cloud Run:**
```bash
gcloud run deploy myassistant-backend \
  --image gcr.io/YOUR_PROJECT_ID/myassistant-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars MONGODB_URI="...",JWT_SECRET="..."
```

### Deploy to AWS ECS/Fargate

**1. Build and push to ECR:**
```bash
aws ecr create-repository --repository-name myassistant-backend
docker tag myassistant-backend:latest YOUR_ECR_URI/myassistant-backend:latest
docker push YOUR_ECR_URI/myassistant-backend:latest
```

**2. Create ECS task definition and service** (via AWS Console or CLI)

---

## 🧪 Testing the Docker Image

### Test locally:
```bash
# Build
docker build -t myassistant-backend ./server

# Run
docker run -p 8000:8000 \
  -e MONGODB_URI="your_uri" \
  -e JWT_SECRET="secret" \
  myassistant-backend

# Test health endpoint
curl http://localhost:8000/api/health

# Test API docs
open http://localhost:8000/docs
```

---

## 🔧 Troubleshooting

### Container won't start
```bash
# Check logs
docker logs myassistant-backend

# Common issues:
# - Missing environment variables
# - MongoDB connection failed
# - Port already in use
```

### Rebuild after code changes
```bash
# Docker Compose
docker-compose up -d --build

# Docker CLI
docker build -t myassistant-backend ./server --no-cache
```

### Access container shell
```bash
docker exec -it myassistant-backend /bin/bash
```

---

## 📊 Image Size Optimization

Current image: **~200MB**

**Further optimizations:**
- Use `python:3.11-alpine` (even smaller, but may have compatibility issues)
- Remove build dependencies after installation
- Use multi-stage builds (already implemented)

---

## 🔐 Security Best Practices

✅ **Implemented:**
- Non-root user
- Minimal base image
- No secrets in Dockerfile
- Health checks

**Additional recommendations:**
- Use Docker secrets for sensitive data
- Scan images for vulnerabilities (`docker scan`)
- Keep base images updated
- Use specific version tags (not `latest`)

---

## 📝 Environment Variables

Required in production:
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200
PORT=8000
ENVIRONMENT=production
CORS_ORIGINS=https://yourfrontend.com
```

---

## 🎯 Next Steps

1. ✅ Dockerfile created
2. ✅ docker-compose.yml created
3. ✅ .dockerignore created
4. ⏳ Test locally with Docker
5. ⏳ Deploy to production

**Ready to containerize!** 🐳
