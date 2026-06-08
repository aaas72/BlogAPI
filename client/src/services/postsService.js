import api from './api';

/**
 * Maps a backend MongoDB post object to the frontend schema.
 */
export const mapBackendToFrontend = (post) => {
  if (!post) return null;
  return {
    id: post._id || post.id,
    _id: post._id,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt || '',
    category: (post.tags && post.tags.length > 0) ? post.tags[0].toUpperCase() : 'SCIENCE',
    image: post.featuredImage || '/hero_bg.png',
    author: post.author?.name || 'Anonymous',
    authorUsername: post.author?.email ? post.author.email.split('@')[0] : 'anonymous',
    date: post.createdAt 
      ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
      : 'UNKNOWN',
    readTime: post.readTime ? `${post.readTime} MIN READ` : '5 MIN READ',
    views: post.views || 0,
    likesCount: post.likesCount !== undefined ? post.likesCount : (post.likes ? post.likes.length : 0),
    likes: post.likes || []
  };
};

/**
 * Maps a frontend post schema to the backend request body.
 */
export const mapFrontendToBackend = (postData) => {
  return {
    title: postData.title,
    content: postData.content,
    excerpt: postData.excerpt,
    tags: postData.category ? postData.category.toLowerCase() : 'science',
    featuredImage: postData.image || '/hero_bg.png',
    status: 'published', // Automatically publish posts
    isPublic: true
  };
};

const postsService = {
  /**
   * Fetch all posts
   * @param {Object} params - Query parameters (limit, status, etc.)
   */
  async getAll(params = { limit: 100, status: 'all' }) {
    const res = await api.get('/api/posts', { params });
    const postsArray = res.data?.posts || [];
    return postsArray.map(mapBackendToFrontend);
  },

  /**
   * Fetch a single post by ID
   */
  async getById(id) {
    const res = await api.get(`/api/posts/${id}`);
    return mapBackendToFrontend(res.data?.post);
  },

  /**
   * Create a new post
   */
  async create(postData) {
    const payload = mapFrontendToBackend(postData);
    const res = await api.post('/api/posts', payload);
    return mapBackendToFrontend(res.data?.post);
  },

  /**
   * Update an existing post
   */
  async update(id, postData) {
    const payload = mapFrontendToBackend(postData);
    const res = await api.put(`/api/posts/${id}`, payload);
    return mapBackendToFrontend(res.data?.post);
  },

  /**
   * Delete a post
   */
  async delete(id) {
    await api.delete(`/api/posts/${id}`);
    return true;
  },

  /**
   * Toggle like on a post
   */
  async toggleLike(id) {
    const res = await api.post(`/api/posts/${id}/like`);
    return {
      liked: res.data?.liked,
      likesCount: res.data?.likesCount
    };
  }
};

export default postsService;
