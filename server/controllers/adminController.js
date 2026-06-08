import Post from '../models/Post.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';

export const getDashboardOverview = async (req, res) => {
  try {
    console.log('Getting admin dashboard overview...');

    const stats = await Promise.all([
      Post.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            published: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
            draft: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
            totalViews: { $sum: { $ifNull: ['$views', 0] } },
            totalLikes: { $sum: { $size: { $ifNull: ['$likes', []] } } }
          }
        }
      ]),
      User.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } },
            admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } }
          }
        }
      ]),
      Comment.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
          }
        }
      ])
    ]);

    const recentPosts = await Post.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status views createdAt author');

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role isActive createdAt');

    const pendingComments = await Comment.find({ status: 'pending' })
      .populate('author', 'name email')
      .populate('post', 'title')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('content author post createdAt');

    const overview = {
      stats: {
        posts: stats[0][0] || { total: 0, published: 0, draft: 0, totalViews: 0, totalLikes: 0 },
        users: stats[1][0] || { total: 0, active: 0, admins: 0 },
        comments: stats[2][0] || { total: 0, approved: 0, pending: 0 }
      },
      recent: {
        posts: recentPosts,
        users: recentUsers,
        pendingComments
      },
      systemInfo: {
        serverTime: new Date().toISOString(),
        adminUser: {
          name: req.user.name,
          email: req.user.email,
          lastLogin: req.user.updatedAt
        }
      }
    };

    console.log('Dashboard overview generated');

    res.status(200).json({
      success: true,
      message: 'Dashboard overview retrieved successfully',
      data: overview
    });

  } catch (error) {
    console.error('Error getting dashboard overview:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting dashboard overview',
      error: error.message
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      role = 'all', 
      status = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    console.log(`Getting users: page=${page}, search="${search}"`);

    let query = {};

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (role !== 'all') query.role = role;
    if (status !== 'all') query.isActive = status === 'active';

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password')
      .lean();

    const totalUsers = await User.countDocuments(query);

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const postsCount = await Post.countDocuments({ author: user._id });
        const commentsCount = await Comment.countDocuments({ author: user._id });
        return {
          ...user,
          stats: { postsCount, commentsCount }
        };
      })
    );

    res.status(200).json({
      success: true,
      message: `Found ${totalUsers} users`,
      data: {
        users: usersWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / parseInt(limit)),
          totalUsers,
          hasNext: parseInt(page) < Math.ceil(totalUsers / parseInt(limit)),
          hasPrev: parseInt(page) > 1
        },
        filters: { search, role, status, sortBy, sortOrder }
      }
    });

  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting users',
      error: error.message
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, role } = req.body;

    console.log(`Updating user ${userId}: active=${isActive}, role=${role}`);

    const updateData = {};
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (role && ['user', 'admin'].includes(role)) updateData.role = role;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log(`User ${user.name} updated successfully`);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user },
      adminAction: req.adminAction
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`Deleting user ${userId}`);

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await Post.deleteMany({ author: userId });
    await Comment.deleteMany({ author: userId });
    await User.findByIdAndDelete(userId);

    console.log(`User ${user.name} deleted successfully`);

    res.status(200).json({
      success: true,
      message: 'User and associated content deleted successfully',
      deletedUser: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      adminAction: req.adminAction
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      status = 'all',
      author = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    console.log(`Getting posts for admin: page=${page}, search="${search}"`);

    let query = {};

    if (search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { content: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (status !== 'all') query.status = status;
    if (author) query.author = author;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await Post.find(query)
      .populate('author', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalPosts = await Post.countDocuments(query);

    const postsWithStats = await Promise.all(
      posts.map(async (post) => {
        const commentsCount = await Comment.countDocuments({ post: post._id });
        return {
          ...post,
          stats: {
            commentsCount,
            likesCount: post.likes?.length || 0
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      message: `Found ${totalPosts} posts`,
      data: {
        posts: postsWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPosts / parseInt(limit)),
          totalPosts,
          hasNext: parseInt(page) < Math.ceil(totalPosts / parseInt(limit)),
          hasPrev: parseInt(page) > 1
        },
        filters: { search, status, author, sortBy, sortOrder }
      }
    });

  } catch (error) {
    console.error('Error getting posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting posts',
      error: error.message
    });
  }
};

export const updatePostStatus = async (req, res) => {
  try {
    const { postId } = req.params;
    const { status } = req.body;

    console.log(`Updating post ${postId} status to: ${status}`);

    if (!['published', 'draft', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: published, draft, or archived'
      });
    }

    const post = await Post.findByIdAndUpdate(
      postId,
      { status },
      { new: true, runValidators: true }
    ).populate('author', 'name email');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    console.log(`Post "${post.title}" status updated to ${status}`);

    res.status(200).json({
      success: true,
      message: 'Post status updated successfully',
      data: { post },
      adminAction: req.adminAction
    });

  } catch (error) {
    console.error('Error updating post status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating post status',
      error: error.message
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    console.log(`Deleting post ${postId}`);

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    await Comment.deleteMany({ post: postId });
    await Post.findByIdAndDelete(postId);

    console.log(`Post "${post.title}" deleted successfully`);

    res.status(200).json({
      success: true,
      message: 'Post and associated comments deleted successfully',
      deletedPost: {
        id: post._id,
        title: post.title,
        author: post.author
      },
      adminAction: req.adminAction
    });

  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting post',
      error: error.message
    });
  }
};

export const getAllComments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      status = 'all',
      postId = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    console.log(`Getting comments for admin: page=${page}, status=${status}`);

    let query = {};

    if (search.trim()) {
      query.content = { $regex: search.trim(), $options: 'i' };
    }

    if (status !== 'all') query.status = status;
    if (postId) query.post = postId;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const comments = await Comment.find(query)
      .populate('author', 'name email')
      .populate('post', 'title')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const totalComments = await Comment.countDocuments(query);

    res.status(200).json({
      success: true,
      message: `Found ${totalComments} comments`,
      data: {
        comments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalComments / parseInt(limit)),
          totalComments,
          hasNext: parseInt(page) < Math.ceil(totalComments / parseInt(limit)),
          hasPrev: parseInt(page) > 1
        },
        filters: { search, status, postId, sortBy, sortOrder }
      }
    });

  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting comments',
      error: error.message
    });
  }
};

export const updateCommentStatus = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { status } = req.body;

    console.log(`Updating comment ${commentId} status to: ${status}`);

    if (!['approved', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: approved, pending, or rejected'
      });
    }

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { status },
      { new: true, runValidators: true }
    ).populate('author', 'name email').populate('post', 'title');

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    console.log(`Comment status updated to ${status}`);

    res.status(200).json({
      success: true,
      message: 'Comment status updated successfully',
      data: { comment },
      adminAction: req.adminAction
    });

  } catch (error) {
    console.error('Error updating comment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating comment status',
      error: error.message
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    console.log(`Deleting comment ${commentId}`);

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    await Comment.findByIdAndDelete(commentId);

    console.log(`Comment deleted successfully`);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      deletedComment: {
        id: comment._id,
        content: comment.content.substring(0, 50) + '...',
        author: comment.author
      },
      adminAction: req.adminAction
    });

  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
      error: error.message
    });
  }
};
