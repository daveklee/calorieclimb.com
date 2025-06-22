// Environment configuration utility
// Handles Netlify environment variables with fallback to local .env

interface EnvConfig {
  USDA_API_KEY: string | null;
  PERPLEXITY_API_KEY: string | null;
  GA_MEASUREMENT_ID: string | null;
}

class EnvironmentConfig {
  private config: EnvConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): EnvConfig {
    // In production (Netlify), environment variables are available directly on import.meta.env
    // In development, they come from .env files
    return {
      USDA_API_KEY: import.meta.env.VITE_USDA_API_KEY || null,
      PERPLEXITY_API_KEY: import.meta.env.VITE_PERPLEXITY_API_KEY || null,
      GA_MEASUREMENT_ID: import.meta.env.VITE_GA_MEASUREMENT_ID || null
    };
  }

  get(key: keyof EnvConfig): string | null {
    return this.config[key];
  }

  isConfigured(key: keyof EnvConfig): boolean {
    return !!this.config[key];
  }

  getAll(): EnvConfig {
    return { ...this.config };
  }

  // Debug method to log configuration status (without exposing actual keys)
  logConfigStatus(): void {
    console.log('Environment Configuration Status:', {
      USDA_API_KEY: this.isConfigured('USDA_API_KEY') ? 'Configured' : 'Not configured',
      PERPLEXITY_API_KEY: this.isConfigured('PERPLEXITY_API_KEY') ? 'Configured' : 'Not configured',
      GA_MEASUREMENT_ID: this.isConfigured('GA_MEASUREMENT_ID') ? 'Configured' : 'Not configured',
      environment: import.meta.env.MODE || 'unknown'
    });
  }
}

export const envConfig = new EnvironmentConfig();