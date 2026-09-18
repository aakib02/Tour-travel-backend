import express from "express";

import authMiddleware from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";

import {
  createHero,
  getHero,
  updateHero,
  deleteHero,
  restoreHero,
} from "../../controllers/hero/index.js";

const router = express.Router();

// ============================================================
// ADMIN AUTH
// ============================================================

router.use(
  authMiddleware,
  adminMiddleware
);

// ============================================================
// CREATE
// ============================================================

router.post(
  "/create",
  createHero
);

// ============================================================
// GET ACTIVE HERO
// ============================================================

router.get(
  "/get",
  getHero
);



// ============================================================
// UPDATE
// ============================================================

router.put(
  "/:id",
  updateHero
);

// ============================================================
// DELETE
// ============================================================

router.delete(
  "/:id",
  deleteHero
);

// ============================================================
// RESTORE
// ============================================================

router.patch(
  "/:id/restore",
  restoreHero
);

export default router;