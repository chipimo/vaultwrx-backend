# ✅ Azure App Service Setup Checklist

Use this checklist to deploy your app to Azure App Service with Docker.

## 📋 Pre-Deployment Checklist

### Step 1: Create Azure Resources
- [ ] Create **Azure Container Registry (ACR)**
  - Name: `vaultwrx-registry` (or your choice)
  - Location: Choose closest to you
  - SKU: Basic
  - **Note down**: Registry name (e.g., `vaultwrx-registry.azurecr.io`)

- [ ] Create **Azure App Service**
  - Name: `vaultwrx-backend-service` (or your choice)
  - Publish: **Container (Docker)**
  - OS: **Linux**
  - Pricing Plan: Basic B1 or higher
  - **Note down**: App Service name

### Step 2: Configure Azure DevOps
- [ ] Create **Docker Registry Service Connection** in Azure DevOps
  - Go to: Project Settings → Service Connections → New Service Connection
  - Type: Docker Registry → Azure Container Registry
  - Select your ACR
  - Name: `vaultwrx-registry-connection` (or your choice)
  - **Note down**: Service connection name

- [ ] Create **Azure Subscription Service Connection** (if not exists)
  - Go to: Project Settings → Service Connections → New Service Connection
  - Type: Azure Resource Manager
  - Name: `Azure subscription 1` (or update pipeline with your name)

### Step 3: Update Configuration Files

- [ ] Update `azure-pipelines.yml`:
  ```yaml
  dockerRegistry: 'vaultwrx-registry-connection'  # Your service connection name
  containerRegistry: 'vaultwrx-registry-connection'  # Same as above
  appName: 'vaultwrx-backend-service'  # Your App Service name
  azureSubscription: 'Azure subscription 1'  # Your subscription service connection
  ```

### Step 4: Configure Environment Variables in Azure

Go to: **App Service** → **Configuration** → **Application settings**

Add these variables:

**Required:**
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3060`
- [ ] `APP_PORT` = `3060`
- [ ] `TYPEORM_HOST` = `your-database-host.postgres.database.azure.com`
- [ ] `TYPEORM_PORT` = `5432`
- [ ] `TYPEORM_DATABASE` = `your-database-name`
- [ ] `TYPEORM_USERNAME` = `your-database-username`
- [ ] `TYPEORM_PASSWORD` = `your-database-password`
- [ ] `TYPEORM_SSL` = `true`
- [ ] `TYPEORM_SSL_REJECT_UNAUTHORIZED` = `false`

**Optional but Recommended:**
- [ ] `APP_NAME` = `VaultWrx Backend Service`
- [ ] `APP_URL` = `https://vaultwrx-backend-service.azurewebsites.net`
- [ ] `TYPEORM_ENTITIES` = `dist/api/models/**/*.js`
- [ ] `TYPEORM_ENTITIES_DIR` = `/api/models/**`
- [ ] `CONTROLLERS_DIR` = `/api/controllers/**`
- [ ] `MIDDLEWARES_DIR` = `/api/middlewares/**`
- [ ] `EVENTS_DIR` = `/api/events/**`
- [ ] `SUBSCRIBERS_DIR` = `/api/subscribers/**`
- [ ] `RESOLVERS_DIR` = `/api/resolvers/**`
- [ ] `CRON_JOBS_DIR` = `/api/cron-jobs/**`
- [ ] `ENABLE_CRON_JOBS` = `false`
- [ ] `ENABLE_GRAPHQL` = `false`
- [ ] `TYPEORM_LOGGING` = `false`

### Step 5: Test Locally (Optional but Recommended)

- [ ] Install Docker Desktop (if not installed)
- [ ] Build Docker image locally:
  ```bash
  docker build --target production-build-stage -t vaultwrx-backend:local .
  ```
- [ ] Test run locally:
  ```bash
  docker run -p 3060:3060 --env-file .env vaultwrx-backend:local
  ```
- [ ] Verify app works at `http://localhost:3060`

### Step 6: Deploy

- [ ] Commit and push your code:
  ```bash
  git add .
  git commit -m "Configure Docker deployment for Azure"
  git push origin main
  ```
- [ ] Monitor pipeline in Azure DevOps
- [ ] Verify deployment in Azure Portal

### Step 7: Verify Deployment

- [ ] Check App Service → **Overview** → Click URL
- [ ] Verify API responds correctly
- [ ] Check **Log stream** for any errors
- [ ] Test your API endpoints

## 🐛 Troubleshooting

If something goes wrong:

1. **Check Logs**: App Service → **Log stream**
2. **Check Configuration**: App Service → **Configuration** → Verify all env vars
3. **Check Container**: App Service → **Deployment Center** → Verify image
4. **Check Pipeline**: Azure DevOps → **Pipelines** → Check build logs

## 📞 Need Help?

- See `DOCKER_DEPLOYMENT_GUIDE.md` for detailed instructions
- Check Azure Portal → App Service → **Diagnose and solve problems**

---

**Once all items are checked, your app should be deployed! 🎉**

