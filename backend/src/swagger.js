const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sales Insight Automator API',
      version: '1.0.0',
      description: `🐇 **Rabbitt AI — Sales Insight Automator**

Upload your sales data (CSV/XLSX) and receive an AI-generated executive summary delivered straight to your inbox.

### Features
- 📊 Parses CSV and XLSX sales data files
- 🤖 Generates professional summaries using Google Gemini AI
- 📧 Delivers formatted reports via email
- 🔒 Secured with API key authentication and rate limiting

### Authentication
Include \`X-API-Key\` header for programmatic access (optional for browser use).`,
      contact: {
        name: 'Rabbitt AI Engineering',
        url: 'https://github.com/rabbitt-ai',
      },
      license: {
        name: 'MIT',
      },
    },
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'Optional API key for programmatic access',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
