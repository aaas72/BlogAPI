import dotenv from "dotenv";
dotenv.config({ path: "./config/.env" });
import helmet from 'helmet';

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import multer from 'multer';
import session from 'express-session'; // 🆕 إضافة session

// Import Logger والمكونات الجديدة
import logger from './config/logger.js';
import { requestId, requestTiming } from './middleware/requestLogger.js';
import { trackPageView } from './middleware/analytics.js'; // 🆕 إضافة analytics
import connectDB from "./config/db.js";

// Import error handling
import { 
  globalErrorHandler, 
  handleUnhandledRejection, 
  handleUncaughtException 
} from './middleware/errorHandler.js';

// Handle process-level errors مبكراً
handleUncaughtException();
handleUnhandledRejection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log application startup
logger.info('Starting Simple Blog API server', {
  nodeVersion: process.version,
  platform: process.platform,
  environment: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000
});

// Connect to database
connectDB();
const app = express();
app.use(helmet()); //Header security

// Trust proxy for accurate IP addresses في حالة استخدام proxy
app.set('trust proxy', 1);

// Request logging middleware (مبكراً جداً)
app.use(requestId);        // إضافة Request ID
app.use(requestTiming);    // قياس Response Time

// 🆕 Session middleware (مطلوب للـ Analytics)
app.use(session({
  secret: process.env.SESSION_SECRET || 'analytics-session-secret-key-blog-api',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // false للـ HTTP, true للـ HTTPS فقط
    maxAge: 24 * 60 * 60 * 1000, // 24 ساعة
    httpOnly: true // أمان إضافي
  },
  name: 'blog.session.id' // اسم مخصص للـ cookie
}));

logger.info('Session middleware configured', {
  sessionSecret: !!process.env.SESSION_SECRET,
  cookieSecure: false,
  maxAge: '24 hours'
});

// Middleware الأساسية
app.use(cors());
app.use(express.json({ 
  limit: '10mb',
  // إضافة logging للـ JSON parsing إذا أردت
  verify: (req, res, buf) => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('JSON payload received', { 
        size: buf.length,
        contentType: req.get('content-type'),
        requestId: req.id
      });
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🆕 Analytics tracking middleware (بعد session وقبل routes)
app.use(trackPageView);
logger.info('Analytics tracking middleware enabled');

// Log route registration
logger.info('Registering API routes...');

// Routes
app.use('/api/auth', (await import('./routes/auth.js')).default);
app.use('/api/posts', (await import('./routes/posts.js')).default);
app.use('/api/comments', (await import('./routes/comments.js')).default);
app.use('/api/upload', (await import('./routes/upload.js')).default);
app.use('/api/search', (await import('./routes/search.js')).default);
app.use('/api/admin', (await import('./routes/admin.js')).default);
app.use('/api/analytics', (await import('./routes/analytics.js')).default); // 🆕 Analytics routes

logger.info('All API routes registered successfully');

// Health check endpoint (مفيد للمراقبة)
app.get('/health', (req, res) => {
  const healthInfo = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
    features: {
      analytics: true,
      logging: true,
      sessions: true,
      errorHandling: true
    }
  };

  logger.debug('Health check accessed', { 
    uptime: healthInfo.uptime,
    memory: healthInfo.memory.used,
    requestId: req.id 
  });

  res.status(200).json(healthInfo);
});

// Welcome route مع logging
app.get('/', (req, res) => {
  logger.info('Root endpoint accessed', { 
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    requestId: req.id,
    sessionId: req.session?.id
  });

  res.json({
    success: true,
    message: 'Welcome to Simple Blog API',
    version: '1.5.0', // 🆕 زيادة الإصدار للـ Analytics
    environment: process.env.NODE_ENV || 'development',
    features: [
      'Professional Error Handling',
      'Advanced Logging System',
      'Analytics & Tracking System', // 🆕 ميزة جديدة
      'User Authentication',
      'Posts Management',
      'Comments System', 
      'File Upload System',
      'Advanced Search',
      'Admin Dashboard'
    ],
    endpoints: {
      auth: '/api/auth',
      posts: '/api/posts',
      comments: '/api/comments',
      upload: '/api/upload',
      search: '/api/search',
      admin: '/api/admin',
      analytics: '/api/analytics' // 🆕 إضافة analytics endpoint
    },
    analytics: {
      tracking: true,
      sessionId: req.session?.id?.substring(0, 8) + '...', // عرض جزء من session ID
      requestId: req.id
    },
    timestamp: new Date().toISOString()
  });
});

// Handle undefined routes مع logging
app.use((req, res, next) => {
  // Log the 404 attempt
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.id,
    sessionId: req.session?.id
  });

  res.status(404).json({
    success: false,
    error: {
      type: 'NotFoundError',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND',
      statusCode: 404,
      timestamp: new Date().toISOString(),
      requestId: req.id
    }
  });
});

// Multer error handling مع logging
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    // Log multer errors
    logger.warn('Multer upload error', {
      error: error.code,
      message: error.message,
      field: error.field,
      requestId: req.id,
      sessionId: req.session?.id,
      userId: req.user?.id
    });

    let message = 'File upload error';
    let code = 'FILE_UPLOAD_ERROR';

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size too large. Maximum size is 5MB';
        code = 'FILE_TOO_LARGE';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Maximum is 5 files per upload';
        code = 'TOO_MANY_FILES';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        code = 'UNEXPECTED_FILE_FIELD';
        break;
    }

    const fileError = new Error(message);
    fileError.statusCode = 400;
    fileError.errorCode = code;
    fileError.isOperational = true;
    
    return next(fileError);
  }
  next(error);
});

// Global error handler (must be last middleware)
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  // Log successful startup
  logger.info('Server started successfully', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    logLevel: logger.level,
    pid: process.pid,
    nodeVersion: process.version,
    features: {
      analytics: true,
      sessions: true,
      logging: true,
      errorHandling: true
    }
  });
  
  // Console output للمطور
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📝 Logs directory: ${path.join(__dirname, 'logs')}`);
  console.log(`📊 Analytics: Enabled with session tracking`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown مع logging
const gracefulShutdown = (signal) => {
  logger.info('Graceful shutdown initiated', { 
    signal,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
  
  console.log(`👋 ${signal} received. Shutting down gracefully...`);
  
  server.close(() => {
    logger.info('HTTP server closed successfully');
    console.log('💀 Process terminated');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout', { signal });
    console.log('⚠️ Forced shutdown after 10 second timeout');
    process.exit(1);
  }, 10000);
};

// Handle different shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;




