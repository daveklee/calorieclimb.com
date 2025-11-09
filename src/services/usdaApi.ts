import { USDAFoodSearchResult, USDAFoodDetails, Food } from '../types/game';

export type SearchMode = 'generic' | 'branded' | 'full';

class USDAApiService {
  private baseUrl: string;

  constructor() {
    // Use Netlify Edge Functions instead of Supabase
    this.baseUrl = '/api/usda';
    console.log('USDA API Service initialized with Netlify Edge Functions:', {
      baseUrl: this.baseUrl
    });
  }

  isConfigured(): boolean {
    // Always return true since we're using Netlify Edge Functions
    // The API key check happens server-side
    return true;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
    };
  }

  async searchFoods(
    query: string, 
    pageSize: number = 25, 
    searchMode: SearchMode = 'generic',
    pageNumber: number = 1
  ): Promise<{ foods: USDAFoodSearchResult[]; totalHits: number }> {
    let dataType: string[];
    
    switch (searchMode) {
      case 'generic':
        dataType = ['Foundation', 'Survey (FNDDS)'];
        break;
      case 'branded':
        dataType = ['Branded'];
        break;
      case 'full':
        dataType = ['Foundation', 'SR Legacy', 'Branded'];
        break;
      default:
        dataType = ['Foundation', 'Survey (FNDDS)'];
    }

    const requestBody = {
      query,
      pageSize,
      pageNumber,
      dataType,
      sortBy: 'dataType.keyword',
      sortOrder: 'asc'
    };

    const url = `${this.baseUrl}/search`;

    console.log('USDA API Search Request via Netlify Edge Function:', {
      url,
      method: 'POST',
      body: requestBody,
      searchMode,
      pageNumber
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody)
      });

      console.log('USDA API Search Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('USDA API Netlify Edge Function Error Details:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url
        });
        throw new Error(`USDA API Netlify Edge Function error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('USDA API Search Success:', {
        totalHits: data.totalHits,
        foodsReturned: data.foods?.length || 0,
        searchMode,
        pageNumber
      });

      // Apply filtering based on search mode for generic foods
      let processedFoods = data.foods || [];
      
      // Always filter out alcohol-related content for kid safety
      processedFoods = this.filterOutAlcohol(processedFoods);
      
      if (searchMode === 'generic') {
        processedFoods = this.filterForGenericFoods(processedFoods, query);
      }

      return {
        foods: processedFoods,
        totalHits: data.totalHits || 0
      };
    } catch (error) {
      console.error('USDA API Search Error:', error);
      throw error;
    }
  }

  // Legacy method for backward compatibility with suggestions
  async searchFoodsLegacy(query: string, pageSize: number = 25, searchMode: SearchMode = 'generic'): Promise<USDAFoodSearchResult[]> {
    const result = await this.searchFoods(query, pageSize, searchMode, 1);
    return result.foods;
  }

  private filterOutAlcohol(foods: USDAFoodSearchResult[]): USDAFoodSearchResult[] {
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

    return foods.filter(food => {
      const description = food.description.toLowerCase();
      
      // Check if any alcohol keywords are present
      const containsAlcohol = alcoholKeywords.some(keyword => 
        description.includes(keyword)
      );
      
      // Additional check for brand owners that are alcohol companies
      const alcoholBrands = [
        'anheuser-busch', 'budweiser', 'coors', 'miller', 'heineken', 'corona',
        'absolut', 'smirnoff', 'bacardi', 'captain morgan', 'jose cuervo',
        'jack daniels', 'jim beam', 'johnnie walker', 'grey goose'
      ];
      
      const isAlcoholBrand = food.brandOwner && 
        alcoholBrands.some(brand => 
          food.brandOwner!.toLowerCase().includes(brand)
        );
      
      // Exclude if contains alcohol keywords or is from alcohol brand
      return !containsAlcohol && !isAlcoholBrand;
    });
  }

  private filterForGenericFoods(foods: USDAFoodSearchResult[], query: string): USDAFoodSearchResult[] {
    const normalizedQuery = query.toLowerCase().trim();
    
    return foods
      .filter(food => {
        const description = food.description.toLowerCase();
        
        // Skip branded items (those with brand owners for most cases)
        if (food.brandOwner && !this.isAcceptableBrandedFood(description)) {
          return false;
        }
        
        // Skip very specific or technical descriptions
        if (this.isTooSpecific(description)) {
          return false;
        }
        
        // Prioritize Foundation and Survey data types
        if (!['Foundation', 'Survey (FNDDS)'].includes(food.dataType)) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        const aDesc = a.description.toLowerCase();
        const bDesc = b.description.toLowerCase();
        
        // Exact matches first
        if (aDesc.includes(normalizedQuery) && !bDesc.includes(normalizedQuery)) return -1;
        if (bDesc.includes(normalizedQuery) && !aDesc.includes(normalizedQuery)) return 1;
        
        // Prefer Foundation over Survey
        if (a.dataType === 'Foundation' && b.dataType !== 'Foundation') return -1;
        if (b.dataType === 'Foundation' && a.dataType !== 'Foundation') return 1;
        
        // Prefer shorter, simpler descriptions
        return a.description.length - b.description.length;
      });
  }

  private isAcceptableBrandedFood(description: string): boolean {
    // Allow some common branded foods that are still generic enough
    const acceptableBrands = [
      'usda commodity',
      'school lunch',
      'generic',
      'store brand'
    ];
    
    return acceptableBrands.some(brand => description.includes(brand));
  }

  private isTooSpecific(description: string): boolean {
    const tooSpecificIndicators = [
      'upc:',
      'gtin:',
      'prepared from recipe',
      'restaurant',
      'fast food',
      'frozen meal',
      'baby food',
      'dietary supplement',
      'formula',
      'medical food',
      'enteral',
      'parenteral'
    ];
    
    return tooSpecificIndicators.some(indicator => description.includes(indicator));
  }

  async getFoodDetails(fdcId: number): Promise<USDAFoodDetails> {
    const url = `${this.baseUrl}/food/${fdcId}`;

    console.log('USDA API Details Request via Netlify Edge Function:', {
      url,
      fdcId
    });

    try {
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      console.log('USDA API Details Response:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('USDA API Details Netlify Edge Function Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          fdcId
        });
        throw new Error(`USDA API Netlify Edge Function error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('USDA API Details Success:', {
        fdcId: data.fdcId,
        description: data.description,
        dataType: data.dataType,
        hasAdditionalDescriptions: !!data.additionalDescriptions
      });

      return data;
    } catch (error) {
      console.error('USDA API Details Error:', error);
      throw error;
    }
  }

  convertUSDAToFood(usdaFood: USDAFoodDetails, searchMode: SearchMode = 'generic'): Food {
    // Find calories from nutrients
    const calorieNutrient = usdaFood.foodNutrients.find(
      nutrient => nutrient.nutrient.name.toLowerCase().includes('energy') ||
                  nutrient.nutrient.name.toLowerCase().includes('calorie')
    );

    const calories = calorieNutrient ? Math.round(calorieNutrient.amount) : 0;

    // Extract key nutrients
    const nutrients = usdaFood.foodNutrients
      .filter(fn => ['Protein', 'Total lipid (fat)', 'Carbohydrate, by difference', 'Fiber, total dietary', 'Sugars, total including NLEA', 'Sodium, Na'].includes(fn.nutrient.name))
      .map(fn => ({
        name: fn.nutrient.name,
        amount: fn.amount,
        unit: fn.nutrient.unitName
      }));

    // Simple health rating based on food type and nutrients
    const healthRating = this.calculateHealthRating(usdaFood.description, nutrients);

    // Generate emoji based on food description
    const emoji = this.generateEmoji(usdaFood.description);

    // Clean up the name based on search mode
    const cleanName = searchMode === 'generic' 
      ? this.cleanFoodName(usdaFood.description)
      : usdaFood.description.toLowerCase();

    // Enhanced description for Survey (FNDDS) foods
    let description: string;
    if (searchMode === 'generic' && usdaFood.dataType === 'Survey (FNDDS)') {
      // For FNDDS foods, include both the cleaned name and the full description
      description = `${cleanName} - ${calories} calories per 100g. FNDDS Description: ${usdaFood.description}`;
    } else if (searchMode === 'generic') {
      description = `${cleanName} - ${calories} calories per 100g`;
    } else {
      description = `From USDA database: ${usdaFood.description}`;
    }

    return {
      name: cleanName,
      calories,
      emoji,
      healthRating,
      description,
      fdcId: usdaFood.fdcId,
      brandOwner: usdaFood.brandOwner,
      ingredients: usdaFood.ingredients,
      servingSize: usdaFood.servingSize,
      servingSizeUnit: usdaFood.servingSizeUnit,
      nutrients,
      isFromUSDA: true,
      dataType: usdaFood.dataType, // Add data type to help with display logic
      additionalDescriptions: usdaFood.additionalDescriptions // Add FNDDS additional descriptions
    };
  }

  private cleanFoodName(description: string): string {
    // Remove common USDA-specific terms and make more generic
    let cleaned = description.toLowerCase()
      .replace(/,.*$/, '') // Remove everything after first comma
      .replace(/\(.*?\)/g, '') // Remove parentheses content
      .replace(/\braw\b/g, '') // Remove "raw"
      .replace(/\bfresh\b/g, '') // Remove "fresh"
      .replace(/\bunprepared\b/g, '') // Remove "unprepared"
      .replace(/\bcommercial\b/g, '') // Remove "commercial"
      .replace(/\busda commodity\b/g, '') // Remove "usda commodity"
      .trim();

    // Capitalize first letter of each word
    return cleaned.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private calculateHealthRating(description: string, nutrients: any[]): number {
    const desc = description.toLowerCase();
    
    // Very healthy foods
    if (desc.includes('raw') && (desc.includes('vegetable') || desc.includes('fruit'))) return 9;
    if (desc.includes('spinach') || desc.includes('kale') || desc.includes('broccoli')) return 10;
    if (desc.includes('salmon') || desc.includes('tuna')) return 8;
    
    // Healthy foods
    if (desc.includes('fruit') || desc.includes('vegetable')) return 8;
    if (desc.includes('whole grain') || desc.includes('oats')) return 7;
    if (desc.includes('chicken breast') || desc.includes('lean')) return 7;
    
    // Moderate foods
    if (desc.includes('bread') || desc.includes('pasta') || desc.includes('rice')) return 5;
    if (desc.includes('cheese') || desc.includes('milk')) return 6;
    
    // Less healthy foods
    if (desc.includes('fried') || desc.includes('pizza') || desc.includes('burger')) return 3;
    if (desc.includes('candy') || desc.includes('cookie') || desc.includes('cake')) return 2;
    if (desc.includes('soda') || desc.includes('energy drink')) return 1;
    
    return 5; // Default moderate rating
  }

  private generateEmoji(description: string): string {
    const desc = description.toLowerCase();
    
    // Fruits
    if (desc.includes('apple')) return '🍎';
    if (desc.includes('banana')) return '🍌';
    if (desc.includes('orange')) return '🍊';
    if (desc.includes('grape')) return '🍇';
    if (desc.includes('strawberr')) return '🍓';
    if (desc.includes('peach')) return '🍑';
    if (desc.includes('pineapple')) return '🍍';
    if (desc.includes('watermelon')) return '🍉';
    if (desc.includes('cherry')) return '🍒';
    if (desc.includes('lemon')) return '🍋';
    
    // Vegetables
    if (desc.includes('carrot')) return '🥕';
    if (desc.includes('broccoli')) return '🥦';
    if (desc.includes('tomato')) return '🍅';
    if (desc.includes('corn')) return '🌽';
    if (desc.includes('pepper')) return '🌶️';
    if (desc.includes('lettuce') || desc.includes('salad')) return '🥬';
    if (desc.includes('potato')) return '🥔';
    if (desc.includes('onion')) return '🧅';
    if (desc.includes('cucumber')) return '🥒';
    if (desc.includes('spinach') || desc.includes('kale')) return '🥬';
    
    // Proteins
    if (desc.includes('chicken')) return '🍗';
    if (desc.includes('beef') || desc.includes('steak')) return '🥩';
    if (desc.includes('fish') || desc.includes('salmon') || desc.includes('tuna')) return '🐟';
    if (desc.includes('egg')) return '🥚';
    if (desc.includes('shrimp')) return '🍤';
    
    // Dairy
    if (desc.includes('milk')) return '🥛';
    if (desc.includes('cheese')) return '🧀';
    if (desc.includes('yogurt')) return '🥛';
    if (desc.includes('butter')) return '🧈';
    
    // Grains
    if (desc.includes('bread')) return '🍞';
    if (desc.includes('rice')) return '🍚';
    if (desc.includes('pasta')) return '🍝';
    if (desc.includes('cereal')) return '🥣';
    if (desc.includes('oats') || desc.includes('oatmeal')) return '🥣';
    
    // Sweets
    if (desc.includes('cookie')) return '🍪';
    if (desc.includes('cake')) return '🍰';
    if (desc.includes('ice cream')) return '🍦';
    if (desc.includes('chocolate')) return '🍫';
    if (desc.includes('candy')) return '🍬';
    if (desc.includes('donut')) return '🍩';
    
    // Junk food
    if (desc.includes('pizza')) return '🍕';
    if (desc.includes('burger')) return '🍔';
    if (desc.includes('fries')) return '🍟';
    
    // Beverages
    if (desc.includes('water')) return '💧';
    if (desc.includes('juice')) return '🧃';
    if (desc.includes('soda') || desc.includes('cola')) return '🥤';
    if (desc.includes('coffee')) return '☕';
    if (desc.includes('tea')) return '🍵';
    
    // Nuts
    if (desc.includes('almond')) return '🥜';
    if (desc.includes('peanut')) return '🥜';
    if (desc.includes('walnut')) return '🥜';
    
    return '🍽️'; // Default food emoji
  }
}

export const usdaApi = new USDAApiService();