import express from "express";
import {
  advancedSearch,
  quickTitleSearch,
  getPopularTags,
  getBlogStatistics,
  searchComments,
} from "../controllers/searchController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();


// Public routes (no authentication required)
router.get("/posts", advancedSearch); // Advanced post search
router.get("/titles", quickTitleSearch); // Quick title search
router.get("/tags", getPopularTags); // Popular tags

// Protected routes (authentication required)
router.get("/stats", protect, getBlogStatistics); // Blog statistics
router.get("/comments", protect, searchComments); // Comment search


export default router;
