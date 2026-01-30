import jwt from "jsonwebtoken";
import User from "../models/auth.model.js";

export const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      
      if (!token) {
        return res.status(401).json({ 
          success: false,
          message: "No token provided" 
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      
      if (!req.user) {

        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }

      next();
    } catch (err) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid or expired token" 
      });
    }
  } else {
    return res.status(401).json({ 
      success: false,
      message: "No token provided" 
    });
  }
};

// Export both names for compatibility
export const authenticate = protect;