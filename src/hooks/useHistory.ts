import { useState } from 'react';

interface HistoryState {
  textFields: Array<{
    id: string;
    text: string;
    position: { y: number };
    fontSize: number;
  }>;
  selectedImage: string;
  strokeWidth: number;
  strokeType: 'outer' | 'inner';
  selectedFont: string;
}

export const useHistory = () => {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const addToHistory = (state: HistoryState) => {
    setHistory(prev => [...prev.slice(0, currentIndex + 1), state]);
    setCurrentIndex(prev => prev + 1);
  };

  const undo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return history[currentIndex - 1];
    }
    return null;
  };

  return {
    history,
    addToHistory,
    undo,
    canUndo: currentIndex > 0,
  };
};