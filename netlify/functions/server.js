// Netlify serverless function wrapper for Express app
const serverless = require('serverless-http');
const path = require('path');

// Set up environment for serverless
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Set up module aliases BEFORE importing anything
// This must be done before any require() calls that use aliases
const moduleAlias = require('module-alias');
const rootDir = path.resolve(__dirname, '../..');
const distDir = path.join(rootDir, 'dist');

// Register aliases to match the TypeScript path mappings
moduleAlias.addAliases({
  '@base': distDir,
  '@api': path.join(distDir, 'api')
});

// Apply the aliases
moduleAlias();

// Lazy load the app to avoid bundler static analysis issues
let appInstance;
let handler;

async function initializeApp() {
  if (appInstance) {
    return appInstance;
  }

  try {
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
    
    appInstance = mainModule.app;
    
    // Give time for async initialization (database connections, etc.)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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
