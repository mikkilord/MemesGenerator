import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Settings, Plus, Minus, Save } from 'lucide-react';
import { TextControls } from './components/TextControls';
import { Header } from './components/Header';
import { useMemeStorage } from './hooks/useMemeStorage';
import { TextPosition } from './types';

function App() {
  const [textFields, setTextFields] = useState<Array<{
    id: string;
    text: string;
    position: TextPosition;
    fontSize: number;
    isEditing: boolean;
  }>>([
    { id: '1', text: '', position: { y: 50 }, fontSize: 48, isEditing: false },
    { id: '2', text: '', position: { y: 500 }, fontSize: 48, isEditing: false }
  ]);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeType, setStrokeType] = useState<'outer' | 'inner'>('outer');
  const [selectedFont, setSelectedFont] = useState('Impact');
  const [showTextSettings, setShowTextSettings] = useState(false);
  const [selectedTextField, setSelectedTextField] = useState<string | null>(null);
  const [showWatermark, setShowWatermark] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fontInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const { saveMeme, loadMeme } = useMemeStorage();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowTextSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedImage) {
      renderPreview();
    }
  }, [selectedImage, textFields, strokeWidth, strokeType, selectedFont, showWatermark]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFontUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const fontName = file.name.split('.')[0];
        const fontUrl = URL.createObjectURL(file);
        const fontFace = new FontFace(fontName, `url(${fontUrl})`);
        await fontFace.load();
        document.fonts.add(fontFace);
        
        const fontData = await file.arrayBuffer();
        localStorage.setItem(`custom-font-${fontName}`, JSON.stringify({
          name: fontName,
          data: Array.from(new Uint8Array(fontData))
        }));
        
        setSelectedFont(fontName);
      } catch (error) {
        console.error('Error loading font:', error);
      }
    }
  };

  const addTextField = () => {
    setTextFields(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text: '',
        position: { y: Math.min(400, prev[prev.length - 1].position.y + 100) },
        fontSize: 48,
        isEditing: false
      }
    ]);
  };

  const removeTextField = () => {
    if (textFields.length <= 1) return;
    setTextFields(prev => prev.filter(field => field.id !== selectedTextField));
    setSelectedTextField(null);
  };

  const updateTextField = (id: string, updates: Partial<typeof textFields[0]>) => {
    setTextFields(prev => prev.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const handleTextFieldClick = (id: string) => {
    setSelectedTextField(id);
    setTextFields(prev => prev.map(field => ({
      ...field,
      isEditing: field.id === id
    })));
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const clickedField = textFields.find(field => field.isEditing);
    if (!clickedField || !previewCanvasRef.current) return;

    const rect = previewCanvasRef.current.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const scaleFactor = previewCanvasRef.current.height / rect.height;
    
    updateTextField(clickedField.id, {
      position: { y: y * scaleFactor }
    });
  };

  const renderPreview = () => {
    if (!selectedImage || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      textFields.forEach(field => {
        drawTextWithStroke(
          ctx,
          field.text,
          canvas.width / 2,
          field.position.y,
          field.fontSize,
          field.isEditing
        );
      });

      if (showWatermark) {
        drawWatermark(ctx);
      }
    };
    img.src = selectedImage;
  };

  const drawWatermark = (ctx: CanvasRenderingContext2D) => {
    const text = 'meme generator';
    ctx.font = '14px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(text, ctx.canvas.width - 10, ctx.canvas.height - 10);
  };

  const drawTextWithStroke = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    fontSize: number,
    isSelected = false
  ) => {
    ctx.font = `${fontSize}px ${selectedFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const maxWidth = ctx.canvas.width - 40;
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const lineHeight = fontSize * 1.2;
    lines.forEach((line, i) => {
      const lineY = y + (i * lineHeight);
      
      if (strokeType === 'outer') {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = strokeWidth;
        ctx.strokeText(line.toUpperCase(), x, lineY);
        ctx.fillStyle = 'white';
        ctx.fillText(line.toUpperCase(), x, lineY);
      } else {
        ctx.fillStyle = 'white';
        ctx.fillText(line.toUpperCase(), x, lineY);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = strokeWidth;
        ctx.strokeText(line.toUpperCase(), x, lineY);
      }

      if (isSelected) {
        const metrics = ctx.measureText(line.toUpperCase());
        const padding = 10;
        
        ctx.strokeStyle = '#4C1D95';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          x - metrics.width / 2 - padding,
          lineY - fontSize / 2 - padding,
          metrics.width + padding * 2,
          fontSize + padding * 2
        );
        ctx.setLineDash([]);

        // Draw resize handles
        const handleSize = 8;
        ctx.fillStyle = '#4C1D95';
        // Left handle
        ctx.fillRect(
          x - metrics.width / 2 - padding - handleSize / 2,
          lineY - handleSize / 2,
          handleSize,
          handleSize
        );
        // Right handle
        ctx.fillRect(
          x + metrics.width / 2 + padding - handleSize / 2,
          lineY - handleSize / 2,
          handleSize,
          handleSize
        );
      }
    });
  };

  const handleSaveMeme = async () => {
    if (!selectedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      textFields.forEach(field => {
        drawTextWithStroke(
          ctx,
          field.text,
          canvas.width / 2,
          field.position.y,
          field.fontSize
        );
      });

      if (showWatermark) {
        drawWatermark(ctx);
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = 'meme.png';
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    };
    img.src = selectedImage;
  };

  const downloadOfflineVersion = () => {
    const link = document.createElement('a');
    link.href = '/offline-version.zip';
    link.download = 'meme-generator-offline.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex gap-6">
          <div className="flex-1">
            <TextControls
              textFields={textFields}
              updateTextField={updateTextField}
              selectedFont={selectedFont}
              setSelectedFont={setSelectedFont}
              strokeType={strokeType}
              setStrokeType={setStrokeType}
              strokeWidth={strokeWidth}
              setStrokeWidth={setStrokeWidth}
              showTextSettings={showTextSettings}
              setShowTextSettings={setShowTextSettings}
              settingsRef={settingsRef}
              fontInputRef={fontInputRef}
              handleFontUpload={handleFontUpload}
              onTextFieldClick={handleTextFieldClick}
              selectedTextField={selectedTextField}
            />

            <div className="mb-6 flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 px-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-purple-500 transition-colors flex items-center justify-center gap-2 bg-gray-800"
              >
                <Upload className="w-5 h-5" />
                Upload Image
              </button>
              <button
                onClick={addTextField}
                className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                title="Add Text Field"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={removeTextField}
                className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                title="Remove Text Field"
                disabled={textFields.length <= 1}
              >
                <Minus className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowTextSettings(!showTextSettings)}
                className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                title="Text Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <canvas 
                ref={previewCanvasRef}
                className="w-full h-auto cursor-move transition-transform duration-200"
                onClick={handleCanvasClick}
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="mt-4 flex items-center justify-between">
              {selectedImage && (
                <button
                  onClick={handleSaveMeme}
                  className="flex-1 mr-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Save Meme
                </button>
              )}
              <button
                onClick={() => setShowWatermark(!showWatermark)}
                className={`px-4 py-2 rounded-lg border transition-colors duration-300 ${
                  showWatermark 
                    ? 'border-green-500 text-green-500 hover:bg-green-500/10'
                    : 'border-red-500 text-red-500 hover:bg-red-500/10'
                }`}
              >
                Watermark
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={downloadOfflineVersion}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Save className="w-5 h-5" />
            Download Offline Version
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;