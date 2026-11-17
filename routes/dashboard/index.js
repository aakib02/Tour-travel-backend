import express from "express";
import authMiddleware from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";
import { getDashboardStats } from "../../controllers/dashboard/index.js";

const router = express.Router();

// ================================================================
// DASHBOARD ROUTES (Protected: Admin Only)
// ================================================================

router.use(authMiddleware, adminMiddleware);

router.get("/stats", getDashboardStats);
router.get("/", getDashboardStats);

export default router;

