// File: src/App.js
import React, { useState, useEffect } from 'react';
import { Search, Menu, X, Zap, Globe, TrendingUp, Filter } from 'lucide-react';
import ArticleList from './components/ArticleList';
import ArticleDetail from './components/ArticleDetail';
import { loadArticle } from './utils/articleLoader';

const App = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'detail'
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Stories', icon: Globe },
    { id: 'Hardware', name: 'Hardware', icon: Zap },
    { id: 'Telecommunications', name: 'Telecommunications', icon: Globe },
    { id: 'FinTech', name: 'FinTech', icon: TrendingUp },
    { id: 'Government & Policy', name: 'Government & Policy', icon: Filter },
    { id: 'Consumer Tech', name: 'Consumer Tech', icon: Zap }
  ];

  // Handle article selection
  const handleArticleSelect = async (articleSlug) => {
    try {
      setLoading(true);
      const article = await loadArticle(articleSlug);
      
      if (!article) {
        console.error('Article not found:', articleSlug);
        // You could show an error toast here
        setLoading(false);
        return;
      }
      
      setSelectedArticle(article);
      setCurrentView('detail');
      
      // Update URL without page reload
      window.location.hash = `#/article/${articleSlug}`;
    } catch (error) {
      console.error('Error loading article:', error);
      // You could show an error toast here
    } finally {
      setLoading(false);
    }
  };

  // Handle back to list
  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedArticle(null);
    window.history.pushState({ view: 'list' }, '', '/');
  };

  // Handle browser back/forward
useEffect(() => {
  const handleHashChange = () => {
    const hash = window.location.hash;
    const articleMatch = hash.match(/^#\/article\/(.+)$/);

    if (articleMatch) {
      handleArticleSelect(articleMatch[1]);
    } else {
      handleBackToList();
    }
  };

  window.addEventListener('hashchange', handleHashChange);
  return () => window.removeEventListener('hashchange', handleHashChange);
}, []);


  // Handle initial URL routing
useEffect(() => {
  const hash = window.location.hash;
  const articleMatch = hash.match(/^#\/article\/(.+)$/);

  if (articleMatch) {
    const slug = articleMatch[1];
    handleArticleSelect(slug);
  }
}, []);

  // Close mobile menu when category changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [activeCategory]);

  if (loading && currentView === 'detail') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* Brand Name - Fixed width to prevent squeezing */}
            <div 
              className="flex items-center cursor-pointer flex-shrink-0 mr-8"
              onClick={currentView === 'detail' ? handleBackToList : undefined}
            >
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">CyberHost Nigeria</h1>
                <p className="text-xs text-gray-500 hidden sm:block whitespace-nowrap">Nigeria's Tech News Hub</p>
              </div>
            </div>

            {/* Desktop Navigation - Centered with proper flex */}
            <div className="hidden lg:flex items-center space-x-4 flex-1 justify-center">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      activeCategory === category.id
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden xl:inline">{category.name}</span>
                    <span className="xl:hidden">{category.shortName || category.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Search and Mobile Menu - Fixed width to prevent squeezing */}
            <div className="flex items-center space-x-3 ml-8">
              {/* Search Bar - Better responsive behavior */}
              <div className={`relative transition-all duration-200 ${
                currentView === 'detail' ? 'hidden md:block' : 'block'
              }`}>
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 lg:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation - Improved layout */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 bg-gray-50">
              <div className="py-4 space-y-1">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setActiveCategory(category.id);
                        setIsMenuOpen(false); // Close menu after selection
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left font-medium transition-colors ${
                        activeCategory === category.id
                          ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-500'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                      }`}
                    >
                      <IconComponent className="w-5 h-5 flex-shrink-0" />
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </div>
              
              {/* Mobile Search - Only show if not visible in header */}
              {currentView === 'detail' && (
                <div className="px-4 pb-4 border-t border-gray-200">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'list' ? (
          <div>
            {/* Page Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {activeCategory === 'all' ? 'Latest Tech News' : 
                 categories.find(c => c.id === activeCategory)?.name || 'Articles'}
              </h2>
              <p className="text-gray-600">
                Stay updated with Nigeria's technology landscape and digital transformation
              </p>
              
              {/* Active filters display */}
              {(activeCategory !== 'all' || searchQuery) && (
                <div className="flex items-center space-x-4 mt-4">
                  <span className="text-sm text-gray-500">Active filters:</span>
                  {activeCategory !== 'all' && (
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center">
                      {categories.find(c => c.id === activeCategory)?.name}
                      <button
                        onClick={() => setActiveCategory('all')}
                        className="ml-2 text-blue-500 hover:text-blue-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center">
                      "{searchQuery}"
                      <button
                        onClick={() => setSearchQuery('')}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Article List */}
            <ArticleList 
              activeCategory={activeCategory}
              searchQuery={searchQuery}
              onArticleSelect={handleArticleSelect}
            />
          </div>
        ) : (
          /* Article Detail */
          <ArticleDetail 
            article={selectedArticle}
            onBack={handleBackToList}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">CyberHost Nigeria</h3>
                </div>
              </div>
              <p className="text-gray-600 mb-4 max-w-md">
                Your premier source for technology news, analysis, and insights covering Nigeria's digital transformation and innovation ecosystem.
              </p>
              <p className="text-sm text-gray-500">
                © 2024 CyberHost Nigeria. All rights reserved.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Categories</h4>
              <ul className="space-y-2">
                {categories.slice(1).map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => {
                        setActiveCategory(category.id);
                        if (currentView === 'detail') {
                          handleBackToList();
                        }
                      }}
                      className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;