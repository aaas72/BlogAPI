import api from './api';
import { mapBackendToFrontend } from './postsService';

const searchService = {
  /**
   * Advanced search for posts
   * @param {string} query
   * @returns {Promise<Array>} List of matching posts mapped to frontend schema
   */
  async advancedSearch(query) {
    const res = await api.get('/api/search/posts', {
      params: { q: query }
    });
    const postsArray = res.data?.posts || [];
    return postsArray.map(mapBackendToFrontend);
  },

  /**
   * Quick title search
   * @param {string} query
   * @returns {Promise<Array>} List of titles
   */
  async quickTitleSearch(query) {
    const res = await api.get('/api/search/titles', {
      params: { q: query }
    });
    return res.data?.titles || [];
  },

  /**
   * Get popular tags
   * @returns {Promise<Array>} List of popular tags
   */
  async getPopularTags() {
    const res = await api.get('/api/search/tags');
    return res.data?.tags || [];
  },

  /**
   * Get blog statistics
   * @returns {Promise<Object>} Statistics
   */
  async getBlogStatistics() {
    const res = await api.get('/api/search/stats');
    return res.data?.stats || {};
  }
};

export default searchService;
