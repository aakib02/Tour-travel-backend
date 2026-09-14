import express from "express";

import authMiddleware from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";

import {
  createVehicle,
  getVehicles,
  updateVehicle,
  deleteVehicle,
} from "../../controllers/vehicle/index.js";


const router = express.Router();


// ================================================================
// CREATE VEHICLE
// ================================================================

router.post(
  "/create",
  authMiddleware,
  adminMiddleware,
  createVehicle
);


// ================================================================
// GET ALL / SINGLE VEHICLES
// ================================================================

router.get(
  "/get",
  getVehicles
);


// ================================================================
// UPDATE VEHICLE
// ================================================================

router.put(
  "/update/:id",
  authMiddleware,
  adminMiddleware,
  updateVehicle
);


// ================================================================
// DELETE VEHICLE
// ================================================================

router.delete(
  "/delete/:id",
  authMiddleware,
  adminMiddleware,
  deleteVehicle
);


export default router;