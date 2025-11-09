import { CharacterState } from '../types/game';

class OpenAIApiService {
  private baseUrl: string;

  constructor() {
    // Use Netlify Edge Functions for OpenAI API
    this.baseUrl = '/api/openai';
  }

  isConfigured(): boolean {
    // Always return true since we're using Netlify Edge Functions for OpenAI
    // The API key check happens server-side
    return true;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
    };
  }

  async generateFoodComparison(
    currentFood: string,
    currentCalories: number,
    previousFood: string | null,
    previousCalories: number | null,
    isHealthy: boolean
  ): Promise<string> {
    const requestData = {
      currentFood,
      currentCalories,
      previousFood,
      previousCalories,
      isHealthy,
      type: 'feedback'
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`OpenAI API Netlify Edge Function error: ${response.status}`);
      }

      const data = await response.json();
      return data.message || 'Great choice! Keep exploring different foods!';
    } catch (error) {
      console.error('Error calling OpenAI API via Netlify Edge Function:', error);
      throw error;
    }
  }

  async generateGameOverMessage(
    reason: string,
    totalCalories: number,
    foodsEaten: string[]
  ): Promise<string> {
    const requestData = {
      type: 'gameOver',
      reason,
      totalCalories,
      foodsEaten,
      currentFood: '',
      currentCalories: 0,
      isHealthy: false
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`OpenAI API Netlify Edge Function error: ${response.status}`);
      }

      const data = await response.json();
      return data.message || reason;
    } catch (error) {
      console.error('Error generating game over message via Netlify Edge Function:', error);
      return reason; // Fallback to default reason
    }
  }
}

export const openaiApi = new OpenAIApiService();

