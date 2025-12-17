// Netlify serverless function wrapper for Express app
const path = require('path');
const Module = require('module');

// Set NETLIFY flag FIRST - before any other code runs
process.env.NETLIFY = 'true';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Set up paths
const functionsDir = __dirname;
const rootDir = path.resolve(functionsDir, '../..');
const distDir = path.join(rootDir, 'dist');
const functionsNodeModules = path.join(functionsDir, 'node_modules');

// PRE-REQUIRE all modules that main.js needs BEFORE module-alias patches anything
// This puts them in require.cache so they're found when main.js asks for them
require(path.join(functionsNodeModules, 'reflect-metadata'));
require(path.join(functionsNodeModules, 'express'));
require(path.join(functionsNodeModules, 'typedi'));
require(path.join(functionsNodeModules, 'typeorm'));
require(path.join(functionsNodeModules, 'routing-controllers'));
require(path.join(functionsNodeModules, 'class-transformer'));
require(path.join(functionsNodeModules, 'class-validator'));
require(path.join(functionsNodeModules, 'body-parser'));
require(path.join(functionsNodeModules, 'cors'));
require(path.join(functionsNodeModules, 'helmet'));
require(path.join(functionsNodeModules, 'jsonwebtoken'));
require(path.join(functionsNodeModules, 'pg'));

// Now require serverless-http and module-alias
const serverless = require('serverless-http');
const moduleAlias = require('module-alias');

// Register aliases to match the TypeScript path mappings
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
