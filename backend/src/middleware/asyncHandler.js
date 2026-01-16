/**
 * Wrapper for async route handlers to automatically catch errors
 * Prevents need for try-catch blocks in every async route handler
 * Errors are passed to the error handling middleware
 *
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped route handler that catches errors
 * @example
 * // Instead of:
 * router.get('/route', async (req, res, next) => {
 *   try {
 *     await someAsyncOperation();
 *   } catch (error) {
 *     next(error);
 *   }
 * });
 *
 * // You can write:
 * router.get('/route', asyncHandler(async (req, res) => {
 *   await someAsyncOperation();
 * }));
 */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
