import api from './api';

const uploadService = {
  /**
   * Upload post image
   * @param {File} file
   * @returns {Promise<string>} Full URL to the uploaded image
   */
  async uploadPostImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const res = await api.post('/api/upload/post-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${baseUrl}${res.data.url}`;
  },

  /**
   * Upload user avatar
   * @param {File} file
   * @returns {Promise<string>} Full URL to the uploaded avatar
   */
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    const res = await api.post('/api/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${baseUrl}${res.data.url}`;
  }
};

export default uploadService;
