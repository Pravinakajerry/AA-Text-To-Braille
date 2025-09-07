import React, { useState, useEffect, useCallback } from 'react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { translateToBraille } from './services/geminiService';
import SpacebarButton from './components/SpacebarButton';
import BrailleDisplay from './components/BrailleDisplay';
import type { TranslationResult } from './types';

const App: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [translation, setTranslation] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    startListening,
    stopListening,
    transcript,
    error: speechError,
    isListening,
  } = useSpeechRecognition();

  const handleStartRecording = useCallback(() => {
    if (isListening) return;
    setError(null);
    setTranslation(null);
    setIsRecording(true);
    startListening();
  }, [isListening, startListening]);

  const handleStopRecording = useCallback(async () => {
    if (!isListening) return;
    setIsRecording(false);
    stopListening();
  }, [isListening, stopListening]);

  useEffect(() => {
    if (speechError) {
      setError(`Speech Recognition Error: ${speechError}`);
      setIsRecording(false);
    }
  }, [speechError]);
  
  useEffect(() => {
    const processTranscript = async () => {
      if (transcript && !isListening && !isLoading) {
        setIsLoading(true);
        setError(null);
        try {
          const brailleText = await translateToBraille(transcript);
          setTranslation({ original: transcript, braille: brailleText });
        } catch (e) {
          setError(e instanceof Error ? `Translation Error: ${e.message}` : 'An unknown error occurred.');
          setTranslation(null);
        } finally {
          setIsLoading(false);
        }
      }
    };
    processTranscript();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, isListening]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !event.repeat) {
        event.preventDefault();
        handleStartRecording();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        handleStopRecording();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleStartRecording, handleStopRecording]);

  return (
    <main className="relative flex flex-col items-center justify-center h-screen w-screen bg-[#f5f5f5] text-gray-800 font-sans overflow-hidden p-4">
      <h1 className="absolute top-4 text-center text-gray-600">Text to Braille</h1>
      <div className="flex-grow flex items-center justify-center w-full max-w-4xl">
        <BrailleDisplay translation={translation} isLoading={isLoading} error={error} isRecording={isRecording} />
      </div>
      <div className="w-full flex justify-center pb-8 pt-4">
        <SpacebarButton
          isRecording={isRecording}
          onStart={handleStartRecording}
          onStop={handleStopRecording}
        />
      </div>
    </main>
  );
};

export default App;