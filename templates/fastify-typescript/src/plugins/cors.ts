import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

// CORS plugin for Fastify
const corsPlugin: FastifyPluginAsync = async (fastify, opts) => {
  await fastify.register(import('@fastify/cors'), {
    origin: (origin, callback) => {
      // Allow requests from localhost and development environments
      const allowed = !origin || /localhost/.test(origin) || /127\.0\.0\.1/.test(origin);
      callback(null, allowed);
    },
    credentials: true
  });
};

export default fp(corsPlugin);
