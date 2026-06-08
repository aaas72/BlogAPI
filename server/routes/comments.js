// routes/comments.js - Comments routes
import express from 'express';
import {
  getPostComments,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
  getCommentReplies,
  getMyComments
} from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();


// Public routes
router.get('/post/:postId', getPostComments); // Comments of specific post
router.get('/:id/replies', getCommentReplies); // Replies of specific comment

// Protected routes
router.use(protect); // All routes below are protected

router.get('/me', getMyComments); // Current user comments
router.post('/post/:postId', createComment); // Add comment
router.put('/:id', updateComment); // Update comment
router.delete('/:id', deleteComment); // Delete comment
router.post('/:id/like', toggleCommentLike); // Like/unlike comment


export default router;
