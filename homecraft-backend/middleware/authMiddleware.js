import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";
import Admin from "../models/Admin.js";

// Middleware to protect routes for ANY logged-in user (customer or admin)
export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the user from the database based on the token's content
      if (decoded.isAdmin) {
        req.user = await Admin.findById(decoded.id).select("-password");
      } else {
        req.user = await Customer.findById(decoded.id).select("-password");
      }

      if (!req.user) {
        return res.status(401).json({ error: "Not authorized, user not found" });
      }
      next();
    } catch (error) {
      return res.status(401).json({ error: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token" });
  }
};

// Middleware to check if the user is an ADMIN
// This should always be used AFTER the 'protect' middleware in your routes
export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ error: "Access denied. Admin privileges required." });
  }
};
