import User from "../models/user/index.js";

import {
  HTTP_STATUS_CODES,RESPONSE_MESSAGES
} from "../helpers/response.js";



import {
  sendError,
} from "../helpers/responseHelper.js";


const adminMiddleware = async (
  req,
  res,
  next
) => {
  try {

    if (!req.user?.id) {
      return sendError(
        res,
        HTTP_STATUS_CODES.UNAUTHORIZED,
        RESPONSE_MESSAGES.AUTH.ACCESS_DENIED
      );
    }


    const admin =
      await User.findOne({
        _id: req.user.id,
        role: "admin",
        isActive: true,
      })
      .select("_id role isActive")
      .lean();


    if (!admin) {
      return sendError(
        res,
        HTTP_STATUS_CODES.FORBIDDEN,
        RESPONSE_MESSAGES.AUTH.ACCESS_DENIED
      );
    }


    req.admin = admin;

    next();

  } catch (error) {

    console.error(
      "Admin middleware error:",
      error
    );

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};

export default adminMiddleware;