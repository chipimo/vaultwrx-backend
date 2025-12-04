# Verify Your Docker Hub Email

You're getting: `401 Unauthorized: email must be verified before using account`

This means your Docker Hub account email hasn't been verified yet.

## Quick Fix: Verify Your Email

### Step 1: Check Your Email
1. Go to your email inbox (the one you used to sign up for Docker Hub)
2. Look for an email from **Docker** or **Docker Hub**
3. Subject line might be: "Verify your Docker Hub email" or "Confirm your email address"
4. Click the **verification link** in the email

### Step 2: If You Can't Find the Email

1. Go to [hub.docker.com](https://hub.docker.com)
2. Log in with your account (`melchip`)
3. Go to **Account Settings** → **Email Settings**
4. Check if your email is verified
5. If not, click **"Resend verification email"**
6. Check your inbox (and spam folder) for the verification email
7. Click the verification link

### Step 3: After Verification

Once your email is verified:

```bash
# Log out and log back in to refresh your session
docker logout
docker login

# Then try building again
docker build --target production-build-stage -t vaultwrx-backend:local .
```

## Alternative: Skip Local Testing

If you want to skip local Docker testing and go straight to Azure deployment:

1. **You don't need to test locally** - Azure pipeline will handle everything
2. Just make sure your code is committed and pushed
3. The Azure pipeline will build the Docker image in the cloud (no Docker Hub login needed there)

## Why This Happens

Docker Hub requires email verification to:
- Prevent spam accounts
- Ensure account security
- Allow pulling/pushing images

Public images (like `node:22.17.1-alpine`) can sometimes be pulled anonymously, but there are rate limits. Verified accounts have higher limits.

---

**Quick Action**: Check your email inbox for the Docker verification email and click the link!

