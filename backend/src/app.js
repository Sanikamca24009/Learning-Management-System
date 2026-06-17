const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { errorHandler } = require('./middlewares/error.middleware');
const { monitorMiddleware } = require('./middlewares/monitor.middleware');

const app = express();

// Global request latency monitoring
app.use(monitorMiddleware);

// Compress responses
app.use(compression());

// Set security HTTP headers
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Important for serving uploaded images/videos

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 10000, // Higher limit in dev to prevent 429 errors during testing
  message: { success: false, error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
// Apply rate limiter to all API routes
app.use('/api', limiter);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:8081',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/courses.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');
const userRoutes = require('./routes/users.routes');
const adminRoutes = require('./routes/admin.routes');
const profileRoutes = require('./routes/profile.routes');
const uploadRoutes = require('./routes/upload.routes');

// API Version 1 Router
const v1Router = express.Router();
v1Router.use('/auth', authRoutes);
v1Router.use('/courses', courseRoutes);
v1Router.use('/enrollments', enrollmentRoutes);
v1Router.use('/users', userRoutes);
v1Router.use('/admin', adminRoutes);
v1Router.use('/profile', profileRoutes);
v1Router.use('/upload', uploadRoutes);

// Deprecation middleware for legacy routes
const deprecationMiddleware = (req, res, next) => {
  res.setHeader('Deprecation', 'true');
  res.setHeader('Sunset', 'Thu, 31 Dec 2026 23:59:59 GMT');
  res.setHeader('Link', `<${req.protocol}://${req.get('host')}/api/v1${req.path}>; rel="successor-version"`);
  next();
};

// Mount versioned API routes
app.use('/api/v1', v1Router);

// Mount legacy API routes (backward compatible with deprecation headers)
app.use('/api', deprecationMiddleware, v1Router);

// Default Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to LMS Backend API' });
});

// Swagger Documentation UI Mount
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.config');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check route
const healthRoutes = require('./routes/health.routes');
app.use('/healthz', healthRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
