const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UptoSkills LMS API Documentation',
      version: '1.0.0',
      description: 'Interactive API documentation for the Learning Management System (LMS) Backend.',
      contact: {
        name: 'Optimization Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'V1 API Server (Development)',
      },
      {
        url: 'http://localhost:5000/api',
        description: 'Legacy API Server (Deprecated)',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token. Format: Bearer <token>',
        },
      },
    },
  },
  apis: [path.join(__dirname, '../routes/*.routes.js')], // Scan route files for JSDoc annotations
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
