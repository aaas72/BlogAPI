import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create upload folders
const createUploadFolders = () => {
  const folders = [
    path.join(__dirname, '../uploads'),
    path.join(__dirname, '../uploads/avatars'),
    path.join(__dirname, '../uploads/posts'),
  ];

  folders.forEach(folder => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
      console.log(`Created folder: ${folder}`);
    }
  });
};

// Create folders when loading this module
createUploadFolders();

// Memory storage setup for multer
const storage = multer.memoryStorage();

// File type filter
const fileFilter = (req, file, cb) => {
  console.log(`Uploading file: ${file.originalname}, type: ${file.mimetype}`);
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed. Allowed types: JPEG, PNG, GIF, WebP.`), false);
  }
};

// Multer setup
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 5,                  // max 5 files
  },
  fileFilter: fileFilter
});

// Image processing function
const processImage = async (buffer, filename, type = 'post') => {
  try {
    let outputPath;
    let sharpInstance = sharp(buffer);

    if (type === 'avatar') {
      outputPath = path.join(__dirname, '../uploads/avatars', filename);
      sharpInstance = sharpInstance.resize(300, 300, { fit: 'cover' }).jpeg({ quality: 90 });
    } else {
      outputPath = path.join(__dirname, '../uploads/posts', filename);
      sharpInstance = sharpInstance.resize(1200, 800, { 
        fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 85 
          
        });
    }
    await sharpInstance.toFile(outputPath);
    console.log(`Image processed: ${filename}`);
    return filename;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
};

export { upload, processImage, createUploadFolders };
