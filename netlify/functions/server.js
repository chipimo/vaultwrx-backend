// Netlify serverless function - Load Full Compiled App
const path = require('path');

// Set environment flags FIRST - before any imports
process.env.NETLIFY = 'true';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Setup paths
const functionsDir = __dirname;
const rootDir = path.resolve(functionsDir, '../..');
const distDir = path.join(rootDir, 'dist');

// Pre-require reflect-metadata (required for decorators)
require('reflect-metadata');

// Setup module aliases for @base and @api paths BEFORE loading the app
const moduleAlias = require('module-alias');
moduleAlias.addAliases({
  '@base': distDir,
  '@api': path.join(distDir, 'api')
});

// Load serverless-http wrapper
const serverless = require('serverless-http');

// App instance and handler (lazy loaded)
let appInstance = null;
let handler = null;
let initPromise = null;

async function initializeApp() {
  if (appInstance) {
    return appInstance;
  }
  
  if (initPromise) {
    return initPromise;
  }
  
  initPromise = (async () => {
    try {
      console.log('🚀 Initializing VaultWrx Backend...');
      console.log('📁 Dist directory:', distDir);
      
      // Load the compiled main module
      const mainPath = path.join(distDir, 'main.js');
      console.log('📦 Loading main module from:', mainPath);
      
      const mainModule = require(mainPath);
      
      // Wait for the app to be ready
      if (mainModule.appReady) {
        console.log('⏳ Waiting for app initialization...');
        await mainModule.appReady;
      }
      
      if (!mainModule.app) {
        throw new Error('App not exported from main module');
      }
      
      appInstance = mainModule.app;
      console.log('✅ App initialized successfully');
      
      return appInstance;
    } catch (error) {
      console.error('❌ Failed to initialize app:', error.message);
      console.error('Stack:', error.stack);
      throw error;
    }
  })();
  
  return initPromise;
}

// Export the handler
module.exports.handler = async (event, context) => {
  // Prevent Lambda from waiting for empty event loop
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    // Initialize app if needed
    const app = await initializeApp();
    
    // Create serverless handler if needed
    if (!handler) {
      handler = serverless(app, {
        binary: ['image/*', 'application/pdf', 'application/octet-stream']
      });
    }
    
    // Handle the request
    return await handler(event, context);
    
  } catch (error) {
    console.error('Handler error:', error.message);
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Server initialization failed',
        error: error.message
      })
    };
  }
};
