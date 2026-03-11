const config = require('../config');

/**
 * API Key validation middleware.
 * If X-API-Key header is provided, it must match the configured API key.
 * The key is optional — this allows browser-based usage without a key.
 */
function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  // If API key is provided, validate it
  if (apiKey && apiKey !== config.apiKey) {
    return res.status(403).json({
      success: false,
      detail: 'Invalid API key.',
    });
  }

  next();
}

module.exports = { validateApiKey };
