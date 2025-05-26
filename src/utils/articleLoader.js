// File: src/utils/articleLoader.js
// Utility functions for loading and parsing markdown articles

import { marked } from 'marked';

// Configure marked for better security and features
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  mangle: false,
  sanitize: false
});

/**
 * Parse frontmatter from markdown content
 * @param {string} content - Raw markdown content with frontmatter
 * @returns {Object} - Parsed frontmatter and content
 */
export const parseFrontmatter = (content) => {
  console.log('Parsing frontmatter for content length:', content.length);
  console.log('First 300 characters:', content.substring(0, 300));
  
  // More flexible regex that handles different line endings and spacing
  const frontmatterRegex = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    // Try alternative patterns
    const altRegex1 = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
    const altRegex2 = /^---\s*$([\s\S]*?)^---\s*$([\s\S]*)$/m;
    
    const altMatch1 = content.match(altRegex1);
    const altMatch2 = content.match(altRegex2);
    
    if (altMatch1) {
      console.log('Found frontmatter with alternative regex 1');
      return processFrontmatterMatch(altMatch1);
    } else if (altMatch2) {
      console.log('Found frontmatter with alternative regex 2');
      return processFrontmatterMatch(altMatch2);
    }
    
    console.log('No frontmatter found with any regex pattern');
    console.log('Content starts with:', content.substring(0, 50));
    return {
      metadata: {},
      content: content
    };
  }
  
  console.log('Found frontmatter with main regex');
  return processFrontmatterMatch(match);
};

/**
 * Process a successful frontmatter regex match
 * @param {Array} match - Regex match array
 * @returns {Object} - Parsed frontmatter and content
 */
const processFrontmatterMatch = (match) => {
  const [, frontmatter, markdown] = match;
  const metadata = {};
  
  console.log('Processing frontmatter:', frontmatter.substring(0, 200));
  
  // Parse YAML-like frontmatter line by line
  const lines = frontmatter.split(/\r?\n/);
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;
    
    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = trimmedLine.substring(0, colonIndex).trim();
    const value = trimmedLine.substring(colonIndex + 1).trim();
    
    if (!key || !value) continue;
    
    // Handle different data types
    if (value.startsWith('[') && value.endsWith(']')) {
      // Array - handle both quoted and unquoted values
      const arrayContent = value.slice(1, -1).trim();
      if (arrayContent) {
        metadata[key] = arrayContent
          .split(',')
          .map(item => item.trim().replace(/^["']|["']$/g, ''))
          .filter(item => item.length > 0);
      } else {
        metadata[key] = [];
      }
    } else if (value === 'true' || value === 'false') {
      // Boolean
      metadata[key] = value === 'true';
    } else if (!isNaN(value) && value !== '' && !value.match(/^\d{4}-\d{2}-\d{2}/)) {
      // Number (but not dates)
      metadata[key] = parseFloat(value);
    } else {
      // String (remove quotes if present)
      metadata[key] = value.replace(/^["']|["']$/g, '');
    }
  }
  
  console.log('Parsed metadata keys:', Object.keys(metadata));
  console.log('Sample metadata:', { 
    title: metadata.title, 
    category: metadata.category,
    published: metadata.published 
  });
  
  return {
    metadata,
    content: markdown.trim()
  };
};

/**
 * Convert markdown to HTML using marked
 * @param {string} markdown - Markdown content
 * @returns {string} - HTML content
 */
export const markdownToHtml = (markdown) => {
  console.log('Converting markdown to HTML:', markdown.substring(0, 100) + '...');
  const html = marked(markdown);
  console.log('Generated HTML length:', html.length);
  return html;
};

/**
 * Load and parse a single article
 * @param {string} slug - Article slug/filename
 * @returns {Promise<Object>} - Parsed article object
 */
export const loadArticle = async (slug) => {
  console.log(`Attempting to load article: ${slug}`);
  
  try {
    // Use .txt extension for GitHub Pages compatibility
    const articlePath = `/articles/${slug}.txt`;
    console.log(`Fetching from: ${articlePath}`);
    
    const response = await fetch(articlePath);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const content = await response.text();
    console.log(`Successfully loaded article (${content.length} characters)`);
    
    // Log raw content for debugging
    console.log('Raw content preview:', content.substring(0, 500));
    
    const { metadata, content: markdown } = parseFrontmatter(content);
    
    // Calculate reading time (average 200 words per minute)
    const wordCount = markdown.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    
    const article = {
      slug,
      ...metadata,
      content: markdown, // Pass raw markdown, not HTML
      markdown,
      wordCount,
      readTime: metadata.readTime || `${readingTime} min read`,
      publishedDate: new Date(metadata.published || metadata.date || Date.now()),
    };
    
    console.log('Article loaded successfully:', {
      title: article.title || 'No title',
      slug: article.slug,
      hasContent: !!article.content,
      contentLength: article.content?.length || 0
    });
    
    return article;
    
  } catch (error) {
    console.error(`Error loading article ${slug}:`, error);
    
    // Check if it's a network/fetch error vs 404
    if (error.message.includes('404')) {
      console.error(`Article file not found: /articles/${slug}.txt`);
      console.error('Make sure the file exists in your public/articles/ folder and has .txt extension');
    }
    
    // Return a fallback article with error info
    return {
      slug,
      title: `Article Not Found: ${slug}`,
      excerpt: `The article "${slug}" could not be loaded. Error: ${error.message}`,
      category: 'Error',
      author: 'System',
      published: new Date().toISOString(),
      readTime: '1 min read',
      content: `## Article Not Found\n\nThe article "${slug}" could not be loaded.\n\n**Error:** ${error.message}\n\nPlease check that the file exists at \`/articles/${slug}.txt\``,
      markdown: `## Article Not Found\n\nThe article "${slug}" could not be loaded.\n\n**Error:** ${error.message}`,
      wordCount: 20,
      readTime: '1 min read',
      publishedDate: new Date(),
      error: true
    };
  }
};

/**
 * Load article index (list of all articles with metadata)
 * @returns {Promise<Array>} - Array of article metadata
 */
export const loadArticleIndex = async () => {
  console.log('Loading article index...');
  
  try {
    const response = await fetch('/articles/index.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const index = await response.json();
    console.log(`Loaded ${index.length} articles from index`);
    
    // Sort by date (newest first)
    const sorted = index.sort((a, b) => new Date(b.published) - new Date(a.published));
    return sorted;
    
  } catch (error) {
    console.error('Error loading article index:', error);
    console.warn('Falling back to sample articles for testing');
    
    // Return sample articles for testing
    return [
      {
        slug: 'ncc-outage-compensation',
        title: 'Nigeria\'s Telecoms Regulator Introduces New Outage Notification',
        excerpt: 'NCC mandates operators to notify consumers of major outages.',
        category: 'Government & Policy',
        author: 'Munira Audu',
        published: new Date().toISOString(),
        readTime: '4 min read',
        trending: true,
        views: 532,
        comments: 86
      },
      {
        slug: 'critical-ncc-response',
        title: 'Critical Response to Allegations Against NCC',
        excerpt: 'Analysis of the Nigerian Communications Commission response.',
        category: 'Government & Policy',
        author: 'Maryam Kourrah',
        published: new Date(Date.now() - 86400000).toISOString(),
        readTime: '9 min read',
        trending: true,
        views: 926,
        comments: 37
      },
      {
        slug: 'rtx-4070-ti-price-drop',
        title: 'RTX 4070 Ti Graphics Cards See Price Drop',
        excerpt: 'Gaming enthusiasts in Nigeria can now access high-end graphics cards.',
        category: 'Hardware',
        author: 'Chinelo Ikenna',
        published: new Date(Date.now() - 172800000).toISOString(),
        readTime: '3 min read',
        trending: false,
        views: 892,
        comments: 15
      }
    ];
  }
};

/**
 * Filter articles by category
 * @param {Array} articles - Array of articles
 * @param {string} category - Category to filter by
 * @returns {Array} - Filtered articles
 */
export const filterArticlesByCategory = (articles, category) => {
  if (category === 'all') return articles;
  return articles.filter(article => 
    article.category?.toLowerCase() === category.toLowerCase() ||
    article.tags?.some(tag => tag.toLowerCase() === category.toLowerCase())
  );
};

/**
 * Search articles by title, excerpt, or content
 * @param {Array} articles - Array of articles
 * @param {string} query - Search query
 * @returns {Array} - Matching articles
 */
export const searchArticles = (articles, query) => {
  const lowercaseQuery = query.toLowerCase();
  return articles.filter(article =>
    article.title?.toLowerCase().includes(lowercaseQuery) ||
    article.excerpt?.toLowerCase().includes(lowercaseQuery) ||
    article.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};