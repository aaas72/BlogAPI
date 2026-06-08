import express from 'express';
import {
  uploadAvatar,
  uploadPostImage,
  uploadMultipleImages
} from '../controllers/uploadController.js';
import { upload } from '../middleware/upload.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();


// All upload routes require authentication
router.use(protect);

// Upload user avatar
router.post('/avatar', upload.single('avatar'), uploadAvatar);

// Upload post image
router.post('/post-image', upload.single('image'), uploadPostImage);

// Upload multiple images
router.post('/multiple', upload.array('files', 5), uploadMultipleImages);


export default router;
