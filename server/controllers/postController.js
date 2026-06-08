import Post from '../models/Post.js';
import User from '../models/User.js';

// 🆕 إضافة Analytics import
import { trackEvent } from '../middleware/analytics.js';

// دالة مساعدة لتحديد نوع الجهاز
const getDeviceType = (userAgent) => {
  if (!userAgent) return 'desktop';

  const mobileRegex = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const tabletRegex = /iPad|Android(?=.*Tablet)|Tablet/i;

  if (tabletRegex.test(userAgent)) return 'tablet';
  if (mobileRegex.test(userAgent)) return 'mobile';
  return 'desktop';
};

// Get all posts with search & filters
export const getPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      author = '',
      status = 'published',
      tags = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = {};

    if (status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (author) {
      query.author = author;
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await Post.find(query)
      .populate('author', 'name email avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / parseInt(limit));

    // 🆕 تسجيل البحث في Analytics (إذا كان هناك بحث)
    if (search && search.trim()) {
      setImmediate(async () => {
        try {
          await trackEvent({
            event: 'search',
            sessionId: req.session?.id || 'anonymous',
            userId: req.user?.id || null,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            device: getDeviceType(req.get('User-Agent')),
            metadata: {
              query: search.trim(),
              resultsCount: totalPosts,
              filters: { author, status, tags, sortBy, sortOrder }
            }
          });
        } catch (error) {
          console.log('Analytics search tracking failed:', error.message);
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalPosts,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get single post - مع Analytics
export const getPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate('author', 'name email avatar')
      .populate('likes.user', 'name');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // زيادة المشاهدات بدون إعادة التحقق من صحة البيانات
    await Post.findByIdAndUpdate(id, { $inc: { views: 1 } });

    // 🆕 تسجيل مشاهدة المقال في Analytics
    setImmediate(async () => {
      try {
        await trackEvent({
          event: 'post_view',
          resourceId: post._id,
          resourceType: 'post',
          sessionId: req.session?.id || 'anonymous',
          userId: req.user?.id || null,
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          device: getDeviceType(req.get('User-Agent')),
          metadata: {
            postTitle: post.title,
            author: post.author._id,
            authorName: post.author.name,
            tags: post.tags
          }
        });
      } catch (error) {
        console.log('Analytics post view tracking failed:', error.message);
      }
    });

    res.status(200).json({
      success: true,
      data: { post }
    });

  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create new post 
export const createPost = async (req, res) => {
  try {
    const { title, content, excerpt, tags, status, featuredImage, isPublic } = req.body;
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }
    const post = await Post.create({
      title,
      content,
      excerpt,
      author: req.user._id,
      tags: Array.isArray(tags)
        ? tags.map(tag => String(tag).trim())
        : (typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : []),
      status: status || 'draft',
      featuredImage,
      isPublic: isPublic !== undefined ? isPublic : true
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name email avatar');

    //Analytics
    setImmediate(async () => {
      try {
        await trackEvent({
          event: 'post_create',
          resourceId: post._id,
          resourceType: 'post',
          sessionId: req.session?.id || 'anonymous',
          userId: req.user._id,
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          device: getDeviceType(req.get('User-Agent')),
          metadata: {
            postTitle: title,
            status: status || 'draft',
            tags: populatedPost.tags,
            hasImage: !!featuredImage
          }
        });
      } catch (error) {
        console.log('Analytics post creation tracking failed:', error.message);
      }
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post: populatedPost }
    });

  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update post
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, tags, status, featuredImage, isPublic } = req.body;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this post'
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (excerpt) updateData.excerpt = excerpt;
    if (tags) {
      updateData.tags = Array.isArray(tags)
        ? tags.map(tag => String(tag).trim())
        : (typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : []);
    }
    if (status) updateData.status = status;
    if (featuredImage) updateData.featuredImage = featuredImage;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name email avatar');

    // 🆕 تسجيل تحديث مقال في Analytics
    setImmediate(async () => {
      try {
        await trackEvent({
          event: 'post_update',
          resourceId: post._id,
          resourceType: 'post',
          sessionId: req.session?.id || 'anonymous',
          userId: req.user._id,
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          device: getDeviceType(req.get('User-Agent')),
          metadata: {
            postTitle: updatedPost.title,
            changes: Object.keys(updateData),
            newStatus: status || post.status
          }
        });
      } catch (error) {
        console.log('Analytics post update tracking failed:', error.message);
      }
    });

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: { post: updatedPost }
    });

  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post'
      });
    }

    // Analytics 
    setImmediate(async () => {
      try {
        await trackEvent({
          event: 'post_delete',
          resourceId: post._id,
          resourceType: 'post',
          sessionId: req.session?.id || 'anonymous',
          userId: req.user._id,
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          device: getDeviceType(req.get('User-Agent')),
          metadata: {
            postTitle: post.title,
            views: post.views,
            likes: post.likes?.length || 0
          }
        });
      } catch (error) {
        console.log('Analytics post deletion tracking failed:', error.message);
      }
    });

    await Post.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Like/unlike post 
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    const existingLikeIndex = post.likes.findIndex(
      like => like.user.toString() === userId.toString()
    );
    let message, liked;
    if (existingLikeIndex > -1) {
      post.likes.splice(existingLikeIndex, 1);
      message = 'Like removed';
      liked = false;
    } else {
      post.likes.push({ user: userId });
      message = 'Post liked';
      liked = true;
      setImmediate(async () => {
        try {
          await trackEvent({
            event: 'post_like',
            resourceId: post._id,
            resourceType: 'post',
            sessionId: req.session?.id || 'anonymous',
            userId: req.user._id,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            device: getDeviceType(req.get('User-Agent')),
            metadata: {
              postTitle: post.title,
              author: post.author,
              action: 'like_added'
            }
          });
        } catch (error) {
          console.log('Analytics like tracking failed:', error.message);
        }
      });
    }
    await post.save();
    res.status(200).json({
      success: true,
      message,
      data: {
        liked,
        likesCount: post.likes.length
      }
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get current user's posts
export const getMyPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;

    let query = { author: req.user._id };
    if (status !== 'all') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await Post.find(query)
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPosts = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPosts / parseInt(limit)),
          totalPosts
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};