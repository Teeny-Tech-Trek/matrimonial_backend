import { validationResult } from "express-validator";

/**
 * Middleware to handle validation errors from express-validator.
 * If validation errors exist, it sends a 400 response with the errors.
 * Otherwise, it calls the next middleware in the chain.
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};
