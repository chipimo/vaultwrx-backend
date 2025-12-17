// Netlify serverless function wrapper for Express app
// Explicitly require all dependencies at the top for NFT bundler to trace them
const serverless = require('serverless-http');
const path = require('path');
const dotenv = require('dotenv');
const moduleAlias = require('module-alias');

// Pre-require core dependencies for NFT tracing
require('express');
require('reflect-metadata');
require('typeorm');
require('typedi');
require('pg');
require('body-parser');
require('cors');
require('helmet');
require('class-transformer');
require('class-validator');
require('routing-controllers');
require('jsonwebtoken');
require('bcrypt');

// Set up environment for serverless
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Set up module aliases BEFORE importing anything
const rootDir = path.resolve(__dirname, '../..');
const distDir = path.join(rootDir, 'dist');

// Register aliases to match the TypeScript path mappings
// Note: We only use addAliases() and don't call moduleAlias() 
// because that tries to read package.json which isn't available in Netlify's environment
moduleAlias.addAliases({
  '@base': distDir,
  '@api': path.join(distDir, 'api')
});

// Lazy load the app to avoid bundler static analysis issues
let appInstance;
let handler;

async function initializeApp() {
  if (appInstance) {
    return appInstance;
  }

  try {
    // Set serverless environment flag before loading main module
    process.env.NETLIFY = 'true';
    
    // Clear any cached modules to ensure fresh load
    const mainPath = path.join(distDir, 'main.js');
    
    // Remove from cache if it exists
    if (require.cache[mainPath]) {
      delete require.cache[mainPath];
    }
    
    // Require the main module - this will execute main.js
    // The module aliases are already set up, so @base imports will work
    const mainModule = require(mainPath);
    
    if (!mainModule.app) {
      throw new Error('App instance not exported from main module. Make sure main.ts exports the app.');
    }
    
    // Wait for the app to be fully initialized (database connections, etc.)
    if (mainModule.appReady) {
      await mainModule.appReady;
    } else {
      // Fallback: wait a bit for async initialization
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    appInstance = mainModule.app;
    
    return appInstance;
  } catch (error) {
    console.error('Failed to initialize app:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

// Export the handler
module.exports.handler = async (event, context) => {
  // Enable longer execution for serverless functions
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    // Initialize app if not already done
    const app = await initializeApp();
    
    // Create serverless handler if not already created
    if (!handler) {
      handler = serverless(app, {
        binary: ['image/*', 'application/pdf', 'application/octet-stream']
      });
    }
    
    // Invoke the handler
    return await handler(event, context);
  } catch (error) {
    console.error('Handler execution error:', error);
    console.error('Error stack:', error.stack);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        status: 500,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
      })
    };
  }
};
