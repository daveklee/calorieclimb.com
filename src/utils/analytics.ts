// Google Analytics utility functions
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

class AnalyticsService {
  private isInitialized = false;
  private gaId: string | null = null;

  constructor() {
    // Get Google Analytics ID from environment variables
    this.gaId = import.meta.env.VITE_GA_MEASUREMENT_ID || null;
    
    if (this.gaId) {
      this.initializeGA();
    }
  }

  private initializeGA() {
    if (this.isInitialized || !this.gaId) return;

    // Create script tag for Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaId}`;
    document.head.appendChild(script);

    // Initialize dataLayer and gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', this.gaId, {
      page_title: 'Calorie Climb - Kids Nutrition Learning Game',
      page_location: window.location.href
    });

    this.isInitialized = true;
    console.log('Google Analytics initialized with ID:', this.gaId);
  }

  // Track custom events
  trackEvent(eventName: string, parameters?: Record<string, any>) {
    if (!this.isInitialized || !window.gtag) return;

    window.gtag('event', eventName, {
      custom_parameter: true,
      ...parameters
    });
  }

  // Track game events
  trackGameStart() {
    this.trackEvent('game_start', {
      event_category: 'game',
      event_label: 'new_game'
    });
  }

  trackGameEnd(isWin: boolean, score: number, totalCalories: number) {
    this.trackEvent('game_end', {
      event_category: 'game',
      event_label: isWin ? 'win' : 'lose',
      value: score,
      custom_parameter_calories: totalCalories
    });
  }

  trackFoodSelection(foodName: string, calories: number, isFromUSDA: boolean) {
    this.trackEvent('food_selected', {
      event_category: 'gameplay',
      event_label: foodName,
      value: calories,
      custom_parameter_usda: isFromUSDA
    });
  }

  trackSearchModeChange(mode: string) {
    this.trackEvent('search_mode_change', {
      event_category: 'settings',
      event_label: mode
    });
  }

  trackCalorieLimitChange(newLimit: number) {
    this.trackEvent('calorie_limit_change', {
      event_category: 'settings',
      value: newLimit
    });
  }

  isEnabled(): boolean {
    return this.isInitialized && !!this.gaId;
  }
}

// Create singleton instance
export const analytics = new AnalyticsService();