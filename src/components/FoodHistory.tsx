import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { Food } from '../types/game';
import FoodDetailModal from './FoodDetailModal';

interface FoodHistoryProps {
  foodHistory: Food[];
}

export default function FoodHistory({ foodHistory }: FoodHistoryProps) {
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  const handleFoodClick = (food: Food) => {
    setSelectedFood(food);
  };

  const closeModal = () => {
    setSelectedFood(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Food Journey</h2>
        
        {foodHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No food eaten yet! Start with something low in calories.</p>
        ) : (
          <div className="space-y-3">
            {foodHistory.map((food, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                onClick={() => handleFoodClick(food)}
              >
                <span className="text-2xl">{food.emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800 capitalize">{food.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{food.calories} cal</span>
                      {food.isFromUSDA && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">USDA</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i <= Math.floor(food.healthRating / 2) ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">Health: {food.healthRating}/10</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Info className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      <span className="text-lg font-bold text-blue-600">#{index + 1}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FoodDetailModal
        food={selectedFood!}
        isOpen={!!selectedFood}
        onClose={closeModal}
      />
    </>
  );
}