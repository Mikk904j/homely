
import { useState, useCallback, useRef, useEffect } from "react";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseAsyncOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  retryCount?: number;
  retryDelay?: number;
}

export function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (...args: any[]) => {
    if (!mountedRef.current) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await asyncFunction(...args);
      
      if (mountedRef.current) {
        setState({ data: result, loading: false, error: null });
        options.onSuccess?.(result);
        retryCountRef.current = 0;
      }
      
      return result;
    } catch (error: any) {
      console.error("Async operation failed:", error);
      
      if (mountedRef.current) {
        const errorMessage = error.message || "An unexpected error occurred";
        setState({ data: null, loading: false, error: errorMessage });
        
        // Auto-retry logic
        const maxRetries = options.retryCount || 0;
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          const delay = options.retryDelay || 1000;
          
          setTimeout(() => {
            if (mountedRef.current) {
              execute(...args);
            }
          }, delay * retryCountRef.current);
        } else {
          options.onError?.(error);
        }
      }
      
      throw error;
    }
  }, [asyncFunction, options]);

  const reset = useCallback(() => {
    if (mountedRef.current) {
      setState({ data: null, loading: false, error: null });
      retryCountRef.current = 0;
    }
  }, []);

  return {
    ...state,
    execute,
    reset,
    isIdle: !state.loading && !state.error && !state.data
  };
}
