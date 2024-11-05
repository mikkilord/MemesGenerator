import React, { useState } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { MemeGeneratorInput } from './MemeGeneratorInput';
import { ErrorMessage } from './ErrorMessage';

interface AIMemeGeneratorProps {
  onMemeGenerated: (topText: string, bottomText: string) => void;
}

const AIMemeGenerator: React.FC<AIMemeGeneratorProps> = ({ onMemeGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMeme = async () => {
    if (!prompt) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyA4Hjm4UBu-4OlZxnzrGa2XRT9fZtXKwBA', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Create a funny meme with top and bottom text based on this idea: ${prompt}. Return ONLY a JSON object in this exact format without any additional text: {"topText": "your top text here", "bottomText": "your bottom text here"}. Make it humorous and creative.`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from API');
      }

      const text = data.candidates[0].content.parts[0].text.trim();
      let result;

      try {
        // Try to parse the entire response first
        result = JSON.parse(text);
      } catch (e) {
        // If that fails, try to find and parse just the JSON object
        const match = text.match(/\{[\s\S]*\}/);
        if (!match) {
          throw new Error('Could not find valid JSON in response');
        }
        result = JSON.parse(match[0]);
      }

      if (!result.topText || !result.bottomText) {
        throw new Error('Response missing required text fields');
      }

      onMemeGenerated(result.topText, result.bottomText);
    } catch (error) {
      console.error('Error generating meme text:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate meme text');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <MemeGeneratorInput
        prompt={prompt}
        setPrompt={setPrompt}
        isGenerating={isGenerating}
        onGenerate={generateMeme}
      />
      {error && <ErrorMessage message={error} />}
    </div>
  );
};

export default AIMemeGenerator;