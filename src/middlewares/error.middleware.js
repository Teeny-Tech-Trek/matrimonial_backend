/**
 * Middleware to handle requests for routes that do not exist.
 * It creates a 404 Not Found error and passes it to the next error-handling middleware.
 */
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

/**
 * Centralized error handling middleware.
 * This catches all errors passed via `next(error)` and sends a structured JSON response.
 * It determines the status code, defaulting to 500 for internal server errors.
 * In development, it also includes the error stack trace for easier debugging.
 */
const errorHandler = (err, req, res, next) => {
    // Sometimes an error comes in with a 200 status code, we want to default to 500 if that's the case
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        success: false,
        message: err.message,
        // Include stack trace only in development environment
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

export { notFound, errorHandler };
