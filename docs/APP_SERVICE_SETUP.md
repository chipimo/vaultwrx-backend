# 🚀 Configure App Service to Use Your Container

Your Docker image has been successfully pushed to Azure Container Registry! Now let's configure the App Service to use it.

## Step 1: Configure Container Settings in Azure Portal

1. Go to **Azure Portal** → **App Services** → **vaultwrx-backend-dev**
2. In the left menu, click **"Deployment Center"** (or **"Container settings"**)
3. Select **"Container Registry"** as the source
4. Configure:
   - **Registry source**: `Azure Container Registry`
   - **Registry**: Select `VaultwrxRegistry`
   - **Image**: `vaultwrx-backend-service`
   - **Tag**: `latest`
   - **Continuous Deployment**: Enable if you want auto-deploy on push
5. Click **"Save"**

**Alternative: Using Deployment Center**
1. Go to **App Service** → **Deployment Center**
2. Select **"Container Registry"** → **"Azure Container Registry"**
3. Choose your registry and repository
4. Click **"Save"**

## Step 2: Configure Environment Variables

Go to **App Service** → **Configuration** → **Application settings**

### Required Environment Variables:

Add these settings (click **"+ New application setting"** for each):

```
NODE_ENV = production
PORT = 3060
APP_PORT = 3060
TYPEORM_HOST = your-database-host.postgres.database.azure.com
TYPEORM_PORT = 5432
TYPEORM_DATABASE = vaultwrx_db
TYPEORM_USERNAME = postgresadmin@your-server-name
TYPEORM_PASSWORD = your-database-password
TYPEORM_SSL = true
TYPEORM_SSL_REJECT_UNAUTHORIZED = false
TYPEORM_SYNCHRONIZE = false
```

### Optional Environment Variables:

```
APP_NAME = VaultWrx Backend Service
APP_URL = https://vaultwrx-backend-dev.azurewebsites.net
TYPEORM_LOGGING = false
```

**Important**: 
- Replace `your-database-host` with your actual Azure PostgreSQL server name
- Replace `your-database-password` with your actual database password
- The `TYPEORM_USERNAME` format should be: `username@server-name` (e.g., `postgresadmin@vaultwrx-db-server`)

## Step 3: Configure ACR Authentication (If Needed)

If your ACR requires authentication:

1. Go to **App Service** → **Deployment Center**
2. Under **"Container settings"**, click **"Edit"**
3. If prompted, configure **Managed Identity** or **Admin credentials**
4. For **Managed Identity**:
   - Go to **App Service** → **Identity** → **System assigned** → **On**
   - Go to **Container Registry** → **Access control (IAM)** → Add role assignment
   - Add the App Service's managed identity with **"AcrPull"** role

## Step 4: Restart the App Service

1. Go to **App Service** → **Overview**
2. Click **"Restart"** button
3. Wait for the restart to complete (1-2 minutes)

## Step 5: Test Your Deployment

### Option 1: Check Logs
1. Go to **App Service** → **Log stream**
2. Watch for startup messages and any errors
3. Look for: `🚀 Server started at http://localhost:3060`

### Option 2: Test the API
1. Go to **App Service** → **Overview**
2. Click on the **URL** (e.g., `https://vaultwrx-backend-dev.azurewebsites.net`)
3. You should see your API response or health check endpoint

### Option 3: Use Console
1. Go to **App Service** → **Console** (under Development Tools)
2. Run: `curl http://localhost:3060` or test your API endpoints

## Step 6: Verify Container is Running

1. Go to **App Service** → **Overview**
2. Check **"Status"** should be **"Running"**
3. Check **"Container"** section should show your image:
   - Image: `vaultwrxregistry.azurecr.io/vaultwrx-backend-service:latest`

## 🔧 Troubleshooting

### Container Won't Start
- Check **Log stream** for errors
- Verify all environment variables are set correctly
- Ensure database connection string is correct
- Check that ACR authentication is configured

### "Cannot connect to database"
- Verify `TYPEORM_HOST` is correct (full hostname, not just server name)
- Check `TYPEORM_USERNAME` format: `username@server-name`
- Ensure `TYPEORM_SSL=true` is set
- Verify database firewall allows Azure services

### "Image pull failed"
- Check ACR authentication in **Deployment Center**
- Verify image exists: Go to **Container Registry** → **Repositories** → `vaultwrx-backend-service`
- Ensure App Service has **AcrPull** permission

### Port Issues
- Azure App Service automatically maps external ports to your container's internal port
- Your app should listen on the port specified in `PORT` environment variable (3060)
- Azure will handle the external mapping (80/443 → your container port)

## 📝 Quick Test Commands

Once deployed, test your API:

```bash
# Health check (if you have one)
curl https://vaultwrx-backend-dev.azurewebsites.net/health

# Or test a specific endpoint
curl https://vaultwrx-backend-dev.azurewebsites.net/api/orders
```

## ✅ Success Indicators

- ✅ App Service status is **"Running"**
- ✅ Log stream shows: `🚀 Server started at http://localhost:3060`
- ✅ No errors in log stream
- ✅ API responds when you visit the URL
- ✅ Container image shows in **Overview** → **Container** section

---

**Next Steps**: Once working, you can set up continuous deployment so new pushes to ACR automatically deploy to App Service!

