import React from 'react';
import { Trophy, Target, Zap } from 'lucide-react';

interface GameStatsProps {
  score: number;
  streak: number;
  longestStreak: number;
  totalCalories: number;
  maxCalories: number;
}

export default function GameStats({ 
  score, 
  streak, 
  longestStreak, 
  totalCalories, 
  maxCalories 
}: GameStatsProps) {
  const caloriePercentage = (totalCalories / maxCalories) * 100;
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Game Stats</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3 bg-blue-50 p-3 rounded-lg">
          <Target className="w-8 h-8 text-blue-600" />
          <div>
            <p className="text-sm text-gray-600">Score</p>
            <p className="text-2xl font-bold text-blue-600">{score}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 bg-green-50 p-3 rounded-lg">
          <Zap className="w-8 h-8 text-green-600" />
          <div>
            <p className="text-sm text-gray-600">Current Streak</p>
            <p className="text-2xl font-bold text-green-600">{streak}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 bg-yellow-50 p-3 rounded-lg">
          <Trophy className="w-8 h-8 text-yellow-600" />
          <div>
            <p className="text-sm text-gray-600">Best Streak</p>
            <p className="text-2xl font-bold text-yellow-600">{longestStreak}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Calories Consumed</span>
          <span className="text-sm text-gray-600">{totalCalories} / {maxCalories}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              caloriePercentage < 50 ? 'bg-green-500' :
              caloriePercentage < 75 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(caloriePercentage, 100)}%` }}
          />
        </div>
        {caloriePercentage > 80 && (
          <p className="text-sm text-red-600 mt-1">⚠️ Getting close to the limit!</p>
        )}
      </div>
    </div>
  );
}