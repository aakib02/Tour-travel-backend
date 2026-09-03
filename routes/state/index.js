import express from "express";

import authMiddleware from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";

import {
  createState,
  getStates,
  updateState,
  deleteState,
} from "../../controllers/state/index.js";

const router = express.Router();

// ============================================================
// STATE ROUTES
// ============================================================

router.post("/create",authMiddleware,adminMiddleware,createState);

router.get(
  "/get",
  authMiddleware,
  adminMiddleware,
  getStates
);

router.put(
  "/update/:id",
  authMiddleware,
  adminMiddleware,
  updateState
);

router.delete(
  "/delete/:id",
  authMiddleware,
  adminMiddleware,
  deleteState
);

export default router;