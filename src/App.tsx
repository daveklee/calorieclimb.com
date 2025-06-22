import React from 'react';
import { Routes, Route } from 'react-router-dom';
import GamePage from './pages/GamePage';
import FoodSearchPage from './pages/FoodSearchPage';
import AboutPage from './pages/AboutPage';
import Navigation from './components/Navigation';
import BoltFooter from './components/BoltFooter';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<GamePage />} />
          <Route path="/search" element={<FoodSearchPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
      <BoltFooter />
    </div>
  );
}

export default App;