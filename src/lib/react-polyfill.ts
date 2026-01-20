/**
 * Polyfill for useEffectEvent hook for React 19 compatibility
 * useEffectEvent was an experimental React hook that allows using a callback
 * in effects without including it in the dependency array.
 *
 * This polyfill provides the same functionality using useRef and useEffect.
 */
import { useRef, useEffect, useCallback } from 'react';

export function useEffectEvent<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => {
      return callbackRef.current(...args);
    }) as T,
    []
  );
}
