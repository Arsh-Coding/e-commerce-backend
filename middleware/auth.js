const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { getDb } = require("../config/database");

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "fad09e92a5e7cd3f29d78f4e11f79e52f27551bfd4a7e6eb9a8f6c74f270ab3e";

// Helper: Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Helper: Extract token from request
const extractToken = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  return req.cookies?.token || null;
};

// Middleware: Authentication (Protect Routes)
const isAuthenticated = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    const db = getDb();
    const user = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(decoded.userId) },
        { projection: { password: 0 } }
      );

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // Attach user to request object
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Middleware: Admin Authorization
const isAdmin = async (req, res, next) => {
  try {
    const db = getDb();
    const user = req.user;

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (error) {
    console.error("Admin authorization error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Middleware: Attach User (Optional Auth)
const attachUser = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const db = getDb();
        const user = await db
          .collection("users")
          .findOne(
            { _id: new ObjectId(decoded.userId) },
            { projection: { password: 0 } }
          );
        if (user) {
          req.user = user;
          res.locals.user = user; // Attach user to templates
        }
      }
    }
    next();
  } catch (error) {
    console.error("Attach user error:", error);
    next(error);
  }
};

// Middleware: Guest Only (Redirect Authenticated Users)
const guestOnly = (req, res, next) => {
  const token = extractToken(req);
  if (token && verifyToken(token)) {
    return res.redirect("/");
  }
  next();
};

// Middleware: Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
};

// Middleware: Refresh Token
const refreshToken = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return next();

    const decoded = verifyToken(token);
    if (!decoded) return next();

    const tokenExp = decoded.exp * 1000;
    const fiveMinutes = 5 * 60 * 1000;

    if (tokenExp - Date.now() < fiveMinutes) {
      const newToken = generateToken(decoded.userId);
      res.cookie("token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }
    next();
  } catch (error) {
    console.error("Token refresh error:", error);
    next();
  }
};

module.exports = {
  isAuthenticated,
  isAdmin,
  attachUser,
  guestOnly,
  generateToken,
  refreshToken,
};
