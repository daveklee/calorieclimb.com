import React from 'react';
import { X, Info, Database, FileText } from 'lucide-react';
import { Food } from '../types/game';

interface FoodDetailModalProps {
  food: Food;
  isOpen: boolean;
  onClose: () => void;
}

export default function FoodDetailModal({ food, isOpen, onClose }: FoodDetailModalProps) {
  if (!isOpen) return null;

  // Check if this is a Survey (FNDDS) food with additional description
  const isFNDDSFood = food.dataType === 'Survey (FNDDS)' && food.description.includes('FNDDS Description:');
  let displayDescription = food.description;
  let fnddsDescription = '';

  if (isFNDDSFood) {
    const parts = food.description.split('FNDDS Description:');
    displayDescription = parts[0].trim();
    fnddsDescription = parts[1]?.trim() || '';
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{food.emoji}</span>
            <h2 className="text-2xl font-bold text-gray-800 capitalize">{food.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{food.calories}</div>
              <div className="text-sm text-gray-600">Calories</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="flex justify-center space-x-1 mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i <= Math.floor(food.healthRating / 2) ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600">Health Rating</div>
            </div>
            {food.servingSize && (
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-lg font-bold text-yellow-600">
                  {food.servingSize} {food.servingSizeUnit}
                </div>
                <div className="text-sm text-gray-600">Serving Size</div>
              </div>
            )}
            {food.brandOwner && (
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-sm font-bold text-purple-600">{food.brandOwner}</div>
                <div className="text-sm text-gray-600">Brand</div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-600">{displayDescription}</p>
          </div>

          {/* FNDDS Additional Description */}
          {isFNDDSFood && fnddsDescription && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Database className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Survey (FNDDS) Food Description</span>
              </div>
              <p className="text-green-700 text-sm">
                {fnddsDescription}
              </p>
              <p className="text-green-600 text-xs mt-2">
                This detailed description comes from the USDA Food and Nutrient Database for Dietary Studies (FNDDS), 
                which provides comprehensive food composition data used in national nutrition surveys.
              </p>
            </div>
          )}

          {/* FNDDS Additional Food Description Field */}
          {food.additionalDescriptions && food.dataType === 'Survey (FNDDS)' && (
            <div className="bg-emerald-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-emerald-800">Additional Food Description (FNDDS)</span>
              </div>
              <p className="text-emerald-700 text-sm">
                {food.additionalDescriptions}
              </p>
              <p className="text-emerald-600 text-xs mt-2">
                This additional description provides extra context and details about the food item's 
                preparation, ingredients, or characteristics as recorded in the FNDDS database.
              </p>
            </div>
          )}

          {/* Nutrients */}
          {food.nutrients && food.nutrients.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Nutrition Facts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {food.nutrients.map((nutrient, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{nutrient.name}</span>
                    <span className="font-medium text-gray-900">
                      {nutrient.amount.toFixed(1)} {nutrient.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ingredients */}
          {food.ingredients && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Ingredients</h3>
              <p className="text-gray-600 text-sm">{food.ingredients}</p>
            </div>
          )}

          {/* USDA Info */}
          {food.isFromUSDA && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">USDA Food Database</span>
                {food.dataType && (
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                    {food.dataType}
                  </span>
                )}
              </div>
              <p className="text-blue-700 text-sm">
                This information comes from the official USDA Food Data Central database, 
                providing accurate nutritional data for educational purposes.
              </p>
              {food.fdcId && (
                <p className="text-blue-600 text-xs mt-1">Food ID: {food.fdcId}</p>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}