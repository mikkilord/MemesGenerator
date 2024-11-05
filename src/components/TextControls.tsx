import React from 'react';
import { TextPosition } from '../types';

interface TextControlsProps {
  textFields: Array<{
    id: string;
    text: string;
    position: TextPosition;
    fontSize: number;
    isEditing: boolean;
  }>;
  updateTextField: (id: string, updates: Partial<{
    text: string;
    position: TextPosition;
    fontSize: number;
    isEditing: boolean;
  }>) => void;
  selectedFont: string;
  setSelectedFont: (font: string) => void;
  strokeType: 'outer' | 'inner';
  setStrokeType: (type: 'outer' | 'inner') => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  showTextSettings: boolean;
  setShowTextSettings: (show: boolean) => void;
  settingsRef: React.RefObject<HTMLDivElement>;
  fontInputRef: React.RefObject<HTMLInputElement>;
  handleFontUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onTextFieldClick: (id: string) => void;
  selectedTextField: string | null;
}

const fonts = [
  { name: 'Impact', value: 'Impact' },
  { name: 'Anton', value: 'Anton' },
  { name: 'Bebas Neue', value: 'Bebas Neue' },
  { name: 'Oswald', value: 'Oswald' },
  { name: 'Teko', value: 'Teko' },
];

export const TextControls: React.FC<TextControlsProps> = ({
  textFields,
  updateTextField,
  selectedFont,
  setSelectedFont,
  strokeType,
  setStrokeType,
  strokeWidth,
  setStrokeWidth,
  showTextSettings,
  setShowTextSettings,
  settingsRef,
  fontInputRef,
  handleFontUpload,
  onTextFieldClick,
  selectedTextField,
}) => {
  return (
    <div className="relative mb-6">
      <div 
        ref={settingsRef}
        className={`absolute z-10 w-full p-6 rounded-lg backdrop-blur-md bg-black/30 border border-gray-600 shadow-xl transition-all duration-300 ${
          showTextSettings ? 'opacity-100 transform scale-100' : 'opacity-0 pointer-events-none transform scale-95'
        }`}
        style={{ maxHeight: '60vh', overflowY: 'auto' }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Font Family</label>
            <select
              value={selectedFont}
              onChange={(e) => {
                if (e.target.value === 'upload') {
                  fontInputRef.current?.click();
                } else {
                  setSelectedFont(e.target.value);
                }
              }}
              className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-800/50 focus:ring-2 focus:ring-purple-500 outline-none backdrop-blur-sm"
            >
              {fonts.map((font) => (
                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                  {font.name}
                </option>
              ))}
              <option value="custom" disabled>──────────</option>
              <option value="upload">+ Add Custom Font</option>
            </select>
            <input
              type="file"
              ref={fontInputRef}
              onChange={handleFontUpload}
              accept=".ttf,.otf,.woff,.woff2"
              className="hidden"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Stroke Type</label>
            <select
              value={strokeType}
              onChange={(e) => setStrokeType(e.target.value as 'outer' | 'inner')}
              className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-800/50 focus:ring-2 focus:ring-purple-500 outline-none backdrop-blur-sm"
            >
              <option value="outer">Outer Stroke</option>
              <option value="inner">Inner Stroke</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Stroke Width: {strokeWidth}</label>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {textFields.map((field, index) => (
          <div 
            key={field.id} 
            className={`relative transition-all duration-200 ${
              selectedTextField === field.id ? 'ring-2 ring-purple-500' : ''
            }`}
            onClick={() => onTextFieldClick(field.id)}
          >
            <input
              type="text"
              placeholder={`Text ${index + 1}`}
              value={field.text}
              onChange={(e) => updateTextField(field.id, { text: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 focus:ring-2 focus:ring-purple-500 outline-none transition-colors duration-200"
              style={{ fontFamily: selectedFont }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};