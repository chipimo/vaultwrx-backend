# ============================================
# OPTION 1: Development (Run TypeScript directly)
# ============================================
# Use this for local development with hot-reload
# Build: docker build --target development-build-stage -t vaultwrx-backend:dev .
# Run: docker run -p 3060:3060 vaultwrx-backend:dev
FROM node:22.17.1-alpine AS development-build-stage

WORKDIR /app

# Install build dependencies needed for native modules (like bcrypt)
# python3, make, g++ are required for compiling native Node.js modules
RUN apk add --no-cache python3 make g++

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for ts-node, nodemon)
# Using --legacy-peer-deps to resolve peer dependency conflicts
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

ENV NODE_ENV=development
ENV PORT=3060

# Expose port (Azure App Service will map this automatically)
EXPOSE 3060

# Run TypeScript directly using ts-node (no compilation needed)
# This is slower at runtime but easier for development with hot-reload
CMD ["npm", "run", "dev"]

# ============================================
# OPTION 2: Production (Compile to JavaScript first - RECOMMENDED FOR AZURE)
# ============================================
# Use this for production deployments to Azure App Service
# Build: docker build --target production-build-stage -t vaultwrx-backend:prod .
# Run: docker run -p 3060:3060 vaultwrx-backend:prod
FROM node:22.17.1-alpine AS production-build-stage

WORKDIR /app

# Install build dependencies needed for native modules (like bcrypt)
# python3, make, g++ are required for compiling native Node.js modules
RUN apk add --no-cache python3 make g++

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies (we need dev dependencies to compile TypeScript)
# Using --legacy-peer-deps to resolve peer dependency conflicts
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Remove dev dependencies to reduce image size (saves ~100-200MB)
RUN npm prune --production

ENV NODE_ENV=production
# Azure App Service sets PORT automatically, but we provide a default
ENV PORT=3060

# Expose port (Azure App Service will map port 80/443 to this)
# The app should listen on process.env.PORT (set by Azure) or default to 3060
EXPOSE 3060

# Run the compiled JavaScript (faster startup, smaller runtime footprint)
# This is the recommended approach for production
CMD ["node", "dist/main.js"]
