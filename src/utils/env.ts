import * as dotenv from 'dotenv';
import * as path from 'path';

// Determine the root directory (where .env file is located)
// When running from dist, __dirname will be dist/utils, so we need to go up two levels
// When running from src (ts-node), __dirname will be src/utils, so we need to go up two levels
const rootDir = __dirname.includes('dist') || __dirname.includes('src') 
  ? path.resolve(__dirname, '../..')  // Go up two levels: dist/utils -> dist -> root, or src/utils -> src -> root
  : path.resolve(__dirname, '..');   // Fallback: assume we're in root/utils

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

export function env(key: string, defaultValue: null | string = null): string {
  return process.env[key] ?? (defaultValue as string);
}

export function envOrFail(key: string): string {
  if (typeof process.env[key] === 'undefined') {
    throw new Error(`Environment variable ${key} is not set.`);
  }

  return process.env[key] as string;
}
