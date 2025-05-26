// File: src/components/ArticleList.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, Clock, Eye, MessageCircle, TrendingUp, AlertCircle, RefreshCw, Search, Filter } from 'lucide-react';
import { loadArticleIndex, filterArticlesByCategory, loadArticle } from '../utils/articleLoader';

const ArticleList = ({ activeCategory = 'all', searchQuery = '', onArticleSelect }) => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [articleContentCache, setArticleContentCache] = useState(new Map());
  const [preloadingArticles, setPreloadingArticles] = useState(new Set());

  // Memoized filter function for better performance
  const filterArticles = useCallback((articleList, category, query) => {
    let filtered = filterArticlesByCategory(articleList, category);
    
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      filtered = filtered.filter(article => {
        const searchableFields = [
          article.title || '',
          article.excerpt || '',
          article.author || '',
          article.category || '',
          ...(article.tags || [])
        ];
        
        return searchableFields.some(field => 
          field.toLowerCase().includes(searchTerm)
        );
      });
    }
    
    // Sort by date (newest first) and then by trending status
    return filtered.sort((a, b) => {
      // Trending articles first
      if (a.trending && !b.trending) return -1;
      if (!a.trending && b.trending) return 1;
      
      // Then by date
      const dateA = new Date(a.published || 0);
      const dateB = new Date(b.published || 0);
      return dateB - dateA;
    });
  }, []);

  // Fetch articles with retry logic
  const fetchArticles = useCallback(async (isRetry = false) => {
    try {
      setLoading(true);
      if (!isRetry) {
        setError(null);
        setRetryCount(0);
      }

      const articleData = await loadArticleIndex();
      
      // Validate the loaded data
      if (!Array.isArray(articleData)) {
        throw new Error('Invalid article data format');
      }

      // Validate individual articles
      const validatedArticles = articleData.filter(article => {
        const isValid = article && 
                       typeof article === 'object' && 
                       article.title && 
                       (article.slug || article.id);
        
        if (!isValid) {
          console.warn('Invalid article found:', article);
        }
        
        return isValid;
      });

      if (validatedArticles.length === 0) {
        throw new Error('No valid articles found');
      }

      setArticles(validatedArticles);
      setError(null);
      
      // Start preloading popular articles in the background
      setTimeout(() => preloadPopularArticles(validatedArticles), 1000);
      
    } catch (err) {
      console.error('Error fetching articles:', err);
      const errorMessage = err.message || 'Failed to load articles';
      setError(errorMessage);
      
      // Implement exponential backoff for retries
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchArticles(true);
        }, delay);
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  // Preload popular articles content for faster loading
  const preloadPopularArticles = useCallback(async (articleList) => {
    const popularArticles = articleList
      .filter(article => article.trending || (article.views && parseInt(article.views) > 1000))
      .slice(0, 3); // Preload top 3 popular articles

    for (const article of popularArticles) {
      try {
        if (!articleContentCache.has(article.slug) && !preloadingArticles.has(article.slug)) {
          setPreloadingArticles(prev => new Set(prev).add(article.slug));
          
          const fullArticle = await loadArticle(article.slug);
          
          setArticleContentCache(prev => {
            const newCache = new Map(prev);
            newCache.set(article.slug, {
              ...fullArticle,
              cachedAt: Date.now()
            });
            return newCache;
          });
          
          setPreloadingArticles(prev => {
            const newSet = new Set(prev);
            newSet.delete(article.slug);
            return newSet;
          });
        }
      } catch (error) {
        console.warn(`Failed to preload article ${article.slug}:`, error);
        setPreloadingArticles(prev => {
          const newSet = new Set(prev);
          newSet.delete(article.slug);
          return newSet;
        });
      }
    }
  }, [articleContentCache, preloadingArticles]);

// Enhanced article selection with content loading
const handleArticleSelect = useCallback(async (articleSlug) => {
  if (!onArticleSelect) return;

  try {
    let fullArticle;
    
    // Check cache first
    const cachedArticle = articleContentCache.get(articleSlug);
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes
    
    if (cachedArticle && (Date.now() - cachedArticle.cachedAt) < cacheExpiry) {
      fullArticle = cachedArticle;
    } else {
      // Load fresh content
      fullArticle = await loadArticle(articleSlug);
      
      // Update cache
      setArticleContentCache(prev => {
        const newCache = new Map(prev);
        newCache.set(articleSlug, {
          ...fullArticle,
          cachedAt: Date.now()
        });
        // Keep cache size manageable (max 20 articles)
        if (newCache.size > 20) {
          const oldestKey = newCache.keys().next().value;
          newCache.delete(oldestKey);
        }
        return newCache;
      });
    }

    // Validate the loaded article has content
    const hasContent = fullArticle && (
      fullArticle.content || 
      fullArticle.markdown || 
      fullArticle.body || 
      fullArticle.text
    );

    if (!hasContent) {
      console.warn('Article loaded but has no content:', articleSlug);
      // Still pass it along - ArticleDetail will handle the fallback
    }

    // FIXED: Pass the articleSlug (string) instead of fullArticle (object)
    onArticleSelect(articleSlug);
    
  } catch (error) {
    console.error('Failed to load article:', error);
    // Pass the article slug and let the parent handle the error
    onArticleSelect(articleSlug);
  }
}, [onArticleSelect, articles, articleContentCache]);

  // Memoized filtered articles for performance
  const memoizedFilteredArticles = useMemo(() => {
    return filterArticles(articles, activeCategory, searchQuery);
  }, [articles, activeCategory, searchQuery, filterArticles]);

  // Initial load
  useEffect(() => {
    fetchArticles();
  }, []);

  // Update filtered articles when dependencies change
  useEffect(() => {
    setFilteredArticles(memoizedFilteredArticles);
  }, [memoizedFilteredArticles]);

  // Loading state
  if (loading && articles.length === 0) {
    return <ArticleListSkeleton />;
  }

  // Error state
  if (error && articles.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-900 mb-2">Failed to Load Articles</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <div className="flex justify-center space-x-4">
          <button 
            onClick={() => fetchArticles()} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </>
            )}
          </button>
        </div>
        {retryCount > 0 && (
          <p className="text-red-500 text-sm mt-2">
            Retry attempt: {retryCount}/3
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Loading indicator for background operations */}
      {(loading || preloadingArticles.size > 0) && articles.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center text-sm text-blue-800">
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          {loading ? 'Updating articles...' : `Preloading ${preloadingArticles.size} popular articles...`}
        </div>
      )}

      {filteredArticles.length === 0 ? (
        <EmptyState 
          searchQuery={searchQuery} 
          activeCategory={activeCategory}
          onClearFilters={() => {
            // This would typically be handled by parent component
            // onClearSearch && onClearSearch();
            // onClearCategory && onClearCategory();
          }}
        />
      ) : (
        <div className="grid gap-6">
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.slug || article.id}
              article={article}
              onSelect={handleArticleSelect}
              isPreloading={preloadingArticles.has(article.slug)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Loading skeleton component
const ArticleListSkeleton = () => (
  <div className="space-y-6">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded-lg mb-2 w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded-lg mb-3 w-full"></div>
            <div className="h-4 bg-gray-200 rounded-lg mb-3 w-2/3"></div>
          </div>
          <div className="w-24 h-16 bg-gray-200 rounded-lg ml-4"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-gray-200 rounded w-12"></div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Empty state component
const EmptyState = ({ searchQuery, activeCategory, onClearFilters }) => {
  const hasFilters = searchQuery || activeCategory !== 'all';
  
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
      {hasFilters ? (
        <>
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Articles Found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchQuery 
              ? `No articles match your search for "${searchQuery}"`
              : `No articles found in the "${activeCategory}" category`
            }
          </p>
          <button 
            onClick={onClearFilters}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </button>
        </>
      ) : (
        <>
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Articles Available</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            There are currently no articles to display. Check back later for new content.
          </p>
        </>
      )}
    </div>
  );
};

// Individual article card component
const ArticleCard = ({ article, onSelect, isPreloading }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatReadTime = (readTime) => {
    if (!readTime) return null;
    return typeof readTime === 'number' ? `${readTime} min read` : readTime;
  };

  const handleClick = () => {
    onSelect(article.slug || article.id);
  };

  return (
    <article 
      className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer hover:shadow-lg group"
      onClick={handleClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
            {/* Article category and trending indicator */}
            <div className="flex items-center mb-2">
              {article.category && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {article.category}
                </span>
              )}
              {article.trending && (
                <div className="flex items-center ml-2 text-orange-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-xs font-medium">Trending</span>
                </div>
              )}
              {isPreloading && (
                <div className="flex items-center ml-2 text-green-600">
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  <span className="text-xs">Preloading</span>
                </div>
              )}
            </div>

            {/* Article title */}
            <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
              {article.title}
            </h2>

            {/* Article excerpt */}
            {article.excerpt && (
              <p className="text-gray-600 mb-3 line-clamp-2">
                {article.excerpt}
              </p>
            )}

            {/* Author info */}
            {article.author && (
              <p className="text-sm text-gray-500 mb-3">
                By {article.author}
              </p>
            )}
          </div>

          {/* Article thumbnail */}
          {article.thumbnail && (
            <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                src={article.thumbnail} 
                alt={article.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Article metadata */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            {/* Publication date */}
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{formatDate(article.published)}</span>
            </div>

            {/* Read time */}
            {article.readTime && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{formatReadTime(article.readTime)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* View count */}
            {article.views && (
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                <span>{article.views}</span>
              </div>
            )}

            {/* Comment count */}
            {article.comments && (
              <div className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-1" />
                <span>{article.comments}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {article.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="inline-block text-gray-500 text-xs px-2 py-1">
                +{article.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default ArticleList;