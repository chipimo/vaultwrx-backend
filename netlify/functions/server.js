// Netlify serverless function - Full Express App Integration
const path = require('path');
const Module = require('module');

// Set environment flags FIRST
process.env.NETLIFY = 'true';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Setup paths
const functionsDir = __dirname;
const rootDir = path.resolve(functionsDir, '../..');
const distDir = path.join(rootDir, 'dist');

// Pre-require all core dependencies that the app needs
// This ensures they're available before the app loads
require('reflect-metadata');

// Setup module aliases for @base and @api paths
const moduleAlias = require('module-alias');
moduleAlias.addAliases({
  '@base': distDir,
  '@api': path.join(distDir, 'api')
});

// Now load the serverless wrapper
const serverless = require('serverless-http');

// Import dependencies needed by the app
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Database connection pool (lazy initialized)
let pool = null;
function getPool() {
  if (!pool) {
    const connectionString = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('Database connection string not configured');
    }
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check / root endpoint
app.get('/', (req, res) => {
  res.json({
    title: 'VaultWrx-Backend',
    mode: process.env.NODE_ENV,
    date: new Date().toISOString(),
    message: 'API is running on Netlify Functions with Express'
  });
});

// API version endpoint
app.get('/api/version', (req, res) => {
  res.json({
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    platform: 'Netlify Functions + Express'
  });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    const db = getPool();
    
    // Query user with role and permissions
    const userResult = await db.query(`
      SELECT u.*, r.name as role_name, r.type as role_type
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email = $1
    `, [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const user = userResult.rows[0];
    
    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is not active'
      });
    }
    
    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Get permissions
    const permResult = await db.query(`
      SELECT p.resource, p.action
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = $1
    `, [user.role_id]);
    
    const permissions = permResult.rows;
    
    // Create JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role_id: user.role_id,
      role: user.role_name,
      roleType: user.role_type,
      company_id: user.company_id,
      permissions: permissions
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });
    
    // Return response
    res.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role_name,
        roleType: user.role_type,
        company_id: user.company_id,
        permissions: permissions
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Geocoding endpoints
app.get('/api/geocoding/search', async (req, res) => {
  try {
    const { query, limit = 5, countryCode = 'US' } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json([]);
    }
    
    const params = new URLSearchParams({
      q: query.trim(),
      format: 'json',
      addressdetails: '1',
      limit: Math.min(parseInt(limit), 10).toString(),
      countrycodes: countryCode.toLowerCase()
    });
    
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: {
        'User-Agent': 'VaultWrx/1.0',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    const results = data.map((item) => ({
      placeId: item.place_id?.toString() || '',
      displayName: item.display_name || '',
      name: item.name || '',
      address: {
        houseNumber: item.address?.house_number,
        road: item.address?.road,
        city: item.address?.city || item.address?.town || item.address?.village,
        county: item.address?.county,
        state: item.address?.state,
        postcode: item.address?.postcode,
        country: item.address?.country,
        countryCode: item.address?.country_code?.toUpperCase()
      },
      lat: item.lat || '',
      lon: item.lon || '',
      type: item.type || '',
      category: item.class || '',
      importance: item.importance || 0
    }));
    
    res.json(results);
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Export the serverless handler
module.exports.handler = serverless(app);
