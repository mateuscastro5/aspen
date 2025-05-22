import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const statusCode = error.statusCode || 500;
  
  // Log the error in development mode
  if (process.env.NODE_ENV === 'development') {
    console.error(error);
  }
  
  // Create standardized error response
  reply.status(statusCode).send({
    statusCode,
    error: error.name || 'Internal Server Error',
    message: error.message || 'An unexpected error occurred',
  });
};
