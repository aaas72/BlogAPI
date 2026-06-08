import { useEffect } from 'react';

/**
 * Custom hook to dynamically update document metadata (SEO)
 * @param {Object} metadata
 * @param {string} metadata.title - Page title
 * @param {string} metadata.description - Meta description
 * @param {string} metadata.keywords - Meta keywords
 */
export default function useDocumentMetadata({ title, description, keywords }) {
  useEffect(() => {
    // 1. Update Title
    if (title) {
      document.title = `${title} | Daily Pulse`;
    } else {
      document.title = 'Daily Pulse | All voices matter';
    }

    // 2. Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    if (description) {
      metaDescription.setAttribute('content', description);
    } else {
      metaDescription.setAttribute(
        'content', 
        'Daily Pulse - A premium digital news publication and blog. Read the latest analysis in culture, economy, politics, science, and technology.'
      );
    }

    // 3. Update Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    if (keywords) {
      metaKeywords.setAttribute('content', keywords);
    } else {
      metaKeywords.setAttribute(
        'content', 
        'news, daily pulse, blog, articles, culture, economy, politics, science, technology'
      );
    }
  }, [title, description, keywords]);
}
