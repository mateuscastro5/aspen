// dotenv for environment variables
import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { config } from './config/index.js';
import { routes } from './routes/index.js';
import { errorHandler } from './middlewares/error.handler.js';
import { corsPlugin, loggingPlugin } from './plugins/index.js';
import { DatabaseUtils } from './utils/helpers.js';

const server = Fastify({
  logger: {
    level: config.environment === 'development' ? 'info' : 'warn',
  },
});

// Register custom plugins
server.register(corsPlugin);
server.register(loggingPlugin);

// Register plugins
server.register(helmet);

// Register Swagger
server.register(swagger, {
  openapi: {
    info: {
      title: 'Fastify API',
      description: 'API documentation using Swagger',
      version: '1.0.0',
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
    ],
  },
});

server.register(swaggerUI, {
  routePrefix: '/docs',
});

// Register error handler
server.setErrorHandler(errorHandler);

// Register routes
server.register(routes);

// Start the server
const start = async () => {
  try {
    // Initialize database connection
    await DatabaseUtils.connect();
    
    await server.listen({ 
      port: config.port,
      host: '0.0.0.0' 
    });
    console.log(`🚀 Server is running on http://localhost:${config.port}`);
    console.log(`📚 Swagger documentation available at http://localhost:${config.port}/documentation`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await DatabaseUtils.disconnect();
    await server.close();
    console.log('👋 Server closed gracefully');
    process.exit(0);
  } catch (err) {
    console.error('Error during graceful shutdown:', err);
    process.exit(1);
  }
});

start();
