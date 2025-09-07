import { useState, useRef, useCallback } from 'react';

// FIX: Add type definitions for the Web Speech API to resolve TypeScript errors.
// These types are not part of the standard TypeScript DOM library.
// By defining these interfaces and augmenting the global Window object,
// we make TypeScript aware of the Speech Recognition API's existence.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onend: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionStatic;
    webkitSpeechRecognition?: SpeechRecognitionStatic;
  }
}

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
  isSupported: boolean;
}

const getSpeechRecognition = () => {
  if (typeof window !== 'undefined') {
    return window.SpeechRecognition || window.webkitSpeechRecognition;
  }
  return undefined;
};

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  // FIX: Renamed variable to avoid shadowing the global 'SpeechRecognition' type,
  // which caused a TypeScript error when used in `useRef<SpeechRecognition>`.
  const SpeechRecognitionAPI = getSpeechRecognition();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const startListening = useCallback(() => {
    if (isListening || !SpeechRecognitionAPI) {
      if (!SpeechRecognitionAPI) {
        setError("Speech recognition is not supported in this browser.");
      }
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setError(null);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setError(event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
           setTranscript(prev => prev ? `${prev.trim()} ${finalTranscript.trim()}` : finalTranscript.trim());
        }
      };

      recognition.start();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred during initialization.');
      setIsListening(false);
    }
  }, [SpeechRecognitionAPI, isListening]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    error,
    isSupported: !!SpeechRecognitionAPI,
  };
};
