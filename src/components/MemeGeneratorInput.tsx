import React from 'react';
import { Sparkles } from 'lucide-react';

interface MemeGeneratorInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

export const MemeGeneratorInput: React.FC<MemeGeneratorInputProps> = ({
  prompt,
  setPrompt,
  isGenerating,
  onGenerate,
}) => {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Describe your meme idea..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !isGenerating && prompt.trim()) {
            onGenerate();
          }
        }}
        className="flex-1 px-4 py-2 rounded-lg border border-gray-600 bg-gray-800/50 focus:ring-2 focus:ring-purple-500 outline-none backdrop-blur-sm text-white placeholder-gray-400"
      />
      <button
        onClick={onGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
      >
        <Sparkles className="w-5 h-5" />
        {isGenerating ? 'Generating...' : 'Generate'}
      </button>
    </div>
  );
};