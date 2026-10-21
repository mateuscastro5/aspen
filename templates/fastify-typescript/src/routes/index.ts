import type { FastifyInstance } from 'fastify';
import { exampleService } from '../services/example.service.js';

export const routes = async (app: FastifyInstance) => {
  app.get('/health', async () => ({ status: 'ok' }));

  app.get('/examples', async () => exampleService.list());

  app.post<{ Body: { name: string } }>(
    '/examples',
    {
      schema: {
        body: {
          type: 'object',
          required: ['name'],
          properties: { name: { type: 'string', minLength: 1 } },
        },
      },
    },
    async (request, reply) => {
      reply.code(201);
      return exampleService.create(request.body.name.trim());
    }
  );
};
