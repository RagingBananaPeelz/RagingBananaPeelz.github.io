// utils/metaTags.js
export const updateMetaTags = (article) => {
  if (!article) return;

  // Update page title
  document.title = `${article.title} | CyberHost Nigeria`;

  // Remove existing meta tags
  const removeMetaTag = (property) => {
    const existing = document.querySelector(`meta[property="${property}"]`) || 
                    document.querySelector(`meta[name="${property}"]`);
    if (existing) existing.remove();
  };

  // Create meta tag
  const createMetaTag = (property, content, isName = false) => {
    if (!content) return;
    
    const meta = document.createElement('meta');
    meta.setAttribute(isName ? 'name' : 'property', property);
    meta.setAttribute('content', content);
    document.head.appendChild(meta);
  };

  // Remove existing tags
  removeMetaTag('og:title');
  removeMetaTag('og:description');
  removeMetaTag('og:image');
  removeMetaTag('og:url');
  removeMetaTag('og:type');
  removeMetaTag('twitter:card');
  removeMetaTag('twitter:title');
  removeMetaTag('twitter:description');
  removeMetaTag('twitter:image');
  removeMetaTag('description');

  // Get current URL
  const currentUrl = window.location.href;
  
  // Extract image from article content (assuming it's in markdown format)
  const imageMatch = article.content?.match(/!\[.*?\]\((.*?)\)/);
  const imageUrl = imageMatch ? 
    (imageMatch[1].startsWith('http') ? imageMatch[1] : `https://cyberhostnigeria.com.ng${imageMatch[1]}`) 
    : 'https://cyberhostnigeria.com.ng/default-og-image.jpg'; // fallback image

  // Extract description (first paragraph or excerpt)
  const description = article.excerpt || 
    article.content?.replace(/[#*\[\]()]/g, '').split('\n')[0].substring(0, 160) + '...' ||
    'Latest technology news and analysis from Nigeria';

  // Add Open Graph tags
  createMetaTag('og:title', article.title);
  createMetaTag('og:description', description);
  createMetaTag('og:image', imageUrl);
  createMetaTag('og:url', currentUrl);
  createMetaTag('og:type', 'article');
  createMetaTag('og:site_name', 'CyberHost Nigeria');

  // Add Twitter tags
  createMetaTag('twitter:card', 'summary_large_image');
  createMetaTag('twitter:title', article.title);
  createMetaTag('twitter:description', description);
  createMetaTag('twitter:image', imageUrl);

  // Add standard meta description
  createMetaTag('description', description, true);
};