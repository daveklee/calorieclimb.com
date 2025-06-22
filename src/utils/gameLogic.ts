import { Food, CharacterState, GameState } from '../types/game';

export function calculateCharacterState(
  currentFood: Food,
  previousState: CharacterState,
  totalCalories: number,
  maxCalories: number
): CharacterState {
  let newState = { ...previousState };
  
  // Handle toxic foods
  if (currentFood.isToxic) {
    return {
      happiness: 1,
      size: previousState.size,
      health: 1,
      expression: 'sick'
    };
  }
  
  // Adjust happiness based on health rating
  if (currentFood.healthRating >= 8) {
    newState.happiness = Math.min(10, newState.happiness + 2);
    newState.expression = 'happy';
  } else if (currentFood.healthRating >= 6) {
    newState.happiness = Math.max(1, newState.happiness);
    newState.expression = 'neutral';
  } else if (currentFood.healthRating >= 3) {
    newState.happiness = Math.max(1, newState.happiness - 1);
    newState.expression = 'neutral';
  } else {
    newState.happiness = Math.max(1, newState.happiness - 2);
    newState.expression = 'sad';
  }
  
  // Adjust size based on calories
  if (currentFood.calories > 300) {
    newState.size = Math.min(5, newState.size + 1);
    if (newState.size >= 4) {
      newState.expression = 'stuffed';
    }
  } else if (currentFood.calories > 150) {
    newState.size = Math.min(5, newState.size + 0.5);
  }
  
  // Adjust health based on total calories and food healthiness
  const calorieRatio = totalCalories / maxCalories;
  if (calorieRatio > 0.8) {
    newState.health = Math.max(1, newState.health - 2);
    newState.expression = 'sick';
  } else if (calorieRatio > 0.6) {
    newState.health = Math.max(1, newState.health - 1);
  } else if (currentFood.healthRating >= 8) {
    newState.health = Math.min(10, newState.health + 1);
  } else if (currentFood.healthRating <= 3) {
    newState.health = Math.max(1, newState.health - 1);
  }
  
  return newState;
}

export function generateFeedbackMessage(
  currentFood: Food,
  previousFood: Food | null,
  isValidMove: boolean,
  character: CharacterState
): string {
  if (currentFood.isToxic) {
    return `Oh no! ${currentFood.name} is not safe to eat! The person is feeling very sick and needs help immediately. That's why we should never eat things that aren't food!`;
  }
  
  if (!isValidMove && previousFood) {
    return `Oops! ${currentFood.name} (${currentFood.calories} calories) does not have more calories than ${previousFood.name} (${previousFood.calories} calories). Remember, we need to climb up the calorie ladder!`;
  }
  
  let message = `Great choice! ${currentFood.name} ${currentFood.description} `;
  
  if (previousFood) {
    message += `It has ${currentFood.calories} calories compared to ${previousFood.name}'s ${previousFood.calories} calories. `;
  }
  
  // Add character reaction
  if (character.expression === 'happy') {
    message += "The person is really enjoying this healthy choice! 😊";
  } else if (character.expression === 'excited') {
    message += "The person is excited about this tasty food! 🤩";
  } else if (character.expression === 'neutral') {
    message += "The person is satisfied with this choice. 😐";
  } else if (character.expression === 'sad') {
    message += "The person doesn't feel great about this choice... 😞";
  } else if (character.expression === 'stuffed') {
    message += "The person is getting really full! Maybe lighter foods next time? 😵";
  } else if (character.expression === 'sick') {
    message += "The person isn't feeling well from all this food... 🤢";
  }
  
  return message;
}

export function checkGameOver(
  currentFood: Food,
  totalCalories: number,
  maxCalories: number,
  character: CharacterState
): { gameOver: boolean; reason: string; isWin?: boolean } {
  if (currentFood.isToxic) {
    return {
      gameOver: true,
      reason: `Game Over! The person ate ${currentFood.name} which is toxic and dangerous. Always remember to only eat safe, real food! The person needs medical attention right away.`,
      isWin: false
    };
  }
  
  // Check for win condition - reached max calories while staying healthy
  if (totalCalories >= maxCalories) {
    if (character.health >= 6 && character.happiness >= 6) {
      return {
        gameOver: true,
        reason: `🎉 CONGRATULATIONS! You've successfully reached ${totalCalories} calories while keeping your person healthy and happy! You've mastered the art of balanced eating! 🎉`,
        isWin: true
      };
    } else {
      return {
        gameOver: true,
        reason: `Game Over! The person has eaten ${totalCalories} calories, which is way too much for one day! Their stomach hurts and they feel very sick. Remember, eating too much can make us feel awful and hurt our health.`,
        isWin: false
      };
    }
  }
  
  if (character.health <= 2 && character.expression === 'sick') {
    return {
      gameOver: true,
      reason: `Game Over! The person has eaten too many unhealthy foods and is feeling very sick. Their body can't handle all the junk food! Remember, our bodies work best with nutritious, healthy foods.`,
      isWin: false
    };
  }
  
  return { gameOver: false, reason: '', isWin: false };
}