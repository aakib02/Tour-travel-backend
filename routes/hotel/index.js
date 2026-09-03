import express from "express";

import authMiddleware from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";

import {
  createHotel,
  getHotels,
  updateHotel,
  deleteHotel,
} from "../../controllers/hotel/index.js";


const router = express.Router();


// CREATE
router.post(
  "/create",
  authMiddleware,
  adminMiddleware,
  createHotel
);


// GET ALL / SINGLE
router.get(
  "/get",
  authMiddleware,
  adminMiddleware,
  getHotels
);


// UPDATE
router.put(
  "/update/:id",
  authMiddleware,
  adminMiddleware,
  updateHotel
);


// DELETE
router.delete(
  "/delete/:id",
  authMiddleware,
  adminMiddleware,
  deleteHotel
);


export default router;