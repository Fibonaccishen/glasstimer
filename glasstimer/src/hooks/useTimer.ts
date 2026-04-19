import { useState, useRef, useCallback, useEffect } from "react";

export interface UseTimerReturn {
  remaining: number;
  isRunning: boolean;
  start: (ms: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export function useTimer(): UseTimerReturn {
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const targetTimeRef = useRef<number>(0);

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const delta = time - previousTimeRef.current;
      setRemaining(() => {
        const newRemaining = targetTimeRef.current - delta;
        if (newRemaining <= 0) {
          setIsRunning(false);
          return 0;
        }
        targetTimeRef.current = targetTimeRef.current + delta;
        return newRemaining;
      });
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  const start = useCallback((ms: number) => {
    setRemaining(ms);
    setIsRunning(true);
    targetTimeRef.current = ms;
    previousTimeRef.current = undefined;
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  }, []);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setRemaining(0);
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isRunning, animate]);

  return { remaining, isRunning, start, pause, resume, reset };
}
