import React from 'react';

interface SpacebarButtonProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
}

const SpacebarButton: React.FC<SpacebarButtonProps> = ({ isRecording, onStart, onStop }) => {
  const buttonClasses = `
    relative flex items-center justify-center
    w-full max-w-md h-16 px-8
    rounded-xl border-b-4 border-gray-300
    bg-gradient-to-b from-white to-gray-100
    text-gray-700 text-lg font-semibold tracking-wider
    select-none cursor-pointer
    transition-all duration-100 ease-in-out
    shadow-md
    focus:outline-none focus:ring-4 focus:ring-sky-500 focus:ring-opacity-50
    ${
      isRecording
        ? 'transform scale-95 border-b-2 border-gray-400 shadow-inner bg-gradient-to-t from-gray-200 to-gray-300'
        : 'hover:from-gray-50 hover:to-gray-200'
    }
  `;

  return (
    <div
      className={buttonClasses}
      onMouseDown={onStart}
      onMouseUp={onStop}
      onTouchStart={(e) => { e.preventDefault(); onStart(); }}
      onTouchEnd={(e) => { e.preventDefault(); onStop(); }}
      role="button"
      aria-pressed={isRecording}
      tabIndex={0}
    >
      <span className="z-10">Hold Spacebar & Speak</span>
       {isRecording && (
        <div className="absolute inset-0 bg-sky-500/50 rounded-xl animate-pulse"></div>
      )}
    </div>
  );
};

export default SpacebarButton;