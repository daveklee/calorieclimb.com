import { Food } from '../types/game';

export const foodDatabase: Food[] = [
  // Starting item
  { name: 'water', calories: 0, emoji: '💧', healthRating: 10, description: 'Essential for life! Zero calories and super healthy.' },
  
  // Low calorie healthy foods
  { name: 'cucumber', calories: 16, emoji: '🥒', healthRating: 9, description: 'Crispy and refreshing! Very low in calories and full of water.' },
  { name: 'lettuce', calories: 5, emoji: '🥬', healthRating: 9, description: 'Leafy greens are amazing! Almost no calories but lots of nutrients.' },
  { name: 'celery', calories: 6, emoji: '🥬', healthRating: 9, description: 'Crunchy and fun to eat! Burns almost as many calories as it contains.' },
  { name: 'spinach', calories: 23, emoji: '🥬', healthRating: 10, description: 'Popeye\'s favorite! Super nutritious and very low in calories.' },
  
  // Fruits
  { name: 'apple', calories: 95, emoji: '🍎', healthRating: 9, description: 'An apple a day keeps the doctor away! Sweet, crunchy, and healthy.' },
  { name: 'banana', calories: 105, emoji: '🍌', healthRating: 8, description: 'Great for energy! Potassium-rich and naturally sweet.' },
  { name: 'orange', calories: 87, emoji: '🍊', healthRating: 9, description: 'Packed with vitamin C! Juicy and refreshing.' },
  { name: 'grapes', calories: 110, emoji: '🍇', healthRating: 8, description: 'Nature\'s candy! Sweet and full of antioxidants.' },
  { name: 'strawberries', calories: 50, emoji: '🍓', healthRating: 9, description: 'Sweet and low in calories! Perfect healthy snack.' },
  
  // Vegetables
  { name: 'carrot', calories: 25, emoji: '🥕', healthRating: 9, description: 'Great for your eyes! Crunchy and naturally sweet.' },
  { name: 'broccoli', calories: 55, emoji: '🥦', healthRating: 10, description: 'Little green trees! Super nutritious and cancer-fighting.' },
  { name: 'tomato', calories: 35, emoji: '🍅', healthRating: 8, description: 'Technically a fruit! Full of vitamins and very tasty.' },
  
  // Proteins
  { name: 'chicken breast', calories: 165, emoji: '🍗', healthRating: 7, description: 'Lean protein power! Helps build strong muscles.' },
  { name: 'salmon', calories: 206, emoji: '🐟', healthRating: 8, description: 'Brain food! Rich in omega-3 fatty acids.' },
  { name: 'egg', calories: 78, emoji: '🥚', healthRating: 8, description: 'Perfect protein! Contains all essential amino acids.' },
  { name: 'tofu', calories: 94, emoji: '🥩', healthRating: 7, description: 'Plant-based protein! Great for vegetarians.' },
  
  // Dairy
  { name: 'milk', calories: 103, emoji: '🥛', healthRating: 7, description: 'Builds strong bones! Rich in calcium and protein.' },
  { name: 'yogurt', calories: 100, emoji: '🥛', healthRating: 8, description: 'Good bacteria for your tummy! Creamy and nutritious.' },
  { name: 'cheese', calories: 113, emoji: '🧀', healthRating: 6, description: 'Calcium-rich but watch the fat! Delicious in moderation.' },
  
  // Grains
  { name: 'rice', calories: 130, emoji: '🍚', healthRating: 6, description: 'Energy fuel! Carbs to power your day.' },
  { name: 'bread', calories: 79, emoji: '🍞', healthRating: 5, description: 'Comfort food! Better when it\'s whole grain.' },
  { name: 'pasta', calories: 131, emoji: '🍝', healthRating: 5, description: 'Italian favorite! Carbs for energy, but watch the portions.' },
  { name: 'oatmeal', calories: 68, emoji: '🥣', healthRating: 8, description: 'Breakfast champion! Fiber-rich and keeps you full.' },
  
  // Nuts and seeds
  { name: 'almonds', calories: 164, emoji: '🥜', healthRating: 8, description: 'Brain food! Healthy fats and protein in a tiny package.' },
  { name: 'peanuts', calories: 161, emoji: '🥜', healthRating: 7, description: 'Not actually nuts, but legumes! Protein-packed.' },
  
  // Moderate calorie foods
  { name: 'avocado', calories: 234, emoji: '🥑', healthRating: 8, description: 'Healthy fats galore! Creamy and heart-healthy.' },
  { name: 'pizza slice', calories: 285, emoji: '🍕', healthRating: 4, description: 'Tasty but high in calories! Enjoy as a special treat.' },
  { name: 'hamburger', calories: 354, emoji: '🍔', healthRating: 3, description: 'Classic comfort food! High in calories and fat.' },
  { name: 'french fries', calories: 365, emoji: '🍟', healthRating: 2, description: 'Crispy but not healthy! Lots of oil and calories.' },
  
  // High calorie foods
  { name: 'chocolate bar', calories: 235, emoji: '🍫', healthRating: 3, description: 'Sweet treat! High in sugar and calories.' },
  { name: 'ice cream', calories: 207, emoji: '🍦', healthRating: 3, description: 'Cold and creamy! High in sugar and fat.' },
  { name: 'donut', calories: 269, emoji: '🍩', healthRating: 2, description: 'Sweet and fried! Very high in sugar and calories.' },
  { name: 'cake', calories: 365, emoji: '🍰', healthRating: 2, description: 'Birthday special! Lots of sugar and calories.' },
  { name: 'cookies', calories: 142, emoji: '🍪', healthRating: 3, description: 'Sweet treats! High in sugar, eat in moderation.' },
  
  // Very high calorie foods
  { name: 'milkshake', calories: 530, emoji: '🥤', healthRating: 2, description: 'Liquid calories! Very high in sugar and fat.' },
  { name: 'cheeseburger', calories: 540, emoji: '🍔', healthRating: 2, description: 'Super size calories! Very high in fat and calories.' },
  { name: 'fried chicken', calories: 320, emoji: '🍗', healthRating: 3, description: 'Crispy but greasy! High in calories from frying.' },
  
  // Unhealthy/toxic items (but NO alcohol since this is for kids)
  { name: 'energy drink', calories: 110, emoji: '⚡', healthRating: 1, description: 'Too much caffeine! Can make your heart race.' },
  { name: 'raw meat', calories: 143, emoji: '🥩', healthRating: 1, description: 'Dangerous bacteria! Always cook meat before eating.', isToxic: true },
  { name: 'soap', calories: 0, emoji: '🧼', healthRating: 1, description: 'Not food! Very dangerous to eat!', isToxic: true },
  { name: 'poison', calories: 0, emoji: '☠️', healthRating: 1, description: 'Extremely dangerous! Never eat anything poisonous!', isToxic: true },
];

export function findFood(name: string): Food | null {
  const normalizedName = name.toLowerCase().trim();
  
  // Check for alcohol-related terms and reject them
  const alcoholKeywords = [
    'beer', 'wine', 'liquor', 'liqueur', 'whiskey', 'whisky', 'vodka', 'rum', 'gin', 'tequila',
    'brandy', 'cognac', 'bourbon', 'scotch', 'champagne', 'cocktail', 'martini', 'margarita',
    'bloody mary', 'mojito', 'daiquiri', 'cosmopolitan', 'manhattan', 'old fashioned',
    'alcoholic', 'alcohol', 'ethanol', 'proof', 'distilled', 'fermented', 'brewed',
    'sake', 'mead', 'cider', 'ale', 'lager', 'stout', 'porter', 'pilsner',
    'absinthe', 'amaretto', 'baileys', 'kahlua', 'sambuca', 'schnapps',
    'aperitif', 'digestif', 'cordial', 'bitters', 'vermouth', 'sherry', 'port',
    'mixed drink', 'hard seltzer', 'wine cooler', 'sangria', 'punch, alcoholic',
    'beverage, alcoholic', 'drink, alcoholic'
  ];
  
  const containsAlcohol = alcoholKeywords.some(keyword => 
    normalizedName.includes(keyword)
  );
  
  if (containsAlcohol) {
    console.log('Offline alcohol-related food rejected:', normalizedName);
    return null; // Don't return any alcohol-related foods
  }
  
  // First, try to find an exact match
  const exactMatch = foodDatabase.find(food => 
    food.name.toLowerCase() === normalizedName
  );
  
  if (exactMatch) {
    return exactMatch;
  }
  
  // If no exact match, look for foods that start with the input
  const startsWithMatch = foodDatabase.find(food => 
    food.name.toLowerCase().startsWith(normalizedName)
  );
  
  if (startsWithMatch) {
    return startsWithMatch;
  }
  
  // Finally, look for partial matches, but prioritize longer food names
  const partialMatches = foodDatabase.filter(food => 
    food.name.toLowerCase().includes(normalizedName) ||
    normalizedName.includes(food.name.toLowerCase())
  );
  
  if (partialMatches.length > 0) {
    // Sort by name length (descending) to prioritize longer, more specific names
    partialMatches.sort((a, b) => b.name.length - a.name.length);
    return partialMatches[0];
  }
  
  return null;
}

export function getFoodSuggestions(input: string): Food[] {
  if (input.length < 2) return [];
  
  const normalizedInput = input.toLowerCase();
  
  // Check for alcohol-related terms and return empty if found
  const alcoholKeywords = [
    'beer', 'wine', 'liquor', 'liqueur', 'whiskey', 'whisky', 'vodka', 'rum', 'gin', 'tequila',
    'brandy', 'cognac', 'bourbon', 'scotch', 'champagne', 'cocktail', 'martini', 'margarita',
    'bloody mary', 'mojito', 'daiquiri', 'cosmopolitan', 'manhattan', 'old fashioned',
    'alcoholic', 'alcohol', 'ethanol', 'proof', 'distilled', 'fermented', 'brewed',
    'sake', 'mead', 'cider', 'ale', 'lager', 'stout', 'porter', 'pilsner',
    'absinthe', 'amaretto', 'baileys', 'kahlua', 'sambuca', 'schnapps',
    'aperitif', 'digestif', 'cordial', 'bitters', 'vermouth', 'sherry', 'port',
    'mixed drink', 'hard seltzer', 'wine cooler', 'sangria', 'punch, alcoholic',
    'beverage, alcoholic', 'drink, alcoholic'
  ];
  
  const containsAlcohol = alcoholKeywords.some(keyword => 
    normalizedInput.includes(keyword)
  );
  
  if (containsAlcohol) {
    console.log('Offline alcohol-related suggestion rejected:', normalizedInput);
    return []; // Don't suggest any alcohol-related foods
  }
  
  // Prioritize exact matches and foods that start with the input
  const suggestions = foodDatabase
    .filter(food => {
      const foodName = food.name.toLowerCase();
      return foodName.includes(normalizedInput);
    })
    .sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      // Exact matches first
      if (aName === normalizedInput) return -1;
      if (bName === normalizedInput) return 1;
      
      // Then foods that start with the input
      if (aName.startsWith(normalizedInput) && !bName.startsWith(normalizedInput)) return -1;
      if (bName.startsWith(normalizedInput) && !aName.startsWith(normalizedInput)) return 1;
      
      // Then by name length (shorter first for suggestions)
      return a.name.length - b.name.length;
    })
    .slice(0, 5);
    
  return suggestions;
}