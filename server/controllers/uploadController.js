import { processImage } from '../middleware/upload.js';
import User from '../models/User.js';

// Upload user avatar
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file selected'
      });
    }

    console.log('Uploading avatar for user:', req.user.name);

    const filename = `avatar_${req.user._id}_${Date.now()}.jpg`;
    const savedFilename = await processImage(req.file.buffer, filename, 'avatar');

    // Update user data
    await User.findByIdAndUpdate(req.user._id, { avatar: savedFilename });

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        filename: savedFilename,
        url: `/uploads/avatars/${savedFilename}`
      }
    });

  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: error.message
    });
  }
};

// Upload post image
export const uploadPostImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file selected'
      });
    }

    console.log('Uploading post image');

    const filename = `post_${req.user._id}_${Date.now()}.jpg`;
    const savedFilename = await processImage(req.file.buffer, filename, 'post');

    res.status(200).json({
      success: true,
      message: 'Post image uploaded successfully',
      data: {
        filename: savedFilename,
        url: `/uploads/posts/${savedFilename}`
      }
    });

  } catch (error) {
    console.error('Error uploading post image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload post image',
      error: error.message
    });
  }
};

// Upload multiple images
export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files selected'
      });
    }

    console.log(`Uploading ${req.files.length} files`);

    const uploadedFiles = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const filename = `multi_${req.user._id}_${Date.now()}_${i}.jpg`;
      const savedFilename = await processImage(file.buffer, filename, 'post');
      
      uploadedFiles.push({
        originalName: file.originalname,
        filename: savedFilename,
        url: `/uploads/posts/${savedFilename}`
      });
    }

    res.status(200).json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      data: { files: uploadedFiles }
    });

  } catch (error) {
    console.error('Error uploading multiple files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload files',
      error: error.message
    });
  }
};
