# Fixing Docker Authentication Error

You're getting: `401 Unauthorized: email must be verified`

This means Docker needs authentication to pull the base image from Docker Hub.

## Solution 1: Login to Docker Hub (Recommended)

### Option A: Using Docker Desktop (Easiest)

1. Open **Docker Desktop** on your Mac
2. Click on your **profile icon** (top right)
3. Click **"Sign in"** or **"Account Settings"**
4. Log in with your Docker Hub account
5. If you don't have an account, create one at [hub.docker.com](https://hub.docker.com)
6. **Verify your email** if prompted

### Option B: Using Command Line

```bash
# Login to Docker Hub
docker login

# Enter your Docker Hub username and password when prompted
```

## Solution 2: Use Docker Desktop's Built-in Authentication

Docker Desktop should handle authentication automatically. Try:

1. Open **Docker Desktop**
2. Go to **Settings** (gear icon)
3. Go to **Resources** → **Docker Engine**
4. Make sure Docker is running properly
5. Try the build command again

## Solution 3: Verify Email on Docker Hub

If you have a Docker Hub account but haven't verified your email:

1. Go to [hub.docker.com](https://hub.docker.com)
2. Log in
3. Check your email for verification link
4. Click the verification link
5. Try building again

## Solution 4: Use Anonymous Pull (Temporary)

If you just want to test locally without logging in:

```bash
# Docker allows anonymous pulls for public images, but rate limits apply
# Try building again - it might work if you haven't hit rate limits
docker build --target production-build-stage -t vaultwrx-backend:local .
```

## Solution 5: Check Docker Desktop Status

Make sure Docker Desktop is running:

1. Check if Docker Desktop icon is in your menu bar (top right)
2. If not running, open Docker Desktop
3. Wait for it to fully start (whale icon should be steady)
4. Try building again

## Quick Test

After logging in, test if Docker can pull images:

```bash
# Try pulling the base image directly
docker pull node:22.17.1-alpine

# If this works, then try building again
docker build --target production-build-stage -t vaultwrx-backend:local .
```

## What I Fixed

✅ Fixed Dockerfile casing warnings:
- Changed `FROM ... as ...` to `FROM ... AS ...` (uppercase AS)

The authentication issue is separate and needs to be resolved by logging into Docker Hub.

---

**Most Common Solution**: Just log in to Docker Hub through Docker Desktop or `docker login` command!

