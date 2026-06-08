import api from './api';

/**
 * Maps a backend MongoDB comment object to the frontend schema.
 */
export const mapBackendToFrontendComment = (comment) => {
  if (!comment) return null;
  return {
    id: comment._id || comment.id,
    _id: comment._id,
    author: comment.author?.name || 'Anonymous',
    authorId: comment.author?._id || comment.author?.id || comment.author || '',
    avatar: comment.author?.avatar || 'default-avatar.png',
    timestamp: comment.createdAt 
      ? new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Just now',
    content: comment.content,
    likesCount: comment.likesCount !== undefined ? comment.likesCount : (comment.likes ? comment.likes.length : 0),
    likes: comment.likes || [],
    replies: comment.replies ? comment.replies.map(mapBackendToFrontendComment) : [],
    hasMoreReplies: comment.hasMoreReplies || false
  };
};

const commentsService = {
  /**
   * Fetch all comments of a specific post
   * @param {string} postId
   */
  async getByPostId(postId) {
    const res = await api.get(`/api/comments/post/${postId}`);
    const commentsArray = res.data?.comments || [];
    return commentsArray.map(mapBackendToFrontendComment);
  },

  /**
   * Create a new comment
   * @param {string} postId
   * @param {string} content
   * @param {string|null} parentCommentId
   */
  async create(postId, content, parentCommentId = null) {
    const payload = {
      content: content.trim(),
      parentComment: parentCommentId
    };
    const res = await api.post(`/api/comments/post/${postId}`, payload);
    return mapBackendToFrontendComment(res.data?.comment);
  },

  /**
   * Delete a comment
   * @param {string} commentId
   */
  async delete(commentId) {
    await api.delete(`/api/comments/${commentId}`);
    return true;
  },

  /**
   * Toggle comment like
   * @param {string} commentId
   */
  async toggleLike(commentId) {
    const res = await api.post(`/api/comments/${commentId}/like`);
    return {
      liked: res.data?.liked,
      likesCount: res.data?.likesCount
    };
  }
};

export default commentsService;
