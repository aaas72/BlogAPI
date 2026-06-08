import { AppError } from '../utils/AppError.js';
import { parseMongooseError } from '../utils/errorParser.js';
import logger from '../config/logger.js';

// Development error response
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      type: err.name,
      message: err.message,
      code: err.errorCode,
      statusCode: err.statusCode,
      details: err.details,
      stack: err.stack,
      timestamp: err.timestamp || new Date().toISOString()
    }
  });
};

// Production error response
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        type: err.name,
        message: err.message,
        code: err.errorCode,
        timestamp: err.timestamp || new Date().toISOString()
      }
    });
  } else {
    // Programming or other unknown error: don't leak error details
    res.status(500).json({
      success: false,
      error: {
        type: 'InternalServerError',
        message: 'Something went wrong on the server',
        code: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      }
    });
  }
};

// Global error handling middleware مع Logger
const globalErrorHandler = (err, req, res, next) => {
  // Set default values
  err.statusCode = err.statusCode || 500;
  const parsedError = parseMongooseError(err);
    logger.logError(parsedError, req, {
    userAgent: req.get('User-Agent'),
    body: req.method !== 'GET' ? req.body : undefined,
    query: req.query,
    params: req.params
  });
  if (parsedError.statusCode >= 500) {
    logger.error('Critical server error detected', {
      error: {
        name: parsedError.name,
        message: parsedError.message,
        stack: parsedError.stack
      },
      request: {
        id: req.id,
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        body: req.body,
        user: req.user?.id
      }
    });
  }
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(parsedError, res);
  } else {
    sendErrorProd(parsedError, res);
  }
};
const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (err, promise) => {
    logger.error('Unhandled Promise Rejection', {
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack
      },
      promise: promise.toString()
    });
    
    console.error('UNHANDLED PROMISE REJECTION - Server shutting down...');
    process.exit(1);
  });
};

// Handle uncaught exceptions
const handleUncaughtException = () => {
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', {
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack
      }
    });
    
    console.error('UNCAUGHT EXCEPTION - Server shutting down...');
    process.exit(1);
  });
};

export { 
  globalErrorHandler, 
  handleUnhandledRejection, 
  handleUncaughtException 
};