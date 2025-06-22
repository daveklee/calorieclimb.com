import { CharacterState } from '../types/game';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

class PerplexityApiService {
  private baseUrl: string;

  constructor() {
    // Use Supabase Edge Function as proxy to keep API keys secure
    this.baseUrl = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1` : '';
  }

  isConfigured(): boolean {
    return !!this.baseUrl && !!SUPABASE_ANON_KEY;
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (SUPABASE_ANON_KEY) {
      headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
    }

    return headers;
  }

  async generateFoodComparison(
    currentFood: string,
    currentCalories: number,
    previousFood: string | null,
    previousCalories: number | null,
    isHealthy: boolean
  ): Promise<string> {
    if (!this.baseUrl) {
      throw new Error('Supabase URL not configured');
    }

    if (!SUPABASE_ANON_KEY) {
      throw new Error('Supabase anon key not configured');
    }

    const requestData = {
      currentFood,
      currentCalories,
      previousFood,
      previousCalories,
      isHealthy,
      type: 'feedback'
    };

    try {
      const response = await fetch(`${this.baseUrl}/perplexity-proxy`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Perplexity API proxy error: ${response.status}`);
      }

      const data = await response.json();
      return data.message || 'Great choice! Keep exploring different foods!';
    } catch (error) {
      console.error('Error calling Perplexity API proxy:', error);
      throw error;
    }
  }

  async generateGameOverMessage(
    reason: string,
    totalCalories: number,
    foodsEaten: string[]
  ): Promise<string> {
    if (!this.baseUrl) {
      return reason; // Fallback to default reason
    }

    if (!SUPABASE_ANON_KEY) {
      return reason; // Fallback to default reason
    }

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
      const response = await fetch(`${this.baseUrl}/perplexity-proxy`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Perplexity API proxy error: ${response.status}`);
      }

      const data = await response.json();
      return data.message || reason;
    } catch (error) {
      console.error('Error generating game over message:', error);
      return reason; // Fallback to default reason
    }
  }
}

export const perplexityApi = new PerplexityApiService();