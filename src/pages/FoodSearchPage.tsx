import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Database, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { usdaApi } from '../services/usdaApi';
import { USDAFoodSearchResult, USDAFoodDetails, Food } from '../types/game';
import FoodDetailModal from '../components/FoodDetailModal';

type SearchMode = 'generic' | 'branded';

interface SearchResult {
  foods: USDAFoodSearchResult[];
  totalHits: number;
  currentPage: number;
  totalPages: number;
}

export default function FoodSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('generic');
  const [suggestions, setSuggestions] = useState<USDAFoodSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastSearchQuery, setLastSearchQuery] = useState('');

  const isOnline = usdaApi.isConfigured();
  const pageSize = 20;

  // Debounced search for suggestions
  const debouncedSuggestionSearch = useCallback(
    (query: string) => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      const timeout = setTimeout(async () => {
        if (query.length >= 3 && isOnline) {
          setLoadingSuggestions(true);
          try {
            const results = await usdaApi.searchFoodsLegacy(query, 8, searchMode);
            setSuggestions(results.slice(0, 6));
            setShowSuggestions(true);
          } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
          } finally {
            setLoadingSuggestions(false);
          }
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
          setLoadingSuggestions(false);
        }
      }, 800); // Wait 800ms after user stops typing

      setSearchTimeout(timeout);
    },
    [searchMode, isOnline, searchTimeout]
  );

  useEffect(() => {
    debouncedSuggestionSearch(searchQuery);
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchQuery, debouncedSuggestionSearch]);

  const handleSearch = async (query: string = searchQuery, page: number = 1) => {
    if (!query.trim() || !isOnline) return;

    setLoadingResults(true);
    setShowSuggestions(false);
    
    try {
      // Use the new paginated search method
      const result = await usdaApi.searchFoods(query, pageSize, searchMode, page);
      
      const totalPages = Math.ceil(result.totalHits / pageSize);
      
      setSearchResults({
        foods: result.foods,
        totalHits: result.totalHits,
        currentPage: page,
        totalPages
      });
      
      setLastSearchQuery(query);
    } catch (error) {
      console.error('Error searching foods:', error);
      setSearchResults(null);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleSuggestionClick = async (food: USDAFoodSearchResult) => {
    setShowSuggestions(false);
    setSearchQuery(food.description);
    setLoadingSuggestions(false);
    
    try {
      const details = await usdaApi.getFoodDetails(food.fdcId);
      const convertedFood = usdaApi.convertUSDAToFood(details, searchMode);
      setSelectedFood(convertedFood);
    } catch (error) {
      console.error('Error fetching food details:', error);
    }
  };

  const handleResultClick = async (food: USDAFoodSearchResult) => {
    try {
      const details = await usdaApi.getFoodDetails(food.fdcId);
      const convertedFood = usdaApi.convertUSDAToFood(details, searchMode);
      setSelectedFood(convertedFood);
    } catch (error) {
      console.error('Error fetching food details:', error);
    }
  };

  const handlePageChange = (page: number) => {
    if (searchResults && page >= 1 && page <= searchResults.totalPages) {
      handleSearch(lastSearchQuery, page);
    }
  };

  if (!isOnline) {
    return (
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🔌</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Food Search Unavailable</h1>
            <p className="text-lg text-gray-600 mb-4">
              The food search feature requires a USDA API key to access the food database.
            </p>
            <p className="text-gray-500">
              Please configure your USDA API key in the environment variables to use this feature.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg shadow-lg p-8 mb-8 text-white">
          <div className="text-center">
            <div className="text-6xl mb-4">🔍🍎</div>
            <h1 className="text-4xl font-bold mb-4">Food Database Explorer</h1>
            <p className="text-xl mb-6">
              Discover detailed nutrition information for thousands of foods using the official USDA database!
            </p>
          </div>
        </div>

        {/* Search Interface */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* Search Mode Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => setSearchMode('generic')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  searchMode === 'generic'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Generic Foods</span>
              </button>
              <button
                onClick={() => setSearchMode('branded')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  searchMode === 'branded'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Branded Foods</span>
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder={
                  searchMode === 'generic'
                    ? "Search for foods like 'banana', 'chicken breast', 'brown rice'..."
                    : "Search for branded foods like 'Cheerios', 'Coca Cola', 'Oreo'..."
                }
                className="w-full pl-12 pr-32 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              
              {/* Loading indicator for suggestions */}
              {loadingSuggestions && (
                <div className="absolute right-24 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                </div>
              )}
              
              <button
                onClick={() => handleSearch()}
                disabled={!searchQuery.trim() || loadingResults}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {loadingResults ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <span>Search</span>
                )}
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (suggestions.length > 0 || loadingSuggestions) && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg max-h-80 overflow-y-auto">
                {loadingSuggestions ? (
                  <div className="px-4 py-3 text-gray-500 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Searching foods...</span>
                    </div>
                  </div>
                ) : (
                  suggestions.map((food, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(food)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center justify-between border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div>
                        <div className="font-medium">{food.description}</div>
                        {food.brandOwner && (
                          <div className="text-sm text-gray-500">by {food.brandOwner}</div>
                        )}
                      </div>
                      <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {food.dataType}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            {searchMode === 'generic' ? (
              <p>🥗 Searching survey foods (FNDDS) - common, generic food items</p>
            ) : (
              <p>🏪 Searching branded foods - specific products with brand names</p>
            )}
          </div>
        </div>

        {/* Search Results */}
        {searchResults && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Search Results ({searchResults.totalHits.toLocaleString()} found)
              </h2>
              <div className="text-sm text-gray-600">
                Page {searchResults.currentPage} of {searchResults.totalPages}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {searchResults.foods.map((food, index) => (
                <button
                  key={index}
                  onClick={() => handleResultClick(food)}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 mb-1">{food.description}</h3>
                      {food.brandOwner && (
                        <p className="text-sm text-gray-600">Brand: {food.brandOwner}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {food.dataType}
                        </span>
                        <span className="text-xs text-gray-500">ID: {food.fdcId}</span>
                      </div>
                    </div>
                    <div className="text-blue-600 ml-4">
                      <Search className="w-5 h-5" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Enhanced Pagination */}
            {searchResults.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(searchResults.currentPage - 1)}
                  disabled={searchResults.currentPage === 1 || loadingResults}
                  className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex space-x-1">
                  {/* Show first page */}
                  {searchResults.currentPage > 3 && (
                    <>
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={loadingResults}
                        className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                      >
                        1
                      </button>
                      {searchResults.currentPage > 4 && (
                        <span className="px-3 py-2 text-gray-500">...</span>
                      )}
                    </>
                  )}

                  {/* Show pages around current page */}
                  {Array.from({ length: Math.min(5, searchResults.totalPages) }, (_, i) => {
                    let page;
                    if (searchResults.totalPages <= 5) {
                      page = i + 1;
                    } else {
                      const start = Math.max(1, Math.min(searchResults.currentPage - 2, searchResults.totalPages - 4));
                      page = start + i;
                    }
                    
                    if (page < 1 || page > searchResults.totalPages) return null;
                    if (searchResults.currentPage > 3 && page === 1) return null;
                    if (searchResults.currentPage < searchResults.totalPages - 2 && page === searchResults.totalPages) return null;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        disabled={loadingResults}
                        className={`px-3 py-2 rounded-md ${
                          page === searchResults.currentPage
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50 disabled:opacity-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  {/* Show last page */}
                  {searchResults.currentPage < searchResults.totalPages - 2 && (
                    <>
                      {searchResults.currentPage < searchResults.totalPages - 3 && (
                        <span className="px-3 py-2 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(searchResults.totalPages)}
                        disabled={loadingResults}
                        className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                      >
                        {searchResults.totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(searchResults.currentPage + 1)}
                  disabled={searchResults.currentPage === searchResults.totalPages || loadingResults}
                  className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Results info */}
            <div className="mt-4 text-center text-sm text-gray-600">
              Showing {((searchResults.currentPage - 1) * pageSize) + 1} - {Math.min(searchResults.currentPage * pageSize, searchResults.totalHits)} of {searchResults.totalHits.toLocaleString()} results
            </div>
          </div>
        )}

        {loadingResults && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="text-lg font-medium text-gray-700">Searching the USDA food database...</span>
            </div>
            <p className="text-gray-600">This may take a few seconds...</p>
          </div>
        )}
      </div>

      {/* Food Detail Modal */}
      <FoodDetailModal
        food={selectedFood!}
        isOpen={!!selectedFood}
        onClose={() => setSelectedFood(null)}
      />
    </div>
  );
}