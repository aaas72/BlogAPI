import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import postsService from '../services/postsService';

const AppContext = createContext();

export function AppProvider({ children }) {

  // ── Auth State ───────────────────────────────────────────────
  const [user, setUser]             = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ── Posts State ──────────────────────────────────────────────
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  // ── تحقق من الجلسة وجلب المقالات عند بدء التطبيق ───────────
  useEffect(() => {
    // جلب المستخدم الحالي
    authService.getMe()
      .then((fetchedUser) => setUser(fetchedUser))
      .finally(() => setAuthLoading(false));

    // جلب المقالات من قاعدة البيانات
    const loadPosts = async () => {
      try {
        setPostsLoading(true);
        const data = await postsService.getAll();
        setPosts(data);
      } catch (err) {
        console.error("Failed to load posts from API:", err);
      } finally {
        setPostsLoading(false);
      }
    };
    loadPosts();
  }, []);

  // ── استمع لحدث auth:logout (يُطلَق من api.js عند 401) ──────
  useEffect(() => {
    const handleForceLogout = () => setUser(null);
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  // ── Auth Functions ───────────────────────────────────────────

  const login = async (email, password) => {
    try {
      const fetchedUser = await authService.login(email, password);
      setUser(fetchedUser);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || 'Invalid credentials.' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const fetchedUser = await authService.register(name, email, password);
      setUser(fetchedUser);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || 'Registration failed.' };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // ── Posts CRUD ──────────────────────────────────────────────

  const addPost = async (postData) => {
    try {
      const newPost = await postsService.create(postData);
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      console.error("Failed to add post:", err);
      throw err;
    }
  };

  const updatePost = async (id, updatedData) => {
    try {
      const updatedPost = await postsService.update(id, updatedData);
      setPosts(prev => prev.map(p => (String(p.id) === String(id)) ? updatedPost : p));
      return updatedPost;
    } catch (err) {
      console.error("Failed to update post:", err);
      throw err;
    }
  };

  const deletePost = async (id) => {
    try {
      await postsService.delete(id);
      setPosts(prev => prev.filter(p => String(p.id) !== String(id)));
      return true;
    } catch (err) {
      console.error("Failed to delete post:", err);
      throw err;
    }
  };

  const toggleLikePost = async (id) => {
    try {
      const result = await postsService.toggleLike(id);
      setPosts(prev => prev.map(p => {
        if (String(p.id) === String(id)) {
          const userId = user?.id || user?._id;
          let updatedLikes = [...(p.likes || [])];
          if (result.liked) {
            if (userId && !updatedLikes.some(l => String(l.user || l) === String(userId))) {
              updatedLikes.push({ user: userId });
            }
          } else {
            updatedLikes = updatedLikes.filter(l => String(l.user || l) !== String(userId));
          }
          return {
            ...p,
            likesCount: result.likesCount,
            likes: updatedLikes
          };
        }
        return p;
      }));
      return result;
    } catch (err) {
      console.error("Failed to toggle post like:", err);
      throw err;
    }
  };

  const searchPosts = async (query) => {
    try {
      setPostsLoading(true);
      const data = await postsService.getAll({ search: query, limit: 100, status: 'published' });
      setPosts(data);
    } catch (err) {
      console.error("Failed to search posts:", err);
    } finally {
      setPostsLoading(false);
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      authLoading,
      posts,
      postsLoading,
      login,
      register,
      logout,
      addPost,
      updatePost,
      deletePost,
      toggleLikePost,
      searchPosts,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
