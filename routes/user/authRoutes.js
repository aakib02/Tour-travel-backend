import express from "express";
import {adminLogin} from "../../controllers/User/authController.js";

const router = express.Router();


// ================================================================
// ADMIN AUTH ROUTES
// ================================================================

router.post("/login",adminLogin);


export default router;