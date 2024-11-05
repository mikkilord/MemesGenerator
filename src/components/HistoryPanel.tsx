import React from 'react';
import { RotateCcw } from 'lucide-react';

interface HistoryPanelProps {
  history: Array<{
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
  }>;
  onRestore: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onRestore }) => {
  if (history.length === 0) return null;

  return (
    <div className="w-48 bg-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-4">History</h3>
      <div className="space-y-2">
        {history.map((state, index) => (
          <button
            key={index}
            onClick={onRestore}
            className="w-full p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">Undo Change {history.length - index}</span>
          </button>
        ))}
      </div>
    </div>
  );
};