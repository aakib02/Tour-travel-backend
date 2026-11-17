import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization") || req.header("authorization");
  let token = null;

  if (authHeader) {
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    } else if (!authHeader.includes(" ")) {
      token = authHeader.trim();
    } else {
      token = authHeader.split(/\s+/)[1]?.trim();
    }
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      error: "Access Denied, No Token Provided",
      message: "Access Denied, No Token Provided",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or Expired Token",
      message: "Invalid or Expired Token",
    });
  }
};

export default authMiddleware;
