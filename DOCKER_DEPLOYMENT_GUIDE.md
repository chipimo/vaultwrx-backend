# 🐳 Docker Deployment Guide for Azure App Service

## 📚 What is Docker? (Simple Explanation)

Think of Docker like a **shipping container** for your application:

- **Without Docker**: Your app might work on your computer but fail on Azure because of different environments (different Node.js versions, missing files, etc.)
- **With Docker**: Your app is packaged with everything it needs (Node.js, dependencies, code) in a "container" that runs the same way everywhere

### Key Docker Concepts:

1. **Dockerfile**: A recipe/instructions for building your container
2. **Image**: The built container (like a snapshot of your app)
3. **Container**: A running instance of your image
4. **Registry**: A place to store images (like Azure Container Registry)

---

## 🚀 Step-by-Step: Deploy to Azure App Service

### Prerequisites

1. **Azure Account** with an active subscription
2. **Azure CLI** installed (optional, but helpful)
3. **Docker Desktop** installed (for local testing)

---

## Part 1: Set Up Azure Resources

### Step 1: Create Azure Container Registry (ACR)

This is where your Docker images will be stored.

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **"Create a resource"**
3. Search for **"Container Registry"**
4. Click **"Create"**
5. Fill in:
   - **Resource Group**: Create new or use existing
   - **Registry name**: `vaultwrx-registry` (must be globally unique)
   - **Location**: Choose closest to you
   - **SKU**: **Basic** (cheapest for testing)
6. Click **"Review + Create"** → **"Create"**

**Note down**: Your registry name (e.g., `vaultwrx-registry.azurecr.io`)

### Step 2: Create Azure App Service

This is where your app will run.

1. In Azure Portal, click **"Create a resource"**
2. Search for **"Web App"**
3. Click **"Create"**
4. Fill in:
   - **Resource Group**: Same as ACR
   - **Name**: `vaultwrx-backend-service` (must be globally unique)
   - **Publish**: **Container (Docker)**
   - **Operating System**: **Linux**
   - **Region**: Same as ACR
   - **Pricing Plan**: **Basic B1** (or higher for production)
5. Click **"Next: Docker"**
6. Configure Docker:
   - **Image Source**: **Azure Container Registry**
   - **Registry**: Select your ACR
   - **Image**: `vaultwrx-backend-service` (or your image name)
   - **Tag**: `latest`
7. Click **"Review + Create"** → **"Create"**

---

## Part 2: Configure Environment Variables in Azure

Your app needs database credentials and other settings. Set them in Azure App Service:

1. Go to your **App Service** in Azure Portal
2. Click **"Configuration"** in the left menu
3. Click **"+ New application setting"**
4. Add these settings (one by one):

```
NODE_ENV = production
APP_PORT = 3060
APP_NAME = VaultWrx Backend Service
APP_URL = https://vaultwrx-backend-service.azurewebsites.net

# Database Settings
TYPEORM_CONNECTION = postgres
TYPEORM_HOST = your-database-host.postgres.database.azure.com
TYPEORM_PORT = 5432
TYPEORM_DATABASE = your-database-name
TYPEORM_USERNAME = your-database-username
TYPEORM_PASSWORD = your-database-password
TYPEORM_SSL = true
TYPEORM_SSL_REJECT_UNAUTHORIZED = false

# TypeORM Paths
TYPEORM_ENTITIES = dist/api/models/**/*.js
TYPEORM_ENTITIES_DIR = /api/models/**
CONTROLLERS_DIR = /api/controllers/**
MIDDLEWARES_DIR = /api/middlewares/**
EVENTS_DIR = /api/events/**
SUBSCRIBERS_DIR = /api/subscribers/**
RESOLVERS_DIR = /api/resolvers/**
CRON_JOBS_DIR = /api/cron-jobs/**

# Other settings
ENABLE_CRON_JOBS = false
ENABLE_GRAPHQL = false
TYPEORM_LOGGING = false

# Add any other environment variables your app needs
```

5. Click **"Save"** (this will restart your app)

---

## Part 3: Update Azure Pipeline

Your `azure-pipelines.yml` needs to be configured with your actual Azure resources.

### Step 1: Get Your Azure Container Registry Details

1. Go to your **Container Registry** in Azure Portal (VaultwrxRegistry)
2. Click **"Access keys"** in the left menu
3. **Enable** "Admin user" (toggle it ON) - OR use Managed Identity (recommended)
4. Note down:
   - **Login server**: `vaultwrxregistry.azurecr.io`
   - **Registry name**: `VaultwrxRegistry`

### Step 2: Create Azure Service Connection in Azure DevOps

1. Go to your **Azure DevOps** project
2. Click **"Project settings"** (gear icon)
3. Click **"Service connections"** → **"Create service connection"**
4. Select **"Docker Registry"** → **"Azure Container Registry"**
5. Fill in:
   - **Subscription**: Your Azure subscription
   - **Azure container registry**: Select your registry
   - **Service connection name**: `vaultwrx-registry-connection`
6. Click **"Save"**

### Step 3: Update azure-pipelines.yml

Your `azure-pipelines.yml` has been updated with:
- **App Service Name**: `vaultwrx-backend-dev`
- **Registry URL**: `vaultwrxregistry.azurecr.io`
- **Image Repository**: `vaultwrx-backend-service`

**Important**: You still need to create a **Docker Registry Service Connection** in Azure DevOps:
1. Go to Azure DevOps → Project Settings → Service Connections
2. Create new service connection → Docker Registry → Azure Container Registry
3. Select your subscription and `VaultwrxRegistry`
4. Name it: `vaultwrxregistry-connection`
5. This name should match the `dockerRegistry` and `containerRegistry` variables in your pipeline

---

## Part 4: Test Locally (Optional but Recommended)

Before deploying to Azure, test your Docker setup locally:

### Step 1: Build Docker Image Locally

```bash
# Navigate to your project directory
cd /Users/melvin/Documents/work/vaultwrx/VaultWrx-Backend-Service

# Build the production Docker image
docker build --target production-build-stage -t vaultwrx-backend:local .
```

### Step 2: Run Docker Container Locally

```bash
# Run the container (make sure you have a .env file with your database settings)
docker run -p 3060:3060 --env-file .env vaultwrx-backend:local
```

### Step 3: Test Your App

Open your browser: `http://localhost:3060`

If it works locally, it should work in Azure!

---

## Part 5: Deploy via Azure Pipeline

### Step 1: Push Your Code

```bash
git add .
git commit -m "Add Docker deployment configuration"
git push origin main
```

### Step 2: Monitor Pipeline

1. Go to **Azure DevOps** → Your project
2. Click **"Pipelines"** → Your pipeline
3. Watch it build and deploy

The pipeline will:
1. ✅ Build your TypeScript code
2. ✅ Run tests
3. ✅ Build Docker image
4. ✅ Push image to Azure Container Registry
5. ✅ Deploy to Azure App Service

---

## Part 6: Verify Deployment

1. Go to your **App Service** in Azure Portal
2. Click **"Overview"**
3. Click the **URL** (e.g., `https://vaultwrx-backend-service.azurewebsites.net`)
4. You should see your API response!

---

## 🔧 Troubleshooting

### Issue: "Cannot connect to database"

**Solution**: Check your environment variables in Azure App Service Configuration:
- Make sure `TYPEORM_HOST`, `TYPEORM_PASSWORD`, etc. are set correctly
- Ensure `TYPEORM_SSL=true` for Azure PostgreSQL

### Issue: "Image not found"

**Solution**: 
1. Check that your Docker image was pushed to ACR
2. Verify the image name and tag in App Service → Deployment Center

### Issue: "Port not accessible"

**Solution**: 
- Azure App Service automatically maps port 80/443 to your container
- Make sure your app listens on the port specified in `PORT` environment variable (or 3060)
- Update your code to use `process.env.PORT || 3060`

### Issue: "Container keeps restarting"

**Solution**:
1. Check **App Service** → **Log stream** for errors
2. Check **App Service** → **Console** to see container logs
3. Verify all required environment variables are set

---

## 📝 Quick Reference Commands

### Local Docker Commands

```bash
# Build image
docker build --target production-build-stage -t vaultwrx-backend:local .

# Run container
docker run -p 3060:3060 --env-file .env vaultwrx-backend:local

# View running containers
docker ps

# View logs
docker logs <container-id>

# Stop container
docker stop <container-id>

# Remove container
docker rm <container-id>
```

### Azure CLI Commands (Optional)

```bash
# Login to Azure
az login

# Login to Azure Container Registry
az acr login --name vaultwrx-registry

# Push image manually (if needed)
docker tag vaultwrx-backend:local vaultwrxregistry.azurecr.io/vaultwrx-backend-service:latest
docker push vaultwrxregistry.azurecr.io/vaultwrx-backend-service:latest
```

---

## 🎯 Next Steps

1. ✅ Set up Azure Container Registry
2. ✅ Create Azure App Service
3. ✅ Configure environment variables
4. ✅ Update Azure Pipeline
5. ✅ Test locally with Docker
6. ✅ Push code and deploy via pipeline
7. ✅ Monitor and verify deployment

---

## 💡 Pro Tips

1. **Always test locally first** - Build and run Docker locally before deploying
2. **Use staging environment** - Deploy to staging first, then production
3. **Monitor logs** - Use Azure App Service Log stream to debug issues
4. **Set up alerts** - Configure Azure alerts for app failures
5. **Backup database** - Set up automated backups for your PostgreSQL database

---

## 📞 Need Help?

- **Azure Documentation**: https://docs.microsoft.com/azure/app-service/
- **Docker Documentation**: https://docs.docker.com/
- **Azure Support**: Available in Azure Portal

---

**Good luck with your deployment! 🚀**

