/**
 * services/authService.js — خدمة المصادقة
 *
 * تتعامل مع كل عمليات المستخدم: تسجيل، دخول، جلب البيانات.
 * الـ token يُحفظ/يُحذف هنا فقط — لا مكان آخر.
 *
 * شكل الـ response من الباك:
 * { success: true, data: { user: {...}, token: "..." } }
 */

import api from './api';

const authService = {
  /**
   * تسجيل مستخدم جديد
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @returns {{ user, token }}
   */
  async register(name, email, password) {
    // api interceptor يُعيد response.data مباشرة
    // أي الشكل: { success, message, data: { user, token } }
    const res = await api.post('/api/auth/register', { name, email, password });
    const { user, token } = res.data;

    // حفظ التوكن — سيُرفق تلقائياً من الآن عبر interceptor
    localStorage.setItem('token', token);

    return user;
  },

  /**
   * تسجيل الدخول
   * @param {string} email
   * @param {string} password
   * @returns {Object} user
   */
  async login(email, password) {
    const res = await api.post('/api/auth/login', { email, password });
    const { user, token } = res.data;

    localStorage.setItem('token', token);

    return user;
  },

  /**
   * جلب بيانات المستخدم الحالي بالتوكن المحفوظ
   * يُستدعى عند بدء التطبيق للتحقق من الجلسة
   * @returns {Object|null} user أو null إذا لا يوجد توكن
   */
  async getMe() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const res = await api.get('/api/auth/me');
      return res.data.user;
    } catch (err) {
      // التوكن منتهي أو غير صالح
      localStorage.removeItem('token');
      return null;
    }
  },

  /**
   * تسجيل الخروج — حذف التوكن فقط (لا يوجد endpoint للخروج)
   */
  logout() {
    localStorage.removeItem('token');
  },
};

export default authService;
