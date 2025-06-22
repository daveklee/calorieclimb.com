import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { analytics } from './utils/analytics';
import { envConfig } from './utils/envConfig';

// Log environment configuration status
envConfig.logConfigStatus();

// Initialize analytics if configured
if (analytics.isEnabled()) {
  console.log('Google Analytics is enabled');
} else {
  console.log('Google Analytics is not configured');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);