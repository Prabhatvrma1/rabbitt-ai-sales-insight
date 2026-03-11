require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT || '8000', 10),
  
  // Groq AI (Llama 3)
  groqApiKey: process.env.GROQ_API_KEY || '',
  
  // Gmail SMTP
  gmailUser: process.env.GMAIL_USER || '',
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD || '',
  
  // Security
  apiKey: process.env.API_KEY || 'changeme',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map(origin => origin.trim()),
  
  // File upload
  maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
  maxFileSizeBytes: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10) * 1024 * 1024,
};

module.exports = config;
