import { AnalyticsEvent } from "../models/Analytics.js";
import crypto from "crypto";
import logger from "../config/logger.js";

// دالة لإنشاء Session ID
const generateSessionId = (req) => {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get("User-Agent") || "";
  const base = `${ip}-${userAgent}-${Date.now()}`;
  return crypto.createHash("md5").update(base).digest("hex");
};

// دالة لتحديد نوع الجهاز
const getDeviceType = (userAgent) => {
  if (!userAgent) return "desktop";

  const mobileRegex =
    /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const tabletRegex = /iPad|Android(?=.*Tablet)|Tablet/i;

  if (tabletRegex.test(userAgent)) return "tablet";
  if (mobileRegex.test(userAgent)) return "mobile";
  return "desktop";
};

// Middleware لتتبع مشاهدات الصفحات
export const trackPageView = (req, res, next) => {
  // تخطي الملفات الثابتة وHealth checks
  if (
    req.url.startsWith("/uploads") ||
    req.url === "/health" ||
    req.url === "/favicon.ico" ||
    req.url.startsWith("/api/analytics")
  ) {
    return next();
  }

  // إنشاء Session ID إذا لم يكن موجوداً
  if (!req.session?.id) {
    if (!req.session) req.session = {};
    req.session.id = generateSessionId(req);
  }

  // تسجيل مشاهدة الصفحة
  setImmediate(async () => {
    try {
      await AnalyticsEvent.create({
        event: "page_view",
        sessionId: req.session.id,
        userId: req.user?.id || null,
        userAgent: req.get("User-Agent"),
        ip: req.ip,
        device: getDeviceType(req.get("User-Agent")),
        metadata: {
          path: req.originalUrl,
          method: req.method,
          referer: req.get("Referer"),
        },
      });
    } catch (error) {
      logger.error("Analytics tracking error", { error: error.message });
    }
  });

  next();
};

// دالة مساعدة لتسجيل أحداث مخصصة
export const trackEvent = async (eventData) => {
  try {
    await AnalyticsEvent.create(eventData);
    logger.debug("Analytics event tracked", { event: eventData.event });
  } catch (error) {
    logger.error("Analytics event tracking failed", {
      event: eventData.event,
      error: error.message,
    });
  }
};
