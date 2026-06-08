import expressWinston from 'express-winston';
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger.js';

// Request ID middleware
export const requestId = (req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
};

// Request timing middleware
export const requestTiming = (req, res, next) => {
  req.startTime = Date.now();
  
  // Override res.end to calculate response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - req.startTime;
    
    // Log the request
    logger.logRequest(req, res, responseTime);
    
    originalEnd.apply(this, args);
  };
  
  next();
};

// Express-Winston logger for detailed HTTP logging (optional)
export const detailedRequestLogger = expressWinston.logger({
  winstonInstance: logger,
  level: 'info',
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
  expressFormat: false,
  colorize: false,
  skip: (req, res) => {
    // تخطي الطلبات الثابتة وHealth checks
    return req.url.startsWith('/uploads') || 
           req.url === '/health' || 
           req.url === '/favicon.ico';
  }
});

// Express-Winston error logger
export const errorLogger = expressWinston.errorLogger({
  winstonInstance: logger,
  level: 'error',
  meta: true,
  msg: 'HTTP Error {{req.method}} {{req.url}} {{res.statusCode}}',
  skip: (req, res) => {
    // تسجيل الأخطاء الخطيرة فقط (500+)
    return res.statusCode < 500;
  }
});