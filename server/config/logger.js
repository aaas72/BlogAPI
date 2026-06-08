// config/logger.js - نسخة مُصححة

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// تحديد مجلد اللوجز
const logDir = path.join(__dirname, '../logs');

// إنشاء مجلد اللوجز إذا لم يكن موجوداً
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
  console.log(`📁 Created logs directory: ${logDir}`);
}

// تحديد البيئة
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

console.log(`🔧 Logger Environment: ${process.env.NODE_ENV || 'development'}`);

// إعداد التنسيقات (Formatters)
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, service, requestId, userId, method, url, statusCode, responseTime, stack, ...meta }) => {
    const baseLog = {
      timestamp,
      level,
      message,
      service: service || 'simple-blog-api',
      environment: process.env.NODE_ENV || 'development'
    };

    // إضافة معلومات الطلب إذا كانت موجودة
    if (requestId) baseLog.requestId = requestId;
    if (userId) baseLog.userId = userId;
    if (method) baseLog.method = method;
    if (url) baseLog.url = url;
    if (statusCode) baseLog.statusCode = statusCode;
    if (responseTime) baseLog.responseTime = `${responseTime}ms`;

    // إضافة Stack trace للأخطاء
    if (stack && level === 'error') baseLog.stack = stack;

    // إضافة أي metadata إضافي
    if (Object.keys(meta).length > 0) baseLog.meta = meta;

    return JSON.stringify(baseLog);
  })
);

// إعداد Console Format للتطوير
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, requestId, method, url, statusCode, responseTime }) => {
    let logMessage = `${timestamp} ${level}: ${message}`;
    
    if (method && url) {
      logMessage += ` [${method} ${url}]`;
    }
    if (statusCode) {
      logMessage += ` [${statusCode}]`;
    }
    if (responseTime) {
      logMessage += ` [${responseTime}ms]`;
    }
    if (requestId) {
      logMessage += ` [${requestId.substring(0, 8)}...]`;
    }

    return logMessage;
  })
);

// إعداد Transports - الإصلاح هنا!
const transports = [];

// Console Transport - دائماً في التطوير
console.log(`📊 Setting up Console transport...`);
transports.push(
  new winston.transports.Console({
    format: consoleFormat,
    level: isDevelopment ? 'debug' : 'info'
  })
);

// File Transports - تبسيط للتأكد من العمل
console.log(`📝 Setting up File transports...`);

try {
  // Combined logs (جميع المستويات) - مبسط
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      level: 'info',
      format: logFormat,
      maxsize: 5000000, // 5MB
      maxFiles: 5
    })
  );

  // Error logs (الأخطاء فقط) - مبسط
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 5000000, // 5MB
      maxFiles: 5
    })
  );

  console.log(` File transports created successfully`);

} catch (error) {
  console.error(' Error setting up file transports:', error.message);
  console.log(' Will use console logging only');
}

console.log(` Total transports: ${transports.length}`);

// إنشاء Logger
const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: logFormat,
  defaultMeta: {
    service: 'simple-blog-api',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports,
  // تعطيل معالجات الاستثناءات مؤقتاً للتبسيط
  exitOnError: false
});

// تأكد من وجود transports
if (logger.transports.length === 0) {
  console.error(' No transports configured for Winston!');
  // إضافة console transport كـ fallback
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'info'
  }));
  console.log(' Added fallback console transport');
}

// اختبار Logger
console.log(' Testing logger...');
logger.info('Logger test successful');

// إضافة helper methods
logger.logError = (error, req = null, additionalData = {}) => {
  const errorLog = {
    message: error.message,
    name: error.name,
    statusCode: error.statusCode,
    errorCode: error.errorCode,
    stack: error.stack,
    ...additionalData
  };

  if (req) {
    errorLog.requestId = req.id;
    errorLog.method = req.method;
    errorLog.url = req.originalUrl;
    errorLog.userAgent = req.get('User-Agent');
    errorLog.ip = req.ip;
    errorLog.userId = req.user?.id;
  }

  logger.error(errorLog);
};

logger.logRequest = (req, res, responseTime) => {
  const requestLog = {
    message: `HTTP ${req.method} ${req.originalUrl}`,
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id || 'anonymous'
  };

  // تحديد مستوى اللوج حسب status code
  if (res.statusCode >= 500) {
    logger.error(requestLog);
  } else if (res.statusCode >= 400) {
    logger.warn(requestLog);
  } else {
    logger.info(requestLog);
  }
};

// Log startup information
logger.info('Logger initialized successfully', {
  environment: process.env.NODE_ENV,
  logLevel: logger.level,
  logDirectory: logDir,
  transportsCount: logger.transports.length
});

console.log(' Logger setup completed');

export default logger;