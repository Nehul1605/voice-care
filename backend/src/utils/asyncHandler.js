/**
 * Wrapper for async route handlers.
 * It catches any errors and passes them to the Express error handling middleware,
 * preventing unhandled promise rejections and stopping server crashes.
 */
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};

export { asyncHandler };
