// src/config/swagger.ts
import type { Express } from 'express'
import swaggerUi from 'swagger-ui-express'

// Documentación Swagger en formato JSON
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Backend API',
    version: '1.0.0',
    description: 'API Documentation',
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Development server',
    },
  ],
  paths: {
    '/api/users': {
      get: {
        summary: 'Get all users',
        responses: {
          '200': {
            description: 'List of users',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      email: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
}

// Configuración de Swagger UI
const swaggerOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Documentation',
}

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions))
}
