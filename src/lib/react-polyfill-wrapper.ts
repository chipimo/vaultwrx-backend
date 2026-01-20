/**
 * React wrapper that adds useEffectEvent polyfill for React 19 compatibility
 * This is used by webpack to replace React imports from react-data-grid
 *
 * Note: When webpack replaces 'react' imports from react-data-grid with this file,
 * we need to import the original React. We use a relative path to bypass
 * the webpack alias.
 */
// @ts-expect-error - Importing React using relative path to avoid webpack alias circular dependency
import * as _ReactOriginal from '../../node_modules/react/index.js';
import { useEffectEvent } from './react-polyfill';

// Ensure ReactOriginal is used to avoid unused variable warning
void _ReactOriginal;

// Re-export everything from React
// @ts-expect-error - Same as above
export * from '../../node_modules/react/index.js';

// Add useEffectEvent to the exports (this is the polyfill)
export { useEffectEvent };
