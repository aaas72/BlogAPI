/**
 * services/api.js — ملف القواعد المركزي
 *
 * كل طلب HTTP في التطبيق يمر من هنا.
 * أي قاعدة تُضيفها هنا تنطبق تلقائياً على كل service.
 */

import axios from 'axios';

// ── إنشاء الـ instance ───────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10_000, // 10 ثوانٍ كحد أقصى لكل طلب
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ──────────────────────────────────────────────────────
// يُنفَّذ قبل إرسال أي طلب — يُرفق JWT تلقائياً إن وُجد
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────────────────────────────────────
// يُنفَّذ عند وصول كل رد من الباك
api.interceptors.response.use(
  // نجاح: أعِد data مباشرة بدون التغليف (res.data.data بدلاً من res.data)
  (response) => response.data,

  // فشل: حوّل الخطأ لشكل موحد ثم ارفضه
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message || 
                    error.response?.data?.error?.message || 
                    error.message || 
                    'Network Error';

    // 401 — انتهت الجلسة أو التوكن غير صالح
    if (status === 401) {
      localStorage.removeItem('token');
      // نُصدر حدث مخصص يستمع له AppContext لتسجيل الخروج
      window.dispatchEvent(new Event('auth:logout'));
    }

    // أعد كائن خطأ موحد لكل service
    return Promise.reject({
      status,
      message,
      raw: error.response?.data,
    });
  }
);

export default api;
