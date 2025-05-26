// File: src/components/ArticleDetail.js - Mobile Optimized
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Eye, MessageCircle, Share2, User, Tag, ArrowLeft, TrendingUp, AlertCircle } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { updateMetaTags } from '../utils/metaTags';

const ArticleDetail = ({ article, onBack }) => {
  const [loading, setLoading] = useState(!article);
  const [error, setError] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [fullArticle, setFullArticle] = useState(article);

  // Update meta tags when article loads
  useEffect(() => {
    if (fullArticle) {
      updateMetaTags(fullArticle);
    }
    
    // Cleanup function to reset meta tags when component unmounts
    return () => {
      document.title = 'CyberHost Nigeria | Nigeria\'s Tech News Hub';
      
      // Reset to default meta tags
      const resetMetaTags = () => {
        const removeAndAdd = (property, content, isName = false) => {
          const existing = document.querySelector(`meta[property="${property}"]`) || 
                          document.querySelector(`meta[name="${property}"]`);
          if (existing) existing.remove();
          
          const meta = document.createElement('meta');
          meta.setAttribute(isName ? 'name' : 'property', property);
          meta.setAttribute('content', content);
          document.head.appendChild(meta);
        };
        
        removeAndAdd('og:title', 'CyberHost Nigeria | Nigeria\'s Tech News Hub');
        removeAndAdd('og:description', 'Your premier source for technology news, analysis, and insights covering Nigeria\'s digital transformation and innovation ecosystem.');
        removeAndAdd('og:image', 'https://cyberhostnigeria.com.ng/default-og-image.jpg');
        removeAndAdd('og:url', 'https://cyberhostnigeria.com.ng');
        removeAndAdd('description', 'Your premier source for technology news, analysis, and insights covering Nigeria\'s digital transformation and innovation ecosystem.', true);
      };
      
      resetMetaTags();
    };
  }, [fullArticle]);

  useEffect(() => {
    const loadFullArticle = async () => {
      if (!article) {
        setError('No article provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // If we already have full content, use it
        if (hasValidContent(article)) {
          setFullArticle(article);
          setLoading(false);
          loadRelatedArticles();
          return;
        }

        // Otherwise, try to load full content
        const loadedArticle = await loadArticleContent(article.slug || article.id);
        
        if (!hasValidContent(loadedArticle)) {
          throw new Error('Article content could not be loaded or is empty');
        }

        setFullArticle(loadedArticle);
        loadRelatedArticles();
      } catch (err) {
        console.error('Error loading full article:', err);
        setError(err.message || 'Failed to load article content');
      } finally {
        setLoading(false);
      }
    };

    loadFullArticle();
  }, [article]);

  // Check if article has valid content
  const hasValidContent = (articleData) => {
    if (!articleData) return false;
    
    const contentFields = ['content', 'markdown', 'body', 'text'];
    return contentFields.some(field => 
      articleData[field] && 
      typeof articleData[field] === 'string' && 
      articleData[field].trim().length > 100
    );
  };

  // Simulate loading full article content
  const loadArticleContent = async (articleId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (article && hasValidContent(article)) {
          resolve(article);
        } else {
          resolve({
            ...article,
            content: generateFallbackContent(article)
          });
        }
      }, 500);
    });
  };

  const loadRelatedArticles = () => {
    setTimeout(() => {
      setRelatedArticles([
        {
          id: 99,
          title: "Related: Nigeria's Digital Banking Revolution Continues",
          category: "FinTech",
          readTime: "3 min read",
          published: "1 day ago"
        },
        {
          id: 100,
          title: "Analysis: Impact of 5G on Nigerian Businesses",
          category: "Telecommunications", 
          readTime: "5 min read",
          published: "2 days ago"
        }
      ]);
    }, 1000);
  };

  // Generate contextual fallback content based on article metadata
  const generateFallbackContent = (articleData) => {
    const category = articleData.category || 'Technology';
    const title = articleData.title || 'Technology Update';
    const excerpt = articleData.excerpt || 'Latest developments in Nigerian technology sector.';

    return `
# ${title}

${excerpt}

## Overview

This article explores recent developments in Nigeria's ${category.toLowerCase()} sector, highlighting key trends and their implications for the market.

## Key Points

The technology landscape in Nigeria continues to evolve, with significant developments that are reshaping how businesses and consumers interact with digital services. Industry experts are closely monitoring these changes as they represent important shifts in the market.

### Market Impact

Recent developments in the ${category.toLowerCase()} space have created new opportunities for innovation and growth. Key stakeholders are adapting their strategies to leverage these changes effectively.

### Industry Response

Leading companies in the sector are responding with new initiatives and investments. This collaborative approach is driving further innovation and creating a more competitive marketplace.

## Looking Forward

As these trends continue to develop, they will likely have lasting impacts on Nigeria's technology ecosystem. The implications extend beyond immediate market effects to include strategic considerations for businesses and policymakers.

## Conclusion

The ongoing evolution of Nigeria's technology sector presents both opportunities and challenges. Continued monitoring and adaptation will be key to success in this dynamic environment.

*This article represents current understanding of market developments. For the most recent updates and detailed analysis, please check our latest coverage.*
    `;
  };

  // Clean content resolution
  const getArticleContent = () => {
    if (!fullArticle) return '';

    const contentFields = ['content', 'markdown', 'body', 'text'];
    
    for (const field of contentFields) {
      const content = fullArticle[field];
      if (content && typeof content === 'string' && content.trim().length > 0) {
        return content.trim();
      }
    }

    return generateFallbackContent(fullArticle);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="animate-pulse">
          <div className="bg-gray-200 rounded h-4 w-32 mb-4 sm:mb-6"></div>
          <div className="mb-4 sm:mb-6">
            <div className="flex space-x-3 mb-3 sm:mb-4">
              <div className="bg-gray-200 rounded-full h-5 sm:h-6 w-16 sm:w-20"></div>
              <div className="bg-gray-200 rounded-full h-5 sm:h-6 w-12 sm:w-16"></div>
            </div>
            <div className="bg-gray-200 rounded h-6 sm:h-8 w-3/4 mb-3 sm:mb-4"></div>
            <div className="bg-gray-200 rounded h-3 sm:h-4 w-full mb-2"></div>
            <div className="bg-gray-200 rounded h-3 sm:h-4 w-2/3 mb-4 sm:mb-6"></div>
          </div>
          <div className="bg-gray-200 rounded-lg h-48 sm:h-64 w-full mb-6 sm:mb-8"></div>
          <div className="space-y-3 sm:space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded h-3 sm:h-4 w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-8 text-center">
          <AlertCircle className="w-8 sm:w-12 h-8 sm:h-12 text-red-500 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-base sm:text-lg font-medium text-red-900 mb-2">Error Loading Article</h2>
          <p className="text-sm sm:text-base text-red-600 mb-4">{error}</p>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 justify-center">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white px-4 py-2 text-sm sm:text-base rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            {onBack && (
              <button 
                onClick={onBack}
                className="bg-gray-600 text-white px-4 py-2 text-sm sm:text-base rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!fullArticle) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

const handleShare = async () => {
  // Generate clean URL for social sharing (with embeds)
  const cleanUrl = `https://cyberhostnigeria.com.ng/${fullArticle.slug}`;
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: fullArticle.title,
        text: fullArticle.excerpt,
        url: cleanUrl, // <-- Now uses clean URL
      });
    } catch (err) {
      console.log('Error sharing:', err);
    }
  } else {
    try {
      await navigator.clipboard.writeText(cleanUrl); // <-- Clean URL for copy too
      alert('Article URL copied to clipboard!');
    } catch (err) {
      console.log('Error copying to clipboard:', err);
    }
  }
};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Back button */}
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 sm:mb-6 transition-colors group text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Articles
          </button>
        )}

        {/* Article header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
              fullArticle.category === 'Hardware' ? 'bg-purple-100 text-purple-700' :
              fullArticle.category === 'Telecommunications' ? 'bg-blue-100 text-blue-700' :
              fullArticle.category === 'FinTech' ? 'bg-green-100 text-green-700' :
              fullArticle.category === 'Government & Policy' ? 'bg-orange-100 text-orange-700' :
              fullArticle.category === 'Consumer Tech' ? 'bg-indigo-100 text-indigo-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {fullArticle.category}
            </span>
            
            {fullArticle.trending && (
              <span className="bg-red-100 text-red-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Trending
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
            {fullArticle.title}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-4 sm:mb-6 leading-relaxed">
            {fullArticle.excerpt}
          </p>

          {/* Article meta */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
            <div className="flex items-center">
              <User className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              <span>by <strong>{fullArticle.author || 'CyberHost Nigeria Editorial'}</strong></span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              <span>{formatDate(fullArticle.published) || fullArticle.published}</span>
            </div>
            
            <div className="flex items-center">
              <Clock className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              <span>{fullArticle.readTime}</span>
            </div>
            
            <div className="hidden sm:flex items-center">
              <Eye className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              <span>{fullArticle.views || '0'} views</span>
            </div>
            
            <div className="hidden sm:flex items-center">
              <MessageCircle className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              <span>{fullArticle.comments || '0'} comments</span>
            </div>
            
            <button 
              onClick={handleShare}
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Share2 className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              Share
            </button>
          </div>

          {/* Tags */}
          {fullArticle.tags && fullArticle.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
              {fullArticle.tags.map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center">
                  <Tag className="w-2 sm:w-3 h-2 sm:h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Featured image */}
        {fullArticle.image && (
          <div className="mb-6 sm:mb-8">
            <img 
              src={fullArticle.image} 
              alt={fullArticle.imageAlt || fullArticle.title}
              className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-lg shadow-lg"
            />
            {fullArticle.imageCaption && (
              <p className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3 text-center italic">
                {fullArticle.imageCaption}
              </p>
            )}
          </div>
        )}

        {/* Article content */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
          <MarkdownRenderer 
            content={getArticleContent()}
            standalone={true}
            className="text-gray-800 leading-relaxed"
          />
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Related Articles</h3>
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              {relatedArticles.map((related) => (
                <div key={related.id} className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {related.category}
                    </span>
                    <span className="text-xs text-gray-500">{related.published}</span>
                  </div>
                  <h4 className="font-medium text-gray-900 hover:text-blue-600 transition-colors mb-1 text-sm sm:text-base">
                    {related.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">{related.readTime}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Article footer */}
        <footer className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-blue-600 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h4 className="font-medium text-gray-900 text-sm sm:text-base">{fullArticle.author || 'CyberHost Nigeria Editorial'}</h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  {fullArticle.authorBio || 'Expert technology journalist covering Nigeria\'s digital transformation and innovation ecosystem.'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <button 
                onClick={handleShare}
                className="bg-blue-600 text-white px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Share2 className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                Share Article
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ArticleDetail;