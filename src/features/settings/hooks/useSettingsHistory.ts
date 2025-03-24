import { useState, useCallback } from 'react';

export function useSettingsHistory<T>(maxHistory = 50) {
  const [history, setHistory] = useState<Array<{
    timestamp: number;
    settings: T;
    description: string;
  }>>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const trackChange = useCallback((settings: T, description: string) => {
    const newHistory = history.slice(0, currentIndex + 1);
    const historyItem = {
      timestamp: Date.now(),
      settings,
      description,
    };
    
    setHistory([...newHistory, historyItem].slice(-maxHistory));
    setCurrentIndex(Math.min(currentIndex + 1, maxHistory - 1));
  }, [history, currentIndex, maxHistory]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      return history[currentIndex - 1].settings;
    }
    return null;
  }, [history, currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
      return history[currentIndex + 1].settings;
    }
    return null;
  }, [history, currentIndex]);

  return { trackChange, undo, redo, history, currentIndex };
}