import { useCallback, useRef, useEffect } from "react";
import { cancelAllRequests, getActiveRequestCount } from "../lib/api";

export function useAbortController() {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const stopAllOperations = useCallback(() => {
    cancelAllRequests();
  }, []);

  const hasActiveOperations = useCallback(() => {
    return getActiveRequestCount() > 0;
  }, []);

  return {
    stopAllOperations,
    hasActiveOperations,
    isMounted: () => mountedRef.current,
  };
}