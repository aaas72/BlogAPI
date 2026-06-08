import { ValidationError, ConflictError, DatabaseError } from './AppError.js';

const parseMongooseError = (error) => {
  // Mongoose Validation Error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
    
    return new ValidationError('Validation failed', errors);
  }

  // MongoDB Duplicate Key Error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    const value = error.keyValue[field];
    
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
    return new ConflictError(message);
  }

  // MongoDB Cast Error (Invalid ObjectId)
  if (error.name === 'CastError') {
    return new ValidationError(`Invalid ${error.path}: ${error.value}`);
  }

  // JSON Web Token Errors
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('Invalid token');
  }

  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('Token expired');
  }

  // Default to DatabaseError for unhandled DB errors
  if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    return new DatabaseError('Database operation failed');
  }

  return error;
};

export { parseMongooseError };