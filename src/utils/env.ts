import * as path from 'path';

// Skip dotenv loading on Netlify - environment variables are already provided
const isNetlify = process.env.NETLIFY === 'true' || !!process.env.NETLIFY_DATABASE_URL;

if (!isNetlify) {
  try {
    // Dynamic import to avoid hard dependency on dotenv
    const dotenv = require('dotenv');
    
    // Determine the root directory (where .env file is located)
    const rootDir = __dirname.includes('dist') || __dirname.includes('src') 
      ? path.resolve(__dirname, '../..')
      : path.resolve(__dirname, '..');

    // Load .env file
    const envPath = path.join(rootDir, '.env');
    const result = dotenv.config({ path: envPath });

    // Debug: Log if .env file was found (only in development)
    if (process.env.NODE_ENV !== 'production') {
      if (!result.error) {
        console.log('✅ Loaded .env from:', envPath);
      } else {
        console.warn('⚠️  Could not load .env file from:', envPath);
        console.warn('   Error:', result.error.message);
      }
    }

    // Also try loading environment-specific .env files
    const nodeEnv = process.env.NODE_ENV || 'development';
    dotenv.config({ path: path.join(rootDir, `.env.${nodeEnv}`) });
  } catch (e) {
    // dotenv not available, assume environment variables are set externally
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️  dotenv not available, using system environment variables');
    }
  }
} else {
  console.log('🌐 Running on Netlify, using provided environment variables');
}

export function env(key: string, defaultValue: null | string = null): string {
  return process.env[key] ?? (defaultValue as string);
}

export function envOrFail(key: string): string {
  if (typeof process.env[key] === 'undefined') {
    throw new Error(`Environment variable ${key} is not set.`);
  }

  return process.env[key] as string;
}
