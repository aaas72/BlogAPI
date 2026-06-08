import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { 
  ValidationError, 
  AuthenticationError, 
  ConflictError 
} from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

// إنشاء token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// تسجيل مستخدم جديد
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // التحقق من وجود البيانات المطلوبة
  if (!name || !email || !password) {
    throw new ValidationError('Name, email and password are required');
  }

  // التحقق من طول كلمة المرور
  if (password.length < 6) {
    throw new ValidationError('Password must be at least 6 characters long');
  }

  // التحقق من وجود المستخدم مسبقاً
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // إنشاء المستخدم
  const user = await User.create({ name, email, password });

  // إنشاء token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }
  });
});

// تسجيل الدخول
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // التحقق من وجود البيانات
  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  // البحث عن المستخدم (مع كلمة المرور هذه المرة)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // التحقق من كلمة المرور
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new AuthenticationError('Invalid email or password');
  }

  // التحقق من نشاط الحساب
  if (!user.isActive) {
    throw new AuthenticationError('Account is deactivated');
  }

  // إنشاء token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }
  });
});

// الحصول على بيانات المستخدم الحالي
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: { user }
  });
});

// تحديث بيانات المستخدم
export const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim().length < 2) {
    throw new ValidationError('Name must be at least 2 characters long');
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name: name.trim() },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
});