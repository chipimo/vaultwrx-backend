// Netlify serverless function with Express
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Set environment flags
process.env.NETLIFY = 'true';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

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

// Geocoding endpoints (basic implementation without external dependencies)
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
    
    // Map results
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
