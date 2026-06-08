import express from "express";
import {
  getDashboardAnalytics,
  getPostAnalytics,
  trackCustomEvent,
  getSearchAnalytics,
} from "../controllers/analyticsController.js";
import { protect, authorize } from "../middleware/auth.js";
import { trackEvent } from "../middleware/analytics.js";

const router = express.Router();

console.log("📊 Loading analytics routes...");

// تسجيل أحداث مخصصة (عام)
router.post("/track", trackCustomEvent);

// مسارات محمية للإدارة
router.use(protect);

// إحصائيات لوحة التحكم
router.get("/dashboard", authorize("admin"), getDashboardAnalytics);

// إحصائيات مقال محدد
router.get("/post/:postId", getPostAnalytics);

// إحصائيات البحث
router.get("/search", authorize("admin"), getSearchAnalytics);

console.log("✅ Analytics routes loaded successfully");

export default router;
