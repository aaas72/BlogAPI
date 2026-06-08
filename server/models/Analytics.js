import mongoose from "mongoose";

// نموذج لتتبع الأحداث العامة
const AnalyticsEventSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
      enum: [
        "page_view", // مشاهدة صفحة
        "post_view", // مشاهدة مقال
        "post_like", // إعجاب بمقال
        "comment_create", // إنشاء تعليق
        "search", // بحث
        "user_register", // تسجيل مستخدم
        "user_login", // تسجيل دخول
      ],
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    resourceType: {
      type: String,
      enum: ["post", "comment", "user", "search", "page"],
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    sessionId: {
      type: String,
      required: true,
    },
    userAgent: String,
    ip: String,
    country: String,
    device: {
      type: String,
      enum: ["desktop", "mobile", "tablet"],
      default: "desktop",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// فهرسة للأداء
AnalyticsEventSchema.index({ event: 1, createdAt: -1 });
AnalyticsEventSchema.index({ resourceId: 1, event: 1 });
AnalyticsEventSchema.index({ userId: 1, createdAt: -1 });
AnalyticsEventSchema.index({ sessionId: 1 });

// نموذج مبسط لإحصائيات يومية (لسرعة الاستعلام)
const DailyStatsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  stats: {
    totalViews: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    postViews: { type: Number, default: 0 },
    newUsers: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },

    // أكثر المقالات مشاهدة
    topPosts: [
      {
        postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
        views: { type: Number, default: 0 },
      },
    ],

    // كلمات البحث الشائعة
    topSearches: [
      {
        query: String,
        count: { type: Number, default: 0 },
      },
    ],
  },
});

export const AnalyticsEvent = mongoose.model(
  "AnalyticsEvent",
  AnalyticsEventSchema
);
export const DailyStats = mongoose.model("DailyStats", DailyStatsSchema);
