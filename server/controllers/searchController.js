import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";

// Advanced search in posts
export const advancedSearch = async (req, res) => {
  try {
    const {
      // Search
      search = "",
      searchIn = "all", // title, content, tags, all

      // Filtering
      author = "",
      authorName = "",
      status = "published",
      tags = "",
      dateFrom = "",
      dateTo = "",
      minViews = 0,
      minLikes = 0,

      // Sorting
      sortBy = "createdAt",
      sortOrder = "desc",

      // Pagination
      page = 1,
      limit = 10,

      // Additional options
      includeStats = "false",
    } = req.query;

    console.log("Advanced search request:", { search, author, status, tags });

    // Build search query
    let searchQuery = {};

    // Filter by status
    if (status !== "all") {
      searchQuery.status = status;
    }

    // Text search
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");

      switch (searchIn) {
        case "title":
          searchQuery.title = searchRegex;
          break;
        case "content":
          searchQuery.content = searchRegex;
          break;
        case "tags":
          searchQuery.tags = { $in: [searchRegex] };
          break;
        case "all":
        default:
          searchQuery.$or = [
            { title: searchRegex },
            { content: searchRegex },
            { tags: { $in: [searchRegex] } },
          ];
      }
    }

    // Filter by author (ID)
    if (author) {
      searchQuery.author = author;
    }

    // Search by author name
    if (authorName && authorName.trim() !== "") {
      const authorUsers = await User.find({
        name: { $regex: authorName.trim(), $options: "i" },
      }).select("_id");

      const authorIds = authorUsers.map((user) => user._id);
      if (authorIds.length > 0) {
        searchQuery.author = { $in: authorIds };
      } else {
        // If no authors found, return empty results
        return res.status(200).json({
          success: true,
          data: {
            posts: [],
            pagination: {
              currentPage: parseInt(page),
              totalPages: 0,
              totalPosts: 0,
              hasNext: false,
              hasPrev: false,
            },
          },
        });
      }
    }

    // Filter by tags
    if (tags && tags.trim() !== "") {
      const tagArray = tags.split(",").map((tag) => tag.trim().toLowerCase());
      searchQuery.tags = { $in: tagArray };
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      searchQuery.createdAt = {};
      if (dateFrom) {
        searchQuery.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        searchQuery.createdAt.$lte = endDate;
      }
    }

    // Filter by minimum views
    if (minViews && parseInt(minViews) > 0) {
      searchQuery.views = { $gte: parseInt(minViews) };
    }

    // Sorting options
    const sortOptions = {};
    switch (sortBy) {
      case "views":
      case "createdAt":
      case "updatedAt":
      case "title":
        sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
        break;
      default:
        sortOptions["createdAt"] = -1;
    }

    // Pagination calculations
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const posts = await Post.find(searchQuery)
      .populate("author", "name email avatar")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v");

    // Count total posts matching criteria
    const totalPosts = await Post.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalPosts / parseInt(limit));

    // Additional statistics
    let stats = null;
    if (includeStats === "true") {
      const statsResult = await Post.aggregate([
        { $match: searchQuery },
        {
          $group: {
            _id: null,
            totalViews: { $sum: "$views" },
            avgViews: { $avg: "$views" },
            totalLikes: { $sum: { $size: "$likes" } },
            avgLikes: { $avg: { $size: "$likes" } },
          },
        },
      ]);

      if (statsResult.length > 0) {
        stats = {
          totalViews: statsResult[0].totalViews,
          avgViews: Math.round(statsResult[0].avgViews * 100) / 100,
          totalLikes: statsResult[0].totalLikes,
          avgLikes: Math.round(statsResult[0].avgLikes * 100) / 100,
        };
      }
    }

    console.log(`Found ${totalPosts} posts matching search criteria`);

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalPosts,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1,
          limit: parseInt(limit),
        },
        searchCriteria: {
          search,
          searchIn,
          author,
          authorName,
          status,
          tags: tags ? tags.split(",").map((t) => t.trim()) : [],
          dateRange: { from: dateFrom, to: dateTo },
          minViews: parseInt(minViews),
          minLikes: parseInt(minLikes),
        },
        sorting: { sortBy, sortOrder },
        stats,
      },
    });
  } catch (error) {
    console.error("Error in advanced search:", error);
    res.status(500).json({
      success: false,
      message: "Error in advanced search",
      error: error.message,
    });
  }
};

// Quick search in titles
export const quickTitleSearch = async (req, res) => {
  try {
    const { q = "", limit = 10 } = req.query;

    if (!q.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const posts = await Post.find({
      title: { $regex: q.trim(), $options: "i" },
      status: "published",
    })
      .select("title createdAt author")
      .populate("author", "name")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: `Found ${posts.length} title matches`,
      data: {
        suggestions: posts,
        count: posts.length,
        searchQuery: q.trim(),
      },
    });
  } catch (error) {
    console.error("Error in title search:", error);
    res.status(500).json({
      success: false,
      message: "Error in title search",
      error: error.message,
    });
  }
};

// Get popular tags
export const getPopularTags = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const tags = await Post.aggregate([
      { $match: { status: "published" } },
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
          posts: { $addToSet: "$_id" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          tag: "$_id",
          count: 1,
          postsCount: { $size: "$posts" },
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: `Found ${tags.length} popular tags`,
      data: {
        tags,
        totalTags: tags.length,
      },
    });
  } catch (error) {
    console.error("Error getting popular tags:", error);
    res.status(500).json({
      success: false,
      message: "Error getting popular tags",
      error: error.message,
    });
  }
};

// General blog statistics
export const getBlogStatistics = async (req, res) => {
    try {
      console.log('Getting blog statistics...');
  
      // Posts statistics - with protection against missing fields
      const postStats = await Post.aggregate([
        {
          $group: {
            _id: null,
            totalPosts: { $sum: 1 },
            publishedPosts: {
              $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
            },
            draftPosts: {
              $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
            },
            totalViews: { $sum: { $ifNull: ['$views', 0] } },
            totalLikes: { 
              $sum: { 
                $size: { 
                  $ifNull: ['$likes', []]
                } 
              } 
            }
          }
        }
      ]);
  
      console.log('Post stats:', postStats);
  
      // Comments statistics - with protection
      const commentStats = await Comment.aggregate([
        {
          $group: {
            _id: null,
            totalComments: { $sum: 1 },
            approvedComments: {
              $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
            },
            pendingComments: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            }
          }
        }
      ]);
  
      console.log('Comment stats:', commentStats);
  
      // Users statistics - with protection
      const userStats = await User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: {
              $sum: { $cond: [{ $ifNull: ['$isActive', true] }, 1, 0] }
            }
          }
        }
      ]);
  
      console.log('User stats:', userStats);
  
      // Top active authors - with protection
      const topAuthors = await Post.aggregate([
        {
          $group: {
            _id: '$author',
            postsCount: { $sum: 1 },
            totalViews: { $sum: { $ifNull: ['$views', 0] } },
            totalLikes: { 
              $sum: { 
                $size: { 
                  $ifNull: ['$likes', []] 
                } 
              } 
            }
          }
        },
        { $sort: { postsCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'authorInfo'
          }
        },
        {
          $project: {
            postsCount: 1,
            totalViews: 1,
            totalLikes: 1,
            authorName: { $arrayElemAt: ['$authorInfo.name', 0] },
            authorEmail: { $arrayElemAt: ['$authorInfo.email', 0] }
          }
        }
      ]);
  
      console.log('Top authors:', topAuthors);
  
      // Tag statistics - new addition
      const tagStats = await Post.aggregate([
        { $match: { status: 'published' } },
        { $unwind: { path: '$tags', preserveNullAndEmptyArrays: true } },
        { $match: { tags: { $ne: null } } },
        {
          $group: {
            _id: '$tags',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $project: {
            tag: '$_id',
            count: 1,
            _id: 0
          }
        }
      ]);
  
      console.log('Tag stats:', tagStats);
  
      // Final aggregation of results
      const result = {
        posts: postStats.length > 0 ? postStats[0] : {
          totalPosts: 0,
          publishedPosts: 0,
          draftPosts: 0,
          totalViews: 0,
          totalLikes: 0
        },
        comments: commentStats.length > 0 ? commentStats[0] : {
          totalComments: 0,
          approvedComments: 0,
          pendingComments: 0
        },
        users: userStats.length > 0 ? userStats[0] : {
          totalUsers: 0,
          activeUsers: 0
        },
        topAuthors: topAuthors || [],
        topTags: tagStats || [],
        summary: {
          totalContent: (postStats[0]?.totalPosts || 0) + (commentStats[0]?.totalComments || 0),
          engagementRate: postStats[0]?.totalPosts > 0 ? 
            Math.round(((postStats[0]?.totalLikes || 0) / postStats[0].totalPosts) * 100) / 100 : 0
        },
        generatedAt: new Date().toISOString()
      };
  
      console.log('Blog statistics generated successfully');
  
      res.status(200).json({
        success: true,
        message: 'Blog statistics retrieved successfully',
        data: result
      });
  
    } catch (error) {
      console.error('Error getting blog statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting blog statistics',
        error: error.message
      });
    }
  };
  
  // ================================
  
  // Simplified version for testing (if error persists)
  export const getSimpleBlogStats = async (req, res) => {
    try {
      console.log('Getting simple blog statistics...');
  
      // Simplified and safer approach
      const totalPosts = await Post.countDocuments();
      const publishedPosts = await Post.countDocuments({ status: 'published' });
      const draftPosts = await Post.countDocuments({ status: 'draft' });
      
      const totalComments = await Comment.countDocuments();
      const approvedComments = await Comment.countDocuments({ status: 'approved' });
      
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isActive: true });
  
      // Safe total views aggregation
      const viewsResult = await Post.aggregate([
        {
          $group: {
            _id: null,
            totalViews: { $sum: { $ifNull: ['$views', 0] } }
          }
        }
      ]);
  
      const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;
  
      const result = {
        posts: {
          totalPosts,
          publishedPosts,
          draftPosts,
          totalViews
        },
        comments: {
          totalComments,
          approvedComments
        },
        users: {
          totalUsers,
          activeUsers
        },
        generatedAt: new Date().toISOString()
      };
  
      console.log('Simple blog statistics generated:', result);
  
      res.status(200).json({
        success: true,
        message: 'Simple blog statistics retrieved successfully',
        data: result
      });
  
    } catch (error) {
      console.error('Error getting simple blog statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting simple blog statistics',
        error: error.message
      });
    }
  };
  

// Search comments
export const searchComments = async (req, res) => {
  try {
    const {
      search = "",
      author = "",
      postId = "",
      status = "approved",
      dateFrom = "",
      dateTo = "",
      page = 1,
      limit = 10,
    } = req.query;

    let searchQuery = {};

    // Search in content
    if (search.trim()) {
      searchQuery.content = { $regex: search.trim(), $options: "i" };
    }

    // Filter by status
    if (status !== "all") {
      searchQuery.status = status;
    }

    // Filter by author
    if (author) {
      searchQuery.author = author;
    }

    // Filter by post
    if (postId) {
      searchQuery.post = postId;
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      searchQuery.createdAt = {};
      if (dateFrom) {
        searchQuery.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        searchQuery.createdAt.$lte = endDate;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const comments = await Comment.find(searchQuery)
      .populate("author", "name email")
      .populate("post", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalComments = await Comment.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      message: `Found ${totalComments} comments matching criteria`,
      data: {
        comments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalComments / parseInt(limit)),
          totalComments,
          hasNext: parseInt(page) < Math.ceil(totalComments / parseInt(limit)),
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error searching comments:", error);
    res.status(500).json({
      success: false,
      message: "Error searching comments",
      error: error.message,
    });
  }
};
