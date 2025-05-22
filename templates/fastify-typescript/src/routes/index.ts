import { FastifyInstance } from 'fastify';

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
