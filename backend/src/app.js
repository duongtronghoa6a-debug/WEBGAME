require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const routes = require('./routes');
const swaggerSpecs = require('./config/swagger');
const apiKeyAuth = require('./middleware/apiKey');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Board Game API is running',
        timestamp: new Date().toISOString()
    });
});

// API Documentation (protected with API key)
app.use('/api-docs', apiKeyAuth, swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Board Game API Documentation'
}));

// API Routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.url} not found`
        }
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    res.status(err.status || 500).json({
        success: false,
        error: {
            code: err.code || 'SERVER_ERROR',
            message: process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : err.message
        }
    });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
  ╔════════════════════════════════════════════════════╗
  ║                                                    ║
  ║   🎮 Board Game API Server                         ║
  ║                                                    ║
  ║   Server running on port ${PORT}                      ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}                     ║
  ║                                                    ║
  ║   Endpoints:                                       ║
  ║   - API:  http://localhost:${PORT}/api               ║
  ║   - Docs: http://localhost:${PORT}/api-docs          ║
  ║                                                    ║
  ╚════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
