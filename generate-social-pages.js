// generate-social-pages.js
const fs = require('fs');

// Your articles - update this with your actual articles
const articles = [
  {
    slug: 'critical-ncc-response',
    title: 'Critical Response to the Allegations Against the NCC',
    description: 'The recent uproar over alleged irregularities and victimization within the Nigerian Communications Commission (NCC) demands a measured and evidence-based response.',
    author: 'Maryam Kourrah',
    date: 'May 24, 2025',
    image: '/articles/images/ncc-headquarters-abuja.jpg'
  },
  {
    slug: 'ncc-outage-compensation',
    title: 'Nigeria\'s Telecoms Regulator Introduces New Outage Notification Rules',
    description: 'NCC mandates operators to notify consumers of major outages and provide compensation for disruptions exceeding 24 hours to boost transparency.',
    author: 'Munira Audu',
    date: 'May 26, 2025',
    image: '/articles/images/telecom-outage-compensation.jpg'
  },
  {
    slug: 'rtx-4070-ti-price-drop',
    title: 'RTX 4070 Ti Graphics Cards See Significant Price Drop in Nigerian Market',
    description: 'Gaming enthusiasts in Nigeria can now access high-end graphics cards at more affordable prices as supply chain issues resolve.',
    author: 'Chinelo Ikenna',
    date: 'May 25, 2025',
    image: '/articles/images/4070ti.jpg'
  },
  {
    slug: '5g-network-nigeria',
    title: 'Nigeria\'s 5G Network Reaches 50% Population Coverage',
    description: 'MTN and Airtel achieve major milestone in nationwide 5G deployment, transforming digital infrastructure across major cities.',
    author: 'Adebayo Ogundimu',
    date: 'May 26, 2024',
    image: '/articles/images/5g-tower-lagos.jpg'
  },
  {
    slug: 'blockchain-land-registry',
    title: 'Blockchain Land Registry System Proposed for Nigeria',
    description: 'Government explores blockchain technology to modernize land registration and reduce property disputes across the country.',
    author: 'CyberHost Nigeria Editorial',
    date: 'May 23, 2025',
    image: '/articles/images/blockchain-land.jpg'
  },
  {
  slug: 'enemy-within-ncc',
  title: 'The Enemy Within: How Internal Forces Are Undermining the NCC',
  description: 'A critical response to recent media allegations, exposing how internal resistance and false narratives are threatening reform efforts at the NCC.',
  author: 'Munira Audu',
  date: 'June 12, 2025',
  image: '/articles/images/telecom-outage-compensation.jpg.jpg'
}
];

const DOMAIN = 'https://cyberhostnigeria.com.ng';

function generateArticleHTML(article) {
  const cleanTitle = article.title.replace(/'/g, '&#39;');
  const cleanDescription = article.description.replace(/'/g, '&#39;');
  const imageUrl = `${DOMAIN}${article.image}`;
  const articleUrl = `${DOMAIN}/${article.slug}`;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <!-- Primary Meta Tags -->
    <title>${cleanTitle} | CyberHost Nigeria</title>
    <meta name="description" content="${cleanDescription}">
    
    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="CyberHost Nigeria">
    <meta property="og:title" content="${cleanTitle}">
    <meta property="og:description" content="${cleanDescription}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:url" content="${articleUrl}">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${cleanTitle}">
    <meta name="twitter:description" content="${cleanDescription}">
    <meta name="twitter:image" content="${imageUrl}">
    
    <!-- Auto-redirect to React app -->
    <script>
        const userAgent = navigator.userAgent.toLowerCase();
        const isCrawler = /bot|crawler|spider|facebook|twitter|whatsapp|telegram|linkedin/i.test(userAgent);
        
        if (!isCrawler) {
            window.location.replace('/#/article/${article.slug}');
        }
    </script>
</head>
<body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
    <h1>${cleanTitle}</h1>
    <img src="${imageUrl}" 
         alt="${cleanTitle}" 
         style="width: 100%; max-width: 600px; height: auto;">
    <p><strong>By ${article.author} | ${article.date}</strong></p>
    <p>${cleanDescription}</p>
    <p><a href="/#/article/${article.slug}" style="color: #2563eb;">Continue reading the full article →</a></p>
    
    <script>
        setTimeout(() => {
            window.location.replace('/#/article/${article.slug}');
        }, 3000);
    </script>
</body>
</html>`;
}

// Generate all HTML files
console.log('Generating social sharing pages...\n');

articles.forEach(article => {
  const html = generateArticleHTML(article);
  const filename = `public/${article.slug}.html`;
  
  fs.writeFileSync(filename, html);
  console.log(`✅ Generated: ${filename}`);
  console.log(`   Share URL: ${DOMAIN}/${article.slug}`);
});

console.log('\n🎉 All social sharing pages generated!');
console.log('\nNext steps:');
console.log('1. git add public/*.html');
console.log('2. git commit -m "Add social sharing pages with custom domain"');
console.log('3. git push origin main');