import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

// Logging plugin for Fastify
const loggingPlugin: FastifyPluginAsync = async (fastify, opts) => {
  // Add request logging
  fastify.addHook('onRequest', async (request, reply) => {
    fastify.log.info({
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.headers['user-agent']
    }, 'Incoming request');
  });

  // Add response logging
  fastify.addHook('onSend', async (request, reply, payload) => {
    fastify.log.info({
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: reply.elapsedTime
    }, 'Response sent');
  });
};

export default fp(loggingPlugin);
