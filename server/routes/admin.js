import express from 'express';
import {
  getDashboardOverview,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllPosts,
  updatePostStatus,
  deletePost,
  getAllComments,
  updateCommentStatus,
  deleteComment
} from '../controllers/adminController.js';
import { requireAdmin, logAdminAction } from '../middleware/adminAuth.js';

const router = express.Router();


router.use(requireAdmin);

router.get('/dashboard', getDashboardOverview);

router.get('/users', logAdminAction('VIEW_USERS'), getAllUsers);
router.put('/users/:userId/status', logAdminAction('UPDATE_USER_STATUS'), updateUserStatus);
router.delete('/users/:userId', logAdminAction('DELETE_USER'), deleteUser);

router.get('/posts', logAdminAction('VIEW_POSTS'), getAllPosts);
router.put('/posts/:postId/status', logAdminAction('UPDATE_POST_STATUS'), updatePostStatus);
router.delete('/posts/:postId', logAdminAction('DELETE_POST'), deletePost);

router.get('/comments', logAdminAction('VIEW_COMMENTS'), getAllComments);
router.put('/comments/:commentId/status', logAdminAction('UPDATE_COMMENT_STATUS'), updateCommentStatus);
router.delete('/comments/:commentId', logAdminAction('DELETE_COMMENT'), deleteComment);


export default router;
