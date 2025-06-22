import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Settings, Wifi, WifiOff, Database, Filter, Loader2 } from 'lucide-react';
import { Food } from '../types/game';
import foodService from '../utils/foodService';
import { analytics } from '../utils/analytics';

interface GameInterfaceProps {
  onFeedFood: (foodName: string) => void;
  onResetGame: () => void;
  onSetMaxCalories: (calories: number) => void;
  gameOver: boolean;
  maxCalories: number;
  feedbackMessage: string;
  gameOverReason: string;
  isLoading: boolean;
}

export default function GameInterface({ 
  onFeedFood, 
  onResetGame, 
  onSetMaxCalories,
  gameOver, 
  maxCalories,
  feedbackMessage,
  gameOverReason,
  isLoading
}: GameInterfaceProps) {
  const [foodInput, setFoodInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [tempMaxCalories, setTempMaxCalories] = useState(maxCalories);
  const [suggestions, setSuggestions] = useState<Food[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchMode, setSearchMode] = useState(foodService.getSearchMode());

  const mode = foodService.getMode();

  const handleInputChange = async (value: string) => {
    setFoodInput(value);
    
    if (value.length >= 2) {
      setLoadingSuggestions(true);
      setShowSuggestions(true);
      try {
        const newSuggestions = await foodService.getFoodSuggestions(value);
        setSuggestions(newSuggestions);
      } catch (error) {
        console.error('Error getting suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoadingSuggestions(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (foodInput.trim() && !gameOver && !isLoading) {
      onFeedFood(foodInput.trim());
      setFoodInput('');
      setSuggestions([]);
      setShowSuggestions(false);
      setLoadingSuggestions(false);
    }
  };

  const handleSuggestionClick = (food: Food) => {
    // Auto-submit the selected food
    setFoodInput(food.name);
    setSuggestions([]);
    setShowSuggestions(false);
    setLoadingSuggestions(false);
    
    // Automatically feed the food to the character
    if (!gameOver && !isLoading) {
      onFeedFood(food.name);
      setFoodInput('');
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setLoadingSuggestions(false);
    }, 200);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSetMaxCalories(tempMaxCalories);
    foodService.setSearchMode(searchMode);
    setShowSettings(false);
    
    // Track calorie limit change
    analytics.trackCalorieLimitChange(tempMaxCalories);
  };

  const handleSearchModeChange = (mode: 'generic' | 'full') => {
    setSearchMode(mode);
  };

  const handleResetClick = () => {
    onResetGame();
    analytics.trackGameStart();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <h1 className="text-4xl font-bold text-gray-800">🍎 Calorie Climb 🍎</h1>
          <div className="flex items-center space-x-1">
            {mode === 'online' ? (
              <div className="flex items-center space-x-1 text-green-600">
                <Wifi className="w-4 h-4" />
                <span className="text-xs font-medium">Online</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-orange-600">
                <WifiOff className="w-4 h-4" />
                <span className="text-xs font-medium">Offline</span>
              </div>
            )}
          </div>
        </div>
        <p className="text-lg text-gray-600">Feed the person foods with more calories than the last!</p>
        {mode === 'online' && (
          <div className="flex items-center justify-center space-x-2 mt-1">
            <p className="text-sm text-green-600">✨ Enhanced with USDA food database and AI responses!</p>
            <div className="flex items-center space-x-1 text-blue-600">
              {searchMode === 'generic' ? (
                <>
                  <Filter className="w-3 h-3" />
                  <span className="text-xs">Generic Foods</span>
                </>
              ) : (
                <>
                  <Database className="w-3 h-3" />
                  <span className="text-xs">Full Database</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Feedback message - moved above input */}
      {feedbackMessage && !gameOver && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">{feedbackMessage}</p>
        </div>
      )}

      {gameOver ? (
        <div className="text-center space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-2xl font-bold text-red-800 mb-2">Game Over!</h2>
            <p className="text-red-700">{gameOverReason}</p>
          </div>
          <button
            onClick={handleResetClick}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Play className="w-5 h-5" />
            <span>Play Again</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="food-input" className="block text-lg font-medium text-gray-700 mb-2">
              What should the person eat next?
            </label>
            <div className="relative">
              <input
                id="food-input"
                type="text"
                value={foodInput}
                onChange={(e) => handleInputChange(e.target.value)}
                onBlur={handleInputBlur}
                onFocus={handleInputFocus}
                placeholder={mode === 'online' ? "Type any food name (e.g., banana, pizza, chocolate)..." : "Type a food name..."}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg pr-12"
                autoComplete="off"
                disabled={isLoading}
              />
              
              {/* Loading indicator for suggestions */}
              {loadingSuggestions && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                </div>
              )}
              
              {(showSuggestions && (suggestions.length > 0 || loadingSuggestions)) && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg max-h-80 overflow-y-auto">
                  {loadingSuggestions ? (
                    <div className="px-4 py-3 text-gray-500 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Searching foods...</span>
                      </div>
                    </div>
                  ) : (
                    suggestions.map((food, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(food)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center justify-between border-b border-gray-100 last:border-b-0 transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{food.emoji}</span>
                          <div>
                            <span className="font-medium capitalize">{food.name}</span>
                            {food.isFromUSDA && (
                              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded ml-2 inline-block">
                                USDA
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  i <= Math.floor(food.healthRating / 2) ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs">Click to feed!</span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={!foodInput.trim() || isLoading}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Feed the Person! 🍽️</span>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </form>
      )}

      {showSettings && (
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 space-y-4">
          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Calories Before Game Over:
              </label>
              <input
                type="number"
                value={tempMaxCalories}
                onChange={(e) => setTempMaxCalories(Number(e.target.value))}
                min="100"
                step="100"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>

            {mode === 'online' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  USDA Food Search Mode:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="searchMode"
                      value="generic"
                      checked={searchMode === 'generic'}
                      onChange={() => handleSearchModeChange('generic')}
                      className="text-blue-600"
                    />
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">"Lemonade" Mode - Filtered for generic foods (recommended)</span>
                    </div>
                  </label>
                  <p className="text-xs text-gray-600 ml-6">
                    Shows common foods like "banana", "apple", "chicken breast" and "lemonade" without brands
                  </p>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="searchMode"
                      value="full"
                      checked={searchMode === 'full'}
                      onChange={() => handleSearchModeChange('full')}
                      className="text-blue-600"
                    />
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">"Lem-o-made" Mode - Search entire USDA database</span>
                    </div>
                  </label>
                  <p className="text-xs text-gray-600 ml-6">
                    Shows all foods including specific brands and detailed descriptions (like "Lemo o made cold brew lemonade")
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
              >
                Update Settings
              </button>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleResetClick}
          className="inline-flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Game</span>
        </button>
      </div>
    </div>
  );
}