import React, { useReducer, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import Character from '../components/Character';
import GameInterface from '../components/GameInterface';
import GameStats from '../components/GameStats';
import FoodHistory from '../components/FoodHistory';
import WinModal from '../components/WinModal';
import { GameState, GameAction, CharacterState } from '../types/game';
import foodService from '../utils/foodService';
import { calculateCharacterState, checkGameOver } from '../utils/gameLogic';

const initialCharacterState: CharacterState = {
  happiness: 8,
  size: 2,
  health: 9,
  expression: 'happy'
};

const initialGameState: GameState = {
  currentFood: { name: 'water', calories: 0, emoji: '💧', healthRating: 10, description: 'Starting fresh with water!' },
  previousFood: null,
  score: 0,
  streak: 0,
  longestStreak: 0,
  totalCalories: 0,
  foodHistory: [{ name: 'water', calories: 0, emoji: '💧', healthRating: 10, description: 'Starting fresh with water!' }],
  character: initialCharacterState,
  gameOver: false,
  gameOverReason: '',
  maxCalories: 2000,
  feedbackMessage: `Welcome to Calorie Climb! The person just had some water (0 calories). Now find something with more calories to keep the game going! ${foodService.getMode() === 'online' ? '✨ Enhanced with real food data!' : ''}`,
  isOnlineMode: foodService.getMode() === 'online',
  isLoading: false,
  isWin: false
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_ONLINE_MODE':
      return {
        ...state,
        isOnlineMode: action.payload
      };

    case 'FEED_FOOD': {
      const { foodName, food, feedbackMessage } = action.payload;
      
      if (!food) {
        return {
          ...state,
          feedbackMessage: `Sorry, I don't know about "${foodName}". Try something like "apple", "banana", "pizza", or "chocolate"!`,
          isLoading: false
        };
      }
      
      const isValidMove = !state.currentFood || food.calories > state.currentFood.calories;
      
      if (!isValidMove && !food.isToxic) {
        return {
          ...state,
          gameOver: true,
          gameOverReason: `Game Over! ${food.name} (${food.calories} calories) does not have more calories than ${state.currentFood?.name} (${state.currentFood?.calories} calories). You needed to find something with more calories to continue the calorie climb!`,
          feedbackMessage: feedbackMessage || `Oops! ${food.name} does not have more calories than ${state.currentFood?.name}. Try again!`,
          isLoading: false,
          isWin: false
        };
      }
      
      const newTotalCalories = state.totalCalories + food.calories;
      const newCharacter = calculateCharacterState(food, state.character, newTotalCalories, state.maxCalories);
      const gameOverCheck = checkGameOver(food, newTotalCalories, state.maxCalories, newCharacter);
      
      if (gameOverCheck.gameOver) {
        return {
          ...state,
          currentFood: food,
          character: newCharacter,
          totalCalories: newTotalCalories,
          foodHistory: [...state.foodHistory, food],
          gameOver: true,
          gameOverReason: gameOverCheck.reason,
          feedbackMessage: feedbackMessage || gameOverCheck.reason,
          isLoading: false,
          isWin: gameOverCheck.isWin || false
        };
      }
      
      const newStreak = state.streak + 1;
      
      return {
        ...state,
        previousFood: state.currentFood,
        currentFood: food,
        score: state.score + 1,
        streak: newStreak,
        longestStreak: Math.max(state.longestStreak, newStreak),
        totalCalories: newTotalCalories,
        foodHistory: [...state.foodHistory, food],
        character: newCharacter,
        feedbackMessage: feedbackMessage || `Great choice! ${food.name} has ${food.calories} calories.`,
        isLoading: false
      };
    }
    
    case 'RESET_GAME':
      return {
        ...initialGameState,
        longestStreak: state.longestStreak,
        maxCalories: state.maxCalories,
        isOnlineMode: state.isOnlineMode
      };
      
    case 'SET_MAX_CALORIES':
      return {
        ...state,
        maxCalories: action.payload
      };
      
    default:
      return state;
  }
}

export default function GamePage() {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  const handleFeedFood = async (foodName: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const food = await foodService.findFood(foodName);
      
      if (food) {
        const feedbackMessage = await foodService.generateFeedbackMessage(
          food,
          gameState.currentFood,
          !gameState.currentFood || food.calories > gameState.currentFood.calories,
          gameState.character
        );
        
        dispatch({ 
          type: 'FEED_FOOD', 
          payload: { foodName, food, feedbackMessage } 
        });
      } else {
        dispatch({ 
          type: 'FEED_FOOD', 
          payload: { foodName, food: null, feedbackMessage: null } 
        });
      }
    } catch (error) {
      console.error('Error feeding food:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleResetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  const handleSetMaxCalories = (calories: number) => {
    dispatch({ type: 'SET_MAX_CALORIES', payload: calories });
  };

  // Update online mode status
  useEffect(() => {
    const mode = foodService.getMode();
    dispatch({ type: 'SET_ONLINE_MODE', payload: mode === 'online' });
  }, []);

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        {/* AI Disclaimer */}
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg shadow-sm p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-yellow-800">
              <p className="font-medium text-sm">
                Disclaimer: This game uses AI to generate nutritional information and advice. 
                All content is for entertainment and mild educational purposes only and should not replace professional medical or nutritional guidance.
              </p>
              <p className="text-xs mt-1 text-yellow-700">
                Always consult with a healthcare professional or registered dietitian for personalized nutrition advice.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Character and Game Interface */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <Character character={gameState.character} />
            </div>
            
            <GameInterface
              onFeedFood={handleFeedFood}
              onResetGame={handleResetGame}
              onSetMaxCalories={handleSetMaxCalories}
              gameOver={gameState.gameOver}
              maxCalories={gameState.maxCalories}
              feedbackMessage={gameState.feedbackMessage}
              gameOverReason={gameState.gameOverReason}
              isLoading={gameState.isLoading}
            />
          </div>
          
          {/* Right Column - Stats and History */}
          <div className="space-y-6">
            <GameStats
              score={gameState.score}
              streak={gameState.streak}
              longestStreak={gameState.longestStreak}
              totalCalories={gameState.totalCalories}
              maxCalories={gameState.maxCalories}
            />
            
            <FoodHistory foodHistory={gameState.foodHistory} />
          </div>
        </div>
      </div>

      {/* Win Modal */}
      <WinModal
        isOpen={gameState.gameOver && gameState.isWin === true}
        onClose={() => {}}
        onPlayAgain={handleResetGame}
        score={gameState.score}
        totalCalories={gameState.totalCalories}
        maxCalories={gameState.maxCalories}
      />
    </div>
  );
}