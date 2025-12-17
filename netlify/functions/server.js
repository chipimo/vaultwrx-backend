// Netlify serverless function wrapper for Express app
const path = require('path');
const Module = require('module');

// Set up paths FIRST
const functionsDir = __dirname;
const rootDir = path.resolve(functionsDir, '../..');
const distDir = path.join(rootDir, 'dist');
const functionsNodeModules = path.join(functionsDir, 'node_modules');

// Add functions node_modules to global module paths BEFORE any requires
// This makes all modules in functions/node_modules available globally
Module.globalPaths.unshift(functionsNodeModules);

// Also add to require.main.paths if available
if (require.main && require.main.paths) {
  require.main.paths.unshift(functionsNodeModules);
}

// Pre-require critical modules to ensure they're loaded from functions node_modules
require('dotenv');
require('reflect-metadata');

// Set up environment for serverless
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Now require the rest
const serverless = require('serverless-http');
const moduleAlias = require('module-alias');

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
