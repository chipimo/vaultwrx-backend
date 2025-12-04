// Netlify serverless function wrapper for Express app
const serverless = require('serverless-http');
const path = require('path');

// Set up environment for serverless
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Import the Express app from the built dist folder
// Wait for the app to be initialized (it's async)
let appInstance;
let handler;

async function getApp() {
  if (!appInstance) {
    // Import the app - this will trigger the App class initialization
    const mainModule = require('../../dist/main.js');
    appInstance = mainModule.app;
    
    // Wait a bit for async initialization (database connection, etc.)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return appInstance;
}

// Create the handler
module.exports.handler = async (event, context) => {
  const app = await getApp();
  if (!handler) {
    handler = serverless(app);
  }
  return handler(event, context);
};

