import React from 'react';

const MarkdownRenderer = ({ content, className = '', standalone = true }) => {
  if (!content) return null;

  // Simple HTML detection
  const isHtml = (text) => {
    return /<[a-z][\s\S]*>/i.test(text) && text.includes('</');
  };

  // Basic HTML sanitization
  const sanitizeHtml = (html) => {
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  };

  // Process markdown to HTML with inline styles
  const parseMarkdown = (text) => {
    let html = '';
    const lines = text.split('\n');
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) {
        html += '<div style="height: 16px;"></div>';
        i++;
        continue;
      }
      
      // Headers (# ## ### etc.)
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const text = processInlineMarkdown(headerMatch[2]);
        const headerStyles = {
          1: 'font-size: 2.25rem; font-weight: 700; color: #111827; margin-bottom: 1.5rem; margin-top: 2rem; line-height: 1.2;',
          2: 'font-size: 1.875rem; font-weight: 600; color: #1f2937; margin-bottom: 1rem; margin-top: 1.5rem; line-height: 1.3;',
          3: 'font-size: 1.5rem; font-weight: 600; color: #1f2937; margin-bottom: 0.75rem; margin-top: 1.25rem; line-height: 1.3;',
          4: 'font-size: 1.25rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem; margin-top: 1rem; line-height: 1.4;',
          5: 'font-size: 1.125rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem; margin-top: 0.75rem; line-height: 1.4;',
          6: 'font-size: 1rem; font-weight: 500; color: #4b5563; margin-bottom: 0.5rem; margin-top: 0.75rem; line-height: 1.4;'
        };
        html += `<h${level} style="${headerStyles[level]}">${text}</h${level}>`;
        i++;
        continue;
      }
      
      // Code blocks (```)
      if (line.startsWith('```')) {
        const language = line.substring(3).trim();
        i++; // Move to next line
        let codeContent = '';
        
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeContent += lines[i] + '\n';
          i++;
        }
        
        html += `<pre style="background-color: #1f2937; color: #10b981; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin-bottom: 1.5rem; font-family: 'Courier New', monospace; font-size: 0.875rem;"><code>${escapeHtml(codeContent.trim())}</code></pre>`;
        i++; // Skip closing ```
        continue;
      }
      
      // Tables
      if (line.includes('|')) {
        const tableResult = parseTable(lines, i);
        if (tableResult.html) {
          html += tableResult.html;
          i = tableResult.nextIndex;
          continue;
        }
      }
      
      // Blockquotes (>)
      if (line.startsWith('>')) {
        const quote = processInlineMarkdown(line.substring(1).trim());
        html += `<blockquote style="border-left: 4px solid #3b82f6; padding-left: 1rem; padding-top: 0.5rem; padding-bottom: 0.5rem; margin-bottom: 1rem; color: #4b5563; font-style: italic; background-color: #eff6ff; border-radius: 0 0.5rem 0.5rem 0;">${quote}</blockquote>`;
        i++;
        continue;
      }
      
      // Unordered lists (- * +)
      if (line.match(/^[\s]*[-*+]\s+/)) {
        const listResult = parseList(lines, i, 'ul');
        html += listResult.html;
        i = listResult.nextIndex;
        continue;
      }
      
      // Ordered lists (1. 2. etc.)
      if (line.match(/^[\s]*\d+\.\s+/)) {
        const listResult = parseList(lines, i, 'ol');
        html += listResult.html;
        i = listResult.nextIndex;
        continue;
      }
      
      // Horizontal rule (--- or ***)
      if (line.match(/^[-*]{3,}$/)) {
        html += '<hr style="border: none; border-top: 2px solid #d1d5db; margin: 1.5rem 0;">';
        i++;
        continue;
      }
      
      // Regular paragraph
      if (line) {
        html += `<p style="margin-bottom: 1rem; color: #374151; line-height: 1.6;">${processInlineMarkdown(line)}</p>`;
      }
      
      i++;
    }
    
    return html;
  };

  // Parse tables with inline styles
  const parseTable = (lines, startIndex) => {
    const firstLine = lines[startIndex].trim();
    if (!firstLine.includes('|')) return { html: null, nextIndex: startIndex };
    
    // Check if next line is separator
    const secondLine = lines[startIndex + 1];
    if (!secondLine || !secondLine.match(/^\s*\|[\s\-:|]+\|\s*$/)) {
      return { html: null, nextIndex: startIndex };
    }
    
    // Parse header
    const headerCells = firstLine.split('|').map(cell => cell.trim()).filter(cell => cell);
    let html = `
      <div style="overflow-x: auto; margin-bottom: 1.5rem;">
        <table style="min-width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; border-collapse: collapse;">
          <thead style="background-color: #f9fafb;">
            <tr>
    `;
    
    headerCells.forEach(cell => {
      html += `<th style="padding: 0.75rem; text-align: left; font-weight: 600; color: #111827; border-bottom: 1px solid #e5e7eb;">${processInlineMarkdown(cell)}</th>`;
    });
    
    html += '</tr></thead><tbody>';
    
    // Parse rows
    let i = startIndex + 2; // Skip header and separator
    while (i < lines.length) {
      const line = lines[i].trim();
      if (!line.includes('|')) break;
      
      const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
      html += '<tr style="border-bottom: 1px solid #e5e7eb;">';
      
      cells.forEach(cell => {
        html += `<td style="padding: 0.75rem; color: #374151;">${processInlineMarkdown(cell)}</td>`;
      });
      
      html += '</tr>';
      i++;
    }
    
    html += '</tbody></table></div>';
    
    return { html, nextIndex: i };
  };

  // Parse lists with inline styles
  const parseList = (lines, startIndex, listType) => {
    const listStyle = listType === 'ol' 
      ? 'list-style-type: decimal; padding-left: 2rem; margin-bottom: 1rem;'
      : 'list-style-type: disc; padding-left: 2rem; margin-bottom: 1rem;';
    let html = `<${listType} style="${listStyle}">`;
    let i = startIndex;
    
    while (i < lines.length) {
      const line = lines[i].trim();
      const listMatch = listType === 'ol' 
        ? line.match(/^[\s]*\d+\.\s+(.+)$/)
        : line.match(/^[\s]*[-*+]\s+(.+)$/);
      
      if (!listMatch) break;
      
      const content = processInlineMarkdown(listMatch[1]);
      html += `<li style="margin-bottom: 0.25rem; color: #374151; line-height: 1.5;">${content}</li>`;
      i++;
    }
    
    html += `</${listType}>`;
    
    return { html, nextIndex: i };
  };

  // Process inline markdown with inline styles
// Process inline markdown with inline styles
const processInlineMarkdown = (text) => {
  let result = escapeHtml(text);
  
  // Images - Handle these FIRST before links
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    const cleanSrc = src.trim();
    const cleanAlt = alt.trim() || 'Image';
    
    // Handle relative paths for images
    let imageSrc = cleanSrc;
    if (!cleanSrc.startsWith('http') && !cleanSrc.startsWith('data:')) {
      // Only add /articles/ prefix if it's not already there
      if (!cleanSrc.startsWith('/articles/')) {
        imageSrc = `/articles/${cleanSrc}`;
      } else {
        // Path already includes /articles/, use as-is
        imageSrc = cleanSrc;
      }
    }
    
    return `<img src="${imageSrc}" alt="${cleanAlt}" style="max-width: 100%; height: auto; border-radius: 0.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin: 1rem 0;" loading="lazy" />`;
  });
  
  // Rest of the function remains the same...
  // Links
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    const cleanUrl = url.trim();
    const cleanText = text.trim();
    const isExternal = cleanUrl.startsWith('http');
    const target = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';
    
    return `<a href="${cleanUrl}" style="color: #2563eb; text-decoration: underline;" ${target}>${cleanText}</a>`;
  });
  
  // Inline code
  result = result.replace(/`([^`]+)`/g, '<code style="background-color: #f3f4f6; color: #dc2626; padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-size: 0.875rem; font-family: \'Courier New\', monospace;">$1</code>');
  
  // Bold and italic (handle *** first, then ** and *)
  result = result.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong style="font-weight: 700;"><em style="font-style: italic;">$1</em></strong>');
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight: 700;">$1</strong>');
  result = result.replace(/\*([^*\s][^*]*[^*\s]|\S)\*/g, '<em style="font-style: italic;">$1</em>');
  
  // Strikethrough
  result = result.replace(/~~([^~]+)~~/g, '<del style="text-decoration: line-through; color: #6b7280;">$1</del>');
  
  return result;
};

  // Escape HTML entities
  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  // Handle HTML content
  if (isHtml(content)) {
    const containerClass = standalone 
      ? `max-w-4xl mx-auto p-8 ${className}`
      : className;
    
    return (
      <article className={containerClass}>
        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
      </article>
    );
  }

  // Process markdown content
  try {
    const processedHtml = parseMarkdown(content);
    const containerClass = standalone 
      ? `max-w-4xl mx-auto px-6 py-8 ${className}`
      : className;
    
    return (
      <article className={containerClass}>
        <div 
          dangerouslySetInnerHTML={{ __html: processedHtml }}
          style={{
            lineHeight: '1.6',
            color: '#374151',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        />
      </article>
    );
  } catch (error) {
    console.error('Markdown processing failed:', error);
    
    return (
      <div className={standalone ? `max-w-4xl mx-auto p-8 ${className}` : className}>
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          padding: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#991b1b',
            marginBottom: '0.5rem'
          }}>Content Error</h3>
          <p style={{
            color: '#b91c1c',
            marginBottom: '1rem'
          }}>Failed to render this content. Please check the format.</p>
          <details>
            <summary style={{
              cursor: 'pointer',
              color: '#dc2626'
            }}>Show raw content</summary>
            <pre style={{
              marginTop: '0.5rem',
              padding: '0.75rem',
              backgroundColor: '#fee2e2',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              overflow: 'auto',
              maxHeight: '10rem'
            }}>
              {content.substring(0, 500)}...
            </pre>
          </details>
        </div>
      </div>
    );
  }
};

export default MarkdownRenderer;