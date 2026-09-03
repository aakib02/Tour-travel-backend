import express from "express";

import authMiddleware from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";

import {
  createActivity,
  getActivities,
  updateActivity,
  deleteActivity,
} from "../../controllers/activity/index.js";


const router = express.Router();


// ================================================================
// CREATE
// ================================================================

router.post(
  "/create",
  authMiddleware,
  adminMiddleware,
  createActivity
);


// ================================================================
// GET ALL / SINGLE
// ================================================================

router.get(
  "/get",
  authMiddleware,
  adminMiddleware,
  getActivities
);


// ================================================================
// UPDATE
// ================================================================

router.put(
  "/update/:id",
  authMiddleware,
  adminMiddleware,
  updateActivity
);


// ================================================================
// DELETE
// ================================================================

router.delete(
  "/delete/:id",
  authMiddleware,
  adminMiddleware,
  deleteActivity
);


export default router;