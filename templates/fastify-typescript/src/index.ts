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

const server = Fastify({
  logger: {
    level: config.environment === 'development' ? 'info' : 'warn',
  },
});

// Register plugins
server.register(cors);
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
    await server.listen({ 
      port: config.port,
      host: '0.0.0.0' 
    });
    console.log(`Server is running on http://localhost:${config.port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
