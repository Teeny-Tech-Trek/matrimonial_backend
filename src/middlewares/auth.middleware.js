import jwt from "jsonwebtoken";
import User from "../models/auth.model.js";

export const protect = async (req, res, next) => {
  let token;

  console.log("🔐 Auth middleware - Route:", req.method, req.originalUrl);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      
      if (!token) {
        console.log("❌ Empty token");
        return res.status(401).json({ 
          success: false,
          message: "No token provided" 
        });
      }

      console.log("🔍 Verifying token...");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token verified for user:", decoded.id);

      req.user = await User.findById(decoded.id).select("-password");
      
      if (!req.user) {
        console.log("❌ User not found");
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }

      console.log("✅ User authenticated:", req.user._id);
      next();
    } catch (err) {
      console.log("❌ Auth error:", err.message);
      return res.status(401).json({ 
        success: false,
        message: "Invalid or expired token" 
      });
    }
  } else {
    console.log("❌ No authorization header");
    return res.status(401).json({ 
      success: false,
      message: "No token provided" 
    });
  }
};

// Export both names for compatibility
export const authenticate = protect;