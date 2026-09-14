import express from "express";

import authMiddleware from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";

import {
  createCity,
  getCities,
  updateCity,
  deleteCity,
} from "../../controllers/city/index.js";


const router = express.Router();


// ================================================================
// CREATE CITY
// ================================================================

router.post(
  "/create",
  authMiddleware,
  adminMiddleware,
  createCity
);


// ================================================================
// GET CITIES / SINGLE CITY
// ================================================================

router.get(
  "/get",
  getCities
);


// ================================================================
// UPDATE CITY
// ================================================================

router.put(
  "/update/:id",
  authMiddleware,
  adminMiddleware,
  updateCity
);


// ================================================================
// DELETE CITY
// ================================================================

router.delete(
  "/delete/:id",
  authMiddleware,
  adminMiddleware,
  deleteCity
);


export default router;