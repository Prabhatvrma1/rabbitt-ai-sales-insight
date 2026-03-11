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

// CORS: Allow configured origins (supports * wildcard for open access)
const allowedOrigins = config.allowedOrigins;
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Swagger)
    if (!origin) return callback(null, true);
    // Allow all if wildcard is configured
    if (allowedOrigins.includes('*')) return callback(null, true);
    // Otherwise check whitelist
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-API-Key'],
  credentials: false,
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
const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sales Insight Automator — API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.0.0/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fafafa; font-family: sans-serif; }
    .swagger-ui .topbar { background: linear-gradient(135deg, #6C63FF, #3B82F6); }
    .swagger-ui .topbar .download-url-wrapper .select-label { color: #fff; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.0.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.0.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api-docs.json',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "StandaloneLayout",
      });
    };
  </script>
</body>
</html>
`;

app.get('/docs', (req, res) => {
  res.send(swaggerHtml);
});

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
if (process.env.NODE_ENV !== 'production') {
  app.listen(config.port, () => {
    console.log(`\n🐇 Sales Insight Automator API`);
    console.log(`   Server running on http://localhost:${config.port}`);
    console.log(`   Swagger docs at http://localhost:${config.port}/docs`);
    console.log(`   Health check at http://localhost:${config.port}/api/health\n`);
  });
}

module.exports = app;
