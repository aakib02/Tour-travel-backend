import express from "express";
import { getDashboardStats } from "../../controllers/dashboard/index.js";

const router = express.Router();

// ================================================================
// DASHBOARD ROUTES
// Accessible to dashboard consumers (admin panel)
// ================================================================

router.get("/stats", getDashboardStats);
router.get("/", getDashboardStats);

export default router;
