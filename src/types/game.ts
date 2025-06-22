export interface Food {
  name: string;
  calories: number;
  emoji: string;
  healthRating: number; // 1-10, 1 being very unhealthy, 10 being very healthy
  description: string;
  isToxic?: boolean;
  // USDA API fields
  fdcId?: number;
  brandOwner?: string;
  ingredients?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  nutrients?: Nutrient[];
  isFromUSDA?: boolean;
  dataType?: string; // Add data type for enhanced display
  additionalDescriptions?: string; // Add FNDDS additional descriptions
}

export interface Nutrient {
  name: string;
  amount: number;
  unit: string;
}

export interface USDAFoodSearchResult {
  fdcId: number;
  description: string;
  brandOwner?: string;
  ingredients?: string;
  dataType: string;
}

export interface USDAFoodDetails {
  fdcId: number;
  description: string;
  brandOwner?: string;
  ingredients?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  dataType?: string; // Add data type to details
  additionalDescriptions?: string; // Add FNDDS additional descriptions
  foodNutrients: Array<{
    nutrient: {
      name: string;
      unitName: string;
    };
    amount: number;
  }>;
}

export interface CharacterState {
  happiness: number; // 1-10
  size: number; // 1-5, represents how full/big the character is
  health: number; // 1-10
  expression: 'happy' | 'neutral' | 'sad' | 'sick' | 'excited' | 'stuffed';
}

export interface GameState {
  currentFood: Food | null;
  previousFood: Food | null;
  score: number;
  streak: number;
  longestStreak: number;
  totalCalories: number;
  foodHistory: Food[];
  character: CharacterState;
  gameOver: boolean;
  gameOverReason: string;
  maxCalories: number;
  feedbackMessage: string;
  isOnlineMode: boolean;
  isLoading: boolean;
  isWin?: boolean;
}

export interface GameAction {
  type: 'FEED_FOOD' | 'RESET_GAME' | 'SET_MAX_CALORIES' | 'SET_LOADING' | 'SET_ONLINE_MODE';
  payload?: any;
}