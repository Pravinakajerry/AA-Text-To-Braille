import React, { useState } from 'react';
import type { TranslationResult } from '../types';

interface BrailleDisplayProps {
  translation: TranslationResult | null;
  isLoading: boolean;
  error: string | null;
  isRecording: boolean;
}

const BrailleDisplay: React.FC<BrailleDisplayProps> = ({ translation, isLoading, error, isRecording }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getDisplayContent = () => {
    if (error) {
      return (
        <div className="text-center p-8 bg-red-100 rounded-lg border border-red-200">
          <h2 className="text-2xl font-bold mb-2 text-red-800">Error</h2>
          <p className="text-red-700">{error}</p>
        </div>
      );
    }
    
    if (isLoading) {
      return <p className="text-2xl text-gray-500 animate-pulse">Translating...</p>;
    }
    
    if (isRecording) {
      return (
        <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-sky-500 rounded-full animate-pulse"></div>
            <p className="text-2xl text-gray-500">Listening...</p>
        </div>
      );
    }

    if (translation) {
      return (
        <div
          className="relative w-full text-center cursor-help"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <p
            className={`text-5xl leading-relaxed font-mono text-gray-800 transition-opacity duration-300 ease-in-out ${isHovered ? 'opacity-0' : 'opacity-100'}`}
            aria-hidden={isHovered}
          >
            {translation.braille || '...'}
          </p>
          <p
            className={`absolute inset-0 flex items-center justify-center text-3xl font-sans text-gray-800 transition-opacity duration-300 ease-in-out pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden={!isHovered}
          >
            {translation.original}
          </p>
        </div>
      );
    }
    
    return <p className="text-2xl text-gray-500">Press and hold the spacebar to begin.</p>;
  };

  return (
    <div className="w-full min-h-[10rem] flex items-center justify-center transition-opacity duration-300">
      {getDisplayContent()}
    </div>
  );
};

export default BrailleDisplay;