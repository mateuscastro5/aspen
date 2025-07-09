import { FastifyInstance } from 'fastify';
import { exampleHandlers } from '../controllers/example.controller.js';

export const routes = async (fastify: FastifyInstance) => {
  // Health check route
  fastify.get('/health', {
    schema: {
      description: 'Health check endpoint',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    handler: async (request, reply) => {
      return reply.send({
        status: 'ok',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Example CRUD routes
  fastify.get('/examples', exampleHandlers.getAll);
  fastify.get('/examples/:id', exampleHandlers.getById);
  fastify.post('/examples', exampleHandlers.create);
  fastify.put('/examples/:id', exampleHandlers.update);
  fastify.delete('/examples/:id', exampleHandlers.remove);

  // Example route with params
  fastify.get('/hello/:name', {
    schema: {
      description: 'Say hello to a user',
      params: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', description: 'User name' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            hello: { type: 'string' }
          }
        }
      }
    },
    handler: async (request, reply) => {
      const { name } = request.params as { name: string };
      return reply.send({ hello: name });
    }
  });
};