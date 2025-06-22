import React, { useEffect, useState } from 'react';
import { Trophy, Star, RotateCcw } from 'lucide-react';

interface WinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
  score: number;
  totalCalories: number;
  maxCalories: number;
}

export default function WinModal({ 
  isOpen, 
  onClose, 
  onPlayAgain, 
  score, 
  totalCalories, 
  maxCalories 
}: WinModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Stop confetti after 3 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][
                    Math.floor(Math.random() * 6)
                  ],
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-xl max-w-md w-full transform animate-pulse">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-t-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Trophy className="w-16 h-16 text-white animate-bounce" />
              <div className="absolute -top-2 -right-2">
                <Star className="w-6 h-6 text-yellow-200 animate-spin" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">🎉 CONGRATULATIONS! 🎉</h1>
          <p className="text-xl text-yellow-100">You Won the Game!</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Perfect Calorie Management!</h2>
            <p className="text-gray-600">
              You successfully reached the maximum calorie limit while keeping your person healthy and happy!
            </p>
          </div>

          {/* Achievement Stats */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Foods Eaten:</span>
              <span className="text-2xl font-bold text-green-600">{score}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Total Calories:</span>
              <span className="text-2xl font-bold text-blue-600">{totalCalories}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Calorie Goal:</span>
              <span className="text-2xl font-bold text-purple-600">{maxCalories}</span>
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-yellow-100 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-xs font-medium text-yellow-800">Winner</div>
            </div>
            <div className="bg-green-100 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">🌟</div>
              <div className="text-xs font-medium text-green-800">Healthy</div>
            </div>
            <div className="bg-blue-100 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">🎯</div>
              <div className="text-xs font-medium text-blue-800">Perfect</div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-center font-medium">
              🎊 Amazing job! You've mastered the art of balanced eating! 🎊
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onPlayAgain}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Play Again</span>
            </button>
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}