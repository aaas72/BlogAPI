class AppError extends Error {
    constructor(message, statusCode, errorCode = null, details = null) {
      super(message);
      
      this.name = this.constructor.name;
      this.statusCode = statusCode;
      this.errorCode = errorCode;
      this.details = details;
      this.isOperational = true;
      this.timestamp = new Date().toISOString();
      
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  class ValidationError extends AppError {
    constructor(message, details = null) {
      super(message, 422, 'VALIDATION_FAILED', details);
    }
  }
  
  class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
      super(message, 401, 'AUTHENTICATION_REQUIRED');
    }
  }
  
  class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions') {
      super(message, 403, 'INSUFFICIENT_PERMISSIONS');
    }
  }
  
  class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
      super(`${resource} not found`, 404, 'RESOURCE_NOT_FOUND');
    }
  }
  
  class ConflictError extends AppError {
    constructor(message) {
      super(message, 409, 'RESOURCE_CONFLICT');
    }
  }
  
  class DatabaseError extends AppError {
    constructor(message) {
      super(message, 500, 'DATABASE_ERROR');
    }
  }
  
  class FileUploadError extends AppError {
    constructor(message) {
      super(message, 400, 'FILE_UPLOAD_ERROR');
    }
  }
  
  export {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    DatabaseError,
    FileUploadError
  };
  