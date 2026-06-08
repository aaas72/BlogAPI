// controllers/commentController.js - Comments logic
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

// Get comments of a specific post
export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Build query
    const query = { 
      post: postId, 
      parentComment: null, // only main comments (no replies)
      status: 'approved'
    };

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch comments with replies
    const comments = await Comment.find(query)
      .populate('author', 'name email avatar')
      .populate({
        path: 'parentComment',
        populate: {
          path: 'author',
          select: 'name'
        }
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Fetch replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ 
          parentComment: comment._id,
          status: 'approved'
        })
        .populate('author', 'name email avatar')
        .sort({ createdAt: 1 })
        .limit(3); // only first 3 replies

        const commentObj = comment.toObject();
        commentObj.replies = replies;
        commentObj.hasMoreReplies = await Comment.countDocuments({ 
          parentComment: comment._id,
          status: 'approved'
        }) > 3;
        
        return commentObj;
      })
    );

    const totalComments = await Comment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        comments: commentsWithReplies,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalComments / parseInt(limit)),
          totalComments,
          hasNext: parseInt(page) < Math.ceil(totalComments / parseInt(limit)),
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Add new comment
export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentComment } = req.body;

    // Validate required data
    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // If replying to comment, check if parent exists
    if (parentComment) {
      const parentCommentExists = await Comment.findById(parentComment);
      if (!parentCommentExists) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
    }

    // Create comment
    const comment = await Comment.create({
      content: content.trim(),
      author: req.user._id,
      post: postId,
      parentComment: parentComment || null
    });

    // Fetch comment with author data
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name email avatar')
      .populate({
        path: 'parentComment',
        populate: {
          path: 'author',
          select: 'name'
        }
      });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment: populatedComment }
    });

  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update comment
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check permissions
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this comment'
      });
    }

    // Update comment
    comment.content = content.trim();
    comment.isEdited = true;
    comment.editedAt = new Date();
    await comment.save();

    const updatedComment = await Comment.findById(id)
      .populate('author', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: { comment: updatedComment }
    });

  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check permissions
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this comment'
      });
    }

    // Delete replies related to this comment too
    await Comment.deleteMany({ parentComment: id });
    
    // Delete original comment
    await Comment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Comment and its replies deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Toggle like/unlike on comment
export const toggleCommentLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const existingLikeIndex = comment.likes.findIndex(
      like => like.user.toString() === userId.toString()
    );

    if (existingLikeIndex > -1) {
      comment.likes.splice(existingLikeIndex, 1);
      var message = 'Like removed';
      var liked = false;
    } else {
      comment.likes.push({ user: userId });
      var message = 'Like added';
      var liked = true;
    }

    await comment.save();

    res.status(200).json({
      success: true,
      message,
      data: {
        liked,
        likesCount: comment.likes.length
      }
    });

  } catch (error) {
    console.error('Error toggling comment like:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get replies of a specific comment (for load more)
export const getCommentReplies = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 5 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const replies = await Comment.find({ 
      parentComment: id,
      status: 'approved'
    })
    .populate('author', 'name email avatar')
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(parseInt(limit));

    const totalReplies = await Comment.countDocuments({ 
      parentComment: id,
      status: 'approved'
    });

    res.status(200).json({
      success: true,
      data: {
        replies,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReplies / parseInt(limit)),
          totalReplies,
          hasMore: parseInt(page) < Math.ceil(totalReplies / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching comment replies:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get comments of the current user
export const getMyComments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;

    let query = { author: req.user._id };
    if (status !== 'all') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const comments = await Comment.find(query)
      .populate('author', 'name email avatar')
      .populate('post', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalComments = await Comment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalComments / parseInt(limit)),
          totalComments
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user comments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
