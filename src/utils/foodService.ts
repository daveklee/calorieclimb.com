import { Food } from '../types/game';
import { findFood as findOfflineFood, getFoodSuggestions as getOfflineSuggestions } from './foodDatabase';
import { usdaApi, SearchMode } from '../services/usdaApi';
import { openaiApi } from '../services/openaiApi';
import { analytics } from './analytics';

export class FoodService {
  private isOnlineMode: boolean;
  private usdaApiFailures: number = 0;
  private maxFailures: number = 3;
  private searchCache: Map<string, Food[]> = new Map();
  private lastSearchTime: number = 0;
  private minSearchInterval: number = 1000; // Increased to 1 second for better rate limiting
  private searchTimeouts: Map<string, number> = new Map();
  private searchMode: SearchMode = 'generic';
  
  // Client-side caching for better efficiency
  private foodDetailsCache: Map<number, Food> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  constructor() {
    this.isOnlineMode = usdaApi.isConfigured();
  }

  getMode(): 'online' | 'offline' {
    return this.isOnlineMode && this.usdaApiFailures < this.maxFailures ? 'online' : 'offline';
  }

  getSearchMode(): SearchMode {
    return this.searchMode;
  }

  setSearchMode(mode: SearchMode): void {
    this.searchMode = mode;
    // Clear cache when search mode changes
    this.searchCache.clear();
    this.cacheExpiry.clear();
    
    // Track search mode change
    analytics.trackSearchModeChange(mode);
  }

  private handleUSDAError(error: any): void {
    console.warn('USDA API error, falling back to offline mode:', error.message);
    this.usdaApiFailures++;
    
    if (this.usdaApiFailures >= this.maxFailures) {
      console.warn('USDA API has failed multiple times, switching to offline mode');
      this.isOnlineMode = false;
    }
  }

  private canMakeUSDARequest(): boolean {
    const now = Date.now();
    const timeSinceLastSearch = now - this.lastSearchTime;
    return timeSinceLastSearch >= this.minSearchInterval;
  }

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  private setCacheWithExpiry(key: string, value: any): void {
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
    if (key.startsWith('search:')) {
      this.searchCache.set(key, value);
    } else if (key.startsWith('food:')) {
      const fdcId = parseInt(key.replace('food:', ''));
      this.foodDetailsCache.set(fdcId, value);
    }
  }

  private containsAlcohol(text: string): boolean {
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

    const normalizedText = text.toLowerCase();
    return alcoholKeywords.some(keyword => normalizedText.includes(keyword));
  }

  async findFood(name: string): Promise<Food | null> {
    // Check for alcohol content first
    if (this.containsAlcohol(name)) {
      console.log('Alcohol-related food rejected:', name);
      return null;
    }

    // Always try offline first for exact matches
    const offlineFood = findOfflineFood(name);
    if (offlineFood && !this.isOnlineMode) {
      analytics.trackFoodSelection(offlineFood.name, offlineFood.calories, false);
      return offlineFood;
    }

    // Check cache first for online searches
    const cacheKey = `search:${name.toLowerCase()}_${this.searchMode}`;
    if (this.isCacheValid(cacheKey)) {
      const cachedResults = this.searchCache.get(cacheKey);
      if (cachedResults && cachedResults.length > 0) {
        console.log('Using cached food result for:', name);
        const bestMatch = cachedResults[0];
        analytics.trackFoodSelection(bestMatch.name, bestMatch.calories, bestMatch.isFromUSDA || false);
        return bestMatch;
      }
    }

    // If online mode is available and hasn't failed too many times, search USDA database
    if (this.isOnlineMode && this.usdaApiFailures < this.maxFailures && this.canMakeUSDARequest()) {
      try {
        this.lastSearchTime = Date.now();
        const searchResults = await usdaApi.searchFoodsLegacy(name, 3, this.searchMode); // Reduced to 3 results
        
        if (searchResults.length > 0) {
          // Find the best match
          const bestMatch = this.findBestMatch(name, searchResults);
          if (bestMatch) {
            // Additional alcohol check on USDA results
            if (this.containsAlcohol(bestMatch.description)) {
              console.log('USDA alcohol-related food rejected:', bestMatch.description);
              return offlineFood; // Fall back to offline if available
            }

            // Check food details cache first
            const foodCacheKey = `food:${bestMatch.fdcId}`;
            if (this.isCacheValid(foodCacheKey)) {
              const cachedFood = this.foodDetailsCache.get(bestMatch.fdcId);
              if (cachedFood) {
                console.log('Using cached food details for:', bestMatch.fdcId);
                analytics.trackFoodSelection(cachedFood.name, cachedFood.calories, true);
                return cachedFood;
              }
            }

            const foodDetails = await usdaApi.getFoodDetails(bestMatch.fdcId);
            const usdaFood = usdaApi.convertUSDAToFood(foodDetails, this.searchMode);
            
            // Final alcohol check on converted food
            if (this.containsAlcohol(usdaFood.name) || this.containsAlcohol(usdaFood.description)) {
              console.log('Converted USDA alcohol-related food rejected:', usdaFood.name);
              return offlineFood; // Fall back to offline if available
            }
            
            // Only return if it has calories data
            if (usdaFood.calories > 0) {
              // Cache the result
              this.setCacheWithExpiry(foodCacheKey, usdaFood);
              
              analytics.trackFoodSelection(usdaFood.name, usdaFood.calories, true);
              return usdaFood;
            }
          }
        }
      } catch (error) {
        this.handleUSDAError(error);
        // Fall back to offline mode
      }
    }

    // Fallback to offline database
    if (offlineFood) {
      analytics.trackFoodSelection(offlineFood.name, offlineFood.calories, false);
    }
    return offlineFood;
  }

  async getFoodSuggestions(input: string): Promise<Food[]> {
    if (input.length < 2) return [];

    const normalizedInput = input.toLowerCase().trim();
    
    // Check for alcohol content first
    if (this.containsAlcohol(normalizedInput)) {
      console.log('Alcohol-related search rejected:', normalizedInput);
      return [];
    }

    const cacheKey = `search:${normalizedInput}_${this.searchMode}`;
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      const cachedResults = this.searchCache.get(cacheKey);
      if (cachedResults) {
        console.log('Using cached food suggestions for:', normalizedInput, 'mode:', this.searchMode);
        return cachedResults;
      }
    }

    // Clear any existing timeout for this input
    const existingTimeout = this.searchTimeouts.get(normalizedInput);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const suggestions: Food[] = [];

    // Get offline suggestions first (always available)
    const offlineSuggestions = getOfflineSuggestions(input);
    suggestions.push(...offlineSuggestions);

    // Only search USDA if we have enough characters and can make a request
    if (this.isOnlineMode && 
        this.usdaApiFailures < this.maxFailures && 
        input.length >= 3 && // Require at least 3 characters for USDA search
        this.canMakeUSDARequest()) {
      
      // Debounce the USDA API call with longer delay
      const searchPromise = new Promise<Food[]>((resolve) => {
        const timeout = setTimeout(async () => {
          try {
            this.lastSearchTime = Date.now();
            const searchResults = await usdaApi.searchFoodsLegacy(input, 5, this.searchMode); // Reduced to 5 results
            
            const usdaSuggestions: Food[] = [];
            
            // Process up to 3 results to reduce API calls
            for (let i = 0; i < Math.min(searchResults.length, 3); i++) {
              const result = searchResults[i];
              
              // Check for alcohol content in USDA results
              if (this.containsAlcohol(result.description)) {
                console.log('USDA suggestion alcohol-related food rejected:', result.description);
                continue;
              }
              
              // Skip if we already have a very similar suggestion
              const isDuplicate = suggestions.some(s => {
                const sName = s.name.toLowerCase();
                const resultName = result.description.toLowerCase().split(',')[0];
                return sName.includes(resultName) || resultName.includes(sName);
              });
              
              if (!isDuplicate) {
                try {
                  // Check cache for food details first
                  const foodCacheKey = `food:${result.fdcId}`;
                  let usdaFood: Food;
                  
                  if (this.isCacheValid(foodCacheKey)) {
                    const cachedFood = this.foodDetailsCache.get(result.fdcId);
                    if (cachedFood) {
                      usdaFood = cachedFood;
                    } else {
                      const foodDetails = await usdaApi.getFoodDetails(result.fdcId);
                      usdaFood = usdaApi.convertUSDAToFood(foodDetails, this.searchMode);
                      this.setCacheWithExpiry(foodCacheKey, usdaFood);
                    }
                  } else {
                    const foodDetails = await usdaApi.getFoodDetails(result.fdcId);
                    usdaFood = usdaApi.convertUSDAToFood(foodDetails, this.searchMode);
                    this.setCacheWithExpiry(foodCacheKey, usdaFood);
                  }
                  
                  // Final alcohol check on converted food
                  if (this.containsAlcohol(usdaFood.name) || this.containsAlcohol(usdaFood.description)) {
                    console.log('Converted USDA suggestion alcohol-related food rejected:', usdaFood.name);
                    continue;
                  }
                  
                  if (usdaFood.calories > 0) {
                    usdaSuggestions.push(usdaFood);
                  }
                } catch (detailError) {
                  console.warn('Error fetching food details for', result.fdcId, detailError);
                  // Continue with other results instead of failing completely
                }
              }
            }
            
            // Combine offline and online suggestions, prioritizing variety
            const combinedSuggestions = this.combineAndDeduplicateSuggestions(suggestions, usdaSuggestions);
            const finalSuggestions = combinedSuggestions.slice(0, 6); // Show up to 6 suggestions
            
            // Cache the results
            this.setCacheWithExpiry(cacheKey, finalSuggestions);
            
            resolve(finalSuggestions);
          } catch (error) {
            this.handleUSDAError(error);
            resolve(suggestions.slice(0, 6)); // Return offline suggestions only
          } finally {
            this.searchTimeouts.delete(normalizedInput);
          }
        }, 1200); // Increased debounce time to 1.2 seconds for better rate limiting
        
        this.searchTimeouts.set(normalizedInput, timeout);
      });
      
      return await searchPromise;
    }

    return suggestions.slice(0, 6); // Show up to 6 suggestions
  }

  private combineAndDeduplicateSuggestions(offlineSuggestions: Food[], usdaSuggestions: Food[]): Food[] {
    const combined: Food[] = [];
    const seenNames = new Set<string>();

    // Add offline suggestions first
    for (const food of offlineSuggestions) {
      const normalizedName = food.name.toLowerCase();
      if (!seenNames.has(normalizedName)) {
        combined.push(food);
        seenNames.add(normalizedName);
      }
    }

    // Add USDA suggestions, avoiding duplicates
    for (const food of usdaSuggestions) {
      const normalizedName = food.name.toLowerCase();
      const isDuplicate = Array.from(seenNames).some(existingName => {
        return normalizedName.includes(existingName) || existingName.includes(normalizedName);
      });

      if (!isDuplicate) {
        combined.push(food);
        seenNames.add(normalizedName);
      }
    }

    return combined;
  }

  async generateFeedbackMessage(
    currentFood: Food,
    previousFood: Food | null,
    isValidMove: boolean,
    character: any
  ): Promise<string> {
    // Handle toxic foods
    if (currentFood.isToxic) {
      return `Oh no! ${currentFood.name} is not safe to eat! The person is feeling very sick and needs help immediately. That's why we should never eat things that aren't food!`;
    }

    // Handle invalid moves
    if (!isValidMove && previousFood) {
      return `Oops! ${currentFood.name} (${currentFood.calories} calories) does not have more calories than ${previousFood.name} (${previousFood.calories} calories). Remember, we need to climb up the calorie ladder!`;
    }

    // Use OpenAI API if available and this is a USDA food, but with throttling
    if (openaiApi.isConfigured() && currentFood.isFromUSDA && Math.random() > 0.3) { // Only 70% of the time
      try {
        const aiMessage = await openaiApi.generateFoodComparison(
          currentFood.name,
          currentFood.calories,
          previousFood?.name || null,
          previousFood?.calories || null,
          currentFood.healthRating >= 7
        );
        return aiMessage;
      } catch (error) {
        console.error('Error generating AI feedback:', error);
        // Fall back to default message
      }
    }

    // Default feedback message (used more often to save API calls)
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

  private findBestMatch(query: string, results: any[]): any | null {
    const normalizedQuery = query.toLowerCase().trim();
    
    // First, look for exact matches in the cleaned name
    for (const result of results) {
      const description = result.description.toLowerCase();
      const firstPart = description.split(',')[0].trim();
      
      if (firstPart === normalizedQuery || firstPart.startsWith(normalizedQuery)) {
        return result;
      }
    }
    
    // Then look for partial matches, prioritizing Foundation data type
    const partialMatches = results.filter(result => {
      const description = result.description.toLowerCase();
      const firstPart = description.split(',')[0].trim();
      return firstPart.includes(normalizedQuery) || normalizedQuery.includes(firstPart);
    });
    
    if (partialMatches.length > 0) {
      // Sort by data type (Foundation first) then by description length
      partialMatches.sort((a, b) => {
        if (a.dataType === 'Foundation' && b.dataType !== 'Foundation') return -1;
        if (b.dataType === 'Foundation' && a.dataType !== 'Foundation') return 1;
        return a.description.length - b.description.length;
      });
      return partialMatches[0];
    }
    
    return results[0] || null; // Return first result as fallback
  }
}

// Create and export the singleton instance as default export
const foodServiceInstance = new FoodService();
export default foodServiceInstance;