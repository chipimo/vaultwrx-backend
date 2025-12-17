// Minimal Netlify function - direct API without Express complexity
// This avoids all the module resolution issues

exports.handler = async (event, context) => {
  // Set environment
  process.env.NETLIFY = 'true';
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';
  
  const path = event.path || '/';
  const method = event.httpMethod || 'GET';
  
  // Basic routing
  try {
    // Health check / root endpoint
    if (path === '/' || path === '/.netlify/functions/server') {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'VaultWrx-Backend',
          mode: process.env.NODE_ENV,
          date: new Date().toISOString(),
          message: 'API is running on Netlify Functions'
        })
      };
    }
    
    // API version endpoint
    if (path.includes('/api/version') || path.includes('/version')) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: '1.0.0',
          environment: process.env.NODE_ENV,
          platform: 'Netlify Functions'
        })
      };
    }
    
    // For other routes, return not implemented for now
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: `Route ${method} ${path} not found`,
        hint: 'Full Express app integration pending'
      })
    };
    
  } catch (error) {
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error.message
      })
    };
  }
};
