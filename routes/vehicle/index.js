import express from "express";

import authMiddleware from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";
import upload from "../../middleware/uploadMiddleware.js";

import {
  createVehicle,
  getVehicles,
  updateVehicle,
  deleteVehicle,
} from "../../controllers/vehicle/index.js";

import {
  downloadVehicleTemplate,
  bulkUploadVehiclesFromExcel,
} from "../../controllers/vehicle/excelUpload.js";


const router = express.Router();


// ================================================================
// EXCEL / CSV TEMPLATE & BULK UPLOAD
// ================================================================

router.get(
  "/template/excel",
  downloadVehicleTemplate
);

router.get(
  "/template",
  downloadVehicleTemplate
);

router.post(
  "/bulk-upload",
  authMiddleware,
  adminMiddleware,
  upload.single("file"),
  bulkUploadVehiclesFromExcel
);


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

router.get(
  "/get/:id",
  (req, res, next) => {
    req.query.id = req.params.id;
    next();
  },
  getVehicles
);

router.get(
  "/:id",
  (req, res, next) => {
    req.query.id = req.params.id;
    next();
  },
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