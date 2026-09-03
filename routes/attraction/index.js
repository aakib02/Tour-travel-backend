import express from "express";

import authMiddleware from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";

import {
  createAttraction,
  getAttractions,
  updateAttraction,
  deleteAttraction,
} from "../../controllers/attraction/index.js";


const router = express.Router();


// ================================================================
// CREATE
// ================================================================

router.post(
  "/create",
  authMiddleware,
  adminMiddleware,
  createAttraction
);


// ================================================================
// GET ALL / SINGLE
// ================================================================

router.get(
  "/get",
  authMiddleware,
  adminMiddleware,
  getAttractions
);


// ================================================================
// UPDATE
// ================================================================

router.put(
  "/update/:id",
  authMiddleware,
  adminMiddleware,
  updateAttraction
);


// ================================================================
// DELETE
// ================================================================

router.delete(
  "/delete/:id",
  authMiddleware,
  adminMiddleware,
  deleteAttraction
);


export default router;