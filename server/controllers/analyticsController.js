import { AnalyticsEvent, DailyStats } from "../models/Analytics.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const [totalViews, uniqueVisitors, postViews, totalUsers, recentEvents] =
    await Promise.all([
      AnalyticsEvent.countDocuments({
        event: "page_view",
        createdAt: { $gte: startDate },
      }),
      AnalyticsEvent.distinct("sessionId", {
        event: "page_view",
        createdAt: { $gte: startDate },
      }),
      AnalyticsEvent.countDocuments({
        event: "post_view",
        createdAt: { $gte: startDate },
      }),
      User.countDocuments(),

      // أحدث الأحداث
      AnalyticsEvent.find({ createdAt: { $gte: startDate } })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("resourceId")
        .populate("userId", "name email"),
    ]);

  // أكثر المقالات مشاهدة
  const topPosts = await AnalyticsEvent.aggregate([
    {
      $match: {
        event: "post_view",
        resourceId: { $ne: null },
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$resourceId",
        views: { $sum: 1 },
      },
    },
    { $sort: { views: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "_id",
        as: "post",
      },
    },
    {
      $project: {
        post: { $arrayElemAt: ["$post", 0] },
        views: 1,
      },
    },
  ]);

  const dailyStats = await AnalyticsEvent.aggregate([
    {
      $match: {
        event: "page_view",
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        views: { $sum: 1 },
        uniqueVisitors: { $addToSet: "$sessionId" },
      },
    },
    {
      $project: {
        date: "$_id",
        views: 1,
        uniqueVisitors: { $size: "$uniqueVisitors" },
      },
    },
    { $sort: { date: 1 } },
  ]);

  // إحصائيات الأجهزة
  const deviceStats = await AnalyticsEvent.aggregate([
    {
      $match: {
        event: "page_view",
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$device",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalViews,
        uniqueVisitors: uniqueVisitors.length,
        postViews,
        totalUsers,
        period: `${days} days`,
      },
      topPosts,
      dailyStats,
      deviceStats,
      recentActivity: recentEvents,
    },
  });
});

// إحصائيات مقال محدد
export const getPostAnalytics = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { days = 30 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  // التحقق من وجود المقال
  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Post not found",
    });
  }

  // إحصائيات المقال
  const [totalViews, uniqueViewers, likes, comments, dailyViews] =
    await Promise.all([
      // إجمالي المشاهدات
      AnalyticsEvent.countDocuments({
        event: "post_view",
        resourceId: postId,
        createdAt: { $gte: startDate },
      }),

      // المشاهدين الفريدين
      AnalyticsEvent.distinct("sessionId", {
        event: "post_view",
        resourceId: postId,
        createdAt: { $gte: startDate },
      }),

      // الإعجابات
      AnalyticsEvent.countDocuments({
        event: "post_like",
        resourceId: postId,
        createdAt: { $gte: startDate },
      }),

      // التعليقات
      AnalyticsEvent.countDocuments({
        event: "comment_create",
        metadata: { postId: postId.toString() },
        createdAt: { $gte: startDate },
      }),

      // المشاهدات اليومية
      AnalyticsEvent.aggregate([
        {
          $match: {
            event: "post_view",
            resourceId: new mongoose.Types.ObjectId(postId),
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            views: { $sum: 1 },
          },
        },
        {
          $project: {
            date: "$_id",
            views: 1,
          },
        },
        { $sort: { date: 1 } },
      ]),
    ]);

  res.status(200).json({
    success: true,
    data: {
      post: {
        id: post._id,
        title: post.title,
      },
      analytics: {
        totalViews,
        uniqueViewers: uniqueViewers.length,
        likes,
        comments,
        engagementRate:
          totalViews > 0
            ? (((likes + comments) / totalViews) * 100).toFixed(2)
            : 0,
      },
      dailyViews,
    },
  });
});

export const trackCustomEvent = asyncHandler(async (req, res) => {
  const { event, resourceId, resourceType, metadata = {} } = req.body;
  if (!event) {
    return res.status(400).json({
      success: false,
      message: "Event type is required",
    });
  }
  const sessionId = req.session?.id || generateSessionId(req);
  const eventData = {
    event,
    resourceId: resourceId || null,
    resourceType: resourceType || null,
    sessionId,
    userId: req.user?.id || null,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    device: getDeviceType(req.get("User-Agent")),
    metadata,
  };
  await trackEvent(eventData);
  res.status(200).json({
    success: true,
    message: "Event tracked successfully",
  });
});

export const getSearchAnalytics = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  const topSearches = await AnalyticsEvent.aggregate([
    {
      $match: {
        event: "search",
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$metadata.query",
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: "$sessionId" },
      },
    },
    {
      $project: {
        query: "$_id",
        searchCount: "$count",
        uniqueSearchers: { $size: "$uniqueUsers" },
      },
    },
    { $sort: { searchCount: -1 } },
    { $limit: 10 },
  ]);

  // إجمالي عمليات البحث
  const totalSearches = await AnalyticsEvent.countDocuments({
    event: "search",
    createdAt: { $gte: startDate },
  });

  res.status(200).json({
    success: true,
    data: {
      totalSearches,
      topSearches,
      period: `${days} days`,
    },
  });
});
