import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../../models/user/index.js";
import {HTTP_STATUS_CODES,RESPONSE_MESSAGES} from "../../helpers/response.js";
import {sendResponse,sendError} from "../../helpers/responseHelper.js";


// ================================================================
// ADMIN LOGIN
// ================================================================

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;


    // ============================================================
    // BASIC VALIDATION
    // ============================================================

    if (!email) {return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        RESPONSE_MESSAGES.VALIDATION.EMAIL_REQUIRED
      );
    }

    if (!password) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        RESPONSE_MESSAGES.VALIDATION.PASSWORD_REQUIRED
      );
    }


    // ============================================================
    // NORMALIZE EMAIL
    // ============================================================

    const normalizedEmail = email.trim().toLowerCase();


    // ============================================================
    // EMAIL FORMAT VALIDATION
    // ============================================================

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        RESPONSE_MESSAGES.VALIDATION.INVALID_EMAIL
      );
    }


    // ============================================================
    // FIND ADMIN
    // ============================================================

    const admin = await User.findOne({
      email: normalizedEmail,
      role: "admin",
      isActive: true,
    }).select(
      "+password"
    );


    // ============================================================
    // INVALID CREDENTIALS
    // ============================================================

    if (!admin) {
      return sendError(
        res,
        HTTP_STATUS_CODES.UNAUTHORIZED,
        RESPONSE_MESSAGES.AUTH.INVALID_CREDENTIALS
      );
    }


    // ============================================================
    // PASSWORD VERIFICATION
    // ============================================================

    const isPasswordValid =
      await bcrypt.compare(
        password,
        admin.password
      );

    if (!isPasswordValid) {
      return sendError(
        res,
        HTTP_STATUS_CODES.UNAUTHORIZED,
        RESPONSE_MESSAGES.AUTH.INVALID_CREDENTIALS
      );
    }


    // ============================================================
    // JWT SECRET VALIDATION
    // ============================================================

    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET is not configured"
      );

      return sendError(
        res,
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
      );
    }


    // ============================================================
    // JWT PAYLOAD
    // ============================================================

    const payload = {
      id: admin._id.toString(),
      role: admin.role,
    };


    // ============================================================
    // CREATE ACCESS TOKEN
    // ============================================================

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn:
          process.env.JWT_EXPIRES_IN || "1d",
      }
    );


    // ============================================================
    // SAFE ADMIN RESPONSE
    // ============================================================

    const adminData = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      avatar: admin.avatar || null,
    };


    // ============================================================
    // SUCCESS RESPONSE
    // ============================================================

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.AUTH.LOGIN_SUCCESS,
      {
        admin: adminData,
        token,
      }
    );

  } catch (error) {

    console.error(
      "Admin login error:",
      error
    );

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};