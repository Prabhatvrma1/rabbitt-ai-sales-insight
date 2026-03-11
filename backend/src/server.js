const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const config = require('./config');
const swaggerSpec = require('./swagger');
const healthRoutes = require('./routes/health');
const uploadRoutes = require('./routes/upload');

const app = express();

// ---- Security Middleware ----

// Helmet: Security headers (XSS, nosniff, frameguard, etc.)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS: Only allow configured origins
app.use(cors({
  origin: config.allowedOrigins,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-API-Key'],
  credentials: true,
}));

// Rate limiting: 10 requests per minute per IP on /api/upload
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    detail: 'Too many requests. Please try again after a minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Body parser for JSON (for non-file routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Swagger Documentation ----
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: `
    .swagger-ui .topbar { background: linear-gradient(135deg, #6C63FF, #3B82F6); }
    .swagger-ui .topbar .download-url-wrapper .select-label { color: #fff; }
  `,
  customSiteTitle: 'Sales Insight Automator — API Docs',
}));

// Serve swagger JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(swaggerSpec);
});

// ---- Routes ----
app.use('/api', healthRoutes);
app.use('/api', uploadLimiter, uploadRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    service: 'Sales Insight Automator API',
    version: '1.0.0',
    docs: '/docs',
    health: '/api/health',
  });
});

// ---- Global Error Handler ----
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    detail: 'An unexpected error occurred. Please try again later.',
  });
});

// ---- Start Server ----
app.listen(config.port, () => {
  console.log(`\n🐇 Sales Insight Automator API`);
  console.log(`   Server running on http://localhost:${config.port}`);
  console.log(`   Swagger docs at http://localhost:${config.port}/docs`);
  console.log(`   Health check at http://localhost:${config.port}/api/health\n`);
});

module.exports = app;
