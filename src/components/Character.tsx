import React from 'react';
import { CharacterState } from '../types/game';

interface CharacterProps {
  character: CharacterState;
}

export default function Character({ character }: CharacterProps) {
  const getHeadColor = () => {
    if (character.health >= 8) return '#FED7D7'; // Light pink - healthy
    if (character.health >= 6) return '#FEF5E7'; // Light yellow - okay
    if (character.health >= 4) return '#FFF5F5'; // Very light red - not great
    return '#FEB2B2'; // Light red - sick
  };

  const getBodySize = () => {
    const baseSize = 60;
    return baseSize + (character.size - 1) * 15;
  };

  const getExpression = () => {
    switch (character.expression) {
      case 'happy':
        return { eyes: '😊', mouth: '😊' };
      case 'excited':
        return { eyes: '🤩', mouth: '🤩' };
      case 'neutral':
        return { eyes: '😐', mouth: '😐' };
      case 'sad':
        return { eyes: '😞', mouth: '😞' };
      case 'stuffed':
        return { eyes: '🤧', mouth: '🤧' };
      case 'sick':
        return { eyes: '🤢', mouth: '🤢' };
      default:
        return { eyes: '😊', mouth: '😊' };
    }
  };

  const bodySize = getBodySize();
  const expression = getExpression();

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative animate-bounce">
        {/* Head */}
        <div 
          className="w-20 h-20 rounded-full border-4 border-gray-800 flex items-center justify-center mb-2 transition-all duration-500"
          style={{ backgroundColor: getHeadColor() }}
        >
          <div className="text-2xl">
            {character.expression === 'happy' && '😊'}
            {character.expression === 'excited' && '🤩'}
            {character.expression === 'neutral' && '😐'}
            {character.expression === 'sad' && '😞'}
            {character.expression === 'stuffed' && '🤧'}
            {character.expression === 'sick' && '🤢'}
          </div>
        </div>
        
        {/* Body */}
        <div 
          className="bg-blue-200 border-4 border-gray-800 rounded-lg transition-all duration-500 mx-auto"
          style={{ 
            width: `${bodySize}px`, 
            height: `${bodySize + 20}px`,
          }}
        />
        
        {/* Arms */}
        <div className="absolute top-24 -left-8 w-12 h-1 bg-gray-800 rounded transform -rotate-45" />
        <div className="absolute top-24 -right-8 w-12 h-1 bg-gray-800 rounded transform rotate-45" />
        
        {/* Legs */}
        <div className="flex justify-center space-x-4 mt-2">
          <div className="w-1 h-16 bg-gray-800 rounded" />
          <div className="w-1 h-16 bg-gray-800 rounded" />
        </div>
        
        {/* Feet */}
        <div className="flex justify-center space-x-2 -mt-1">
          <div className="w-6 h-1 bg-gray-800 rounded" />
          <div className="w-6 h-1 bg-gray-800 rounded" />
        </div>
      </div>
      
      {/* Health indicators */}
      <div className="mt-4 text-center">
        <div className="flex justify-center space-x-1 mb-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i <= character.health ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600">Health: {character.health}/10</p>
        <p className="text-sm text-gray-600">Happiness: {character.happiness}/10</p>
        <p className="text-sm text-gray-600">Fullness: {character.size}/5</p>
      </div>
    </div>
  );
}