import { FastifyRequest, FastifyReply } from 'fastify';
import { ExampleService } from '../services/example.service.js';

// Initialize the service
const exampleService = new ExampleService();

// Define request schemas
interface GetByIdRequest {
  Params: {
    id: string;
  };
}

interface CreateRequest {
  Body: {
    name: string;
    description?: string;
  };
}

interface UpdateRequest {
  Params: {
    id: string;
  };
  Body: {
    name?: string;
    description?: string;
  };
}

// Example handlers for Fastify routes
export const exampleHandlers = {
  // Get all examples
  getAll: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const examples = await exampleService.getAll();
      return reply.send({ data: examples });
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to retrieve examples' });
    }
  },
  
  // Get example by ID
  getById: async (request: FastifyRequest<GetByIdRequest>, reply: FastifyReply) => {
    try {
      const id = parseInt(request.params.id);
      const example = await exampleService.getById(id);
      
      if (!example) {
        return reply.status(404).send({ error: 'Example not found' });
      }
      
      return reply.send({ data: example });
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to retrieve example' });
    }
  },
  
  // Create a new example
  create: async (request: FastifyRequest<CreateRequest>, reply: FastifyReply) => {
    try {
      const { name, description } = request.body;
      
      // Validate required fields
      if (!name) {
        return reply.status(400).send({ error: 'Name is required' });
      }
      
      const newExample = await exampleService.create({ name, description });
      return reply.status(201).send({ 
        data: newExample, 
        message: 'Example created successfully' 
      });
    } catch (error: any) {
      if (error.message.includes('required') || error.message.includes('characters')) {
        return reply.status(400).send({ error: error.message });
      }
      return reply.status(500).send({ error: 'Failed to create example' });
    }
  },
  
  // Update an existing example
  update: async (request: FastifyRequest<UpdateRequest>, reply: FastifyReply) => {
    try {
      const id = parseInt(request.params.id);
      const updateData = request.body;
      
      const updatedExample = await exampleService.update(id, updateData);
      
      if (!updatedExample) {
        return reply.status(404).send({ error: 'Example not found' });
      }
      
      return reply.send({ 
        data: updatedExample, 
        message: 'Example updated successfully' 
      });
    } catch (error: any) {
      if (error.message.includes('required') || error.message.includes('characters')) {
        return reply.status(400).send({ error: error.message });
      }
      return reply.status(500).send({ error: 'Failed to update example' });
    }
  },
  
  // Delete an example
  remove: async (request: FastifyRequest<GetByIdRequest>, reply: FastifyReply) => {
    try {
      const id = parseInt(request.params.id);
      const deleted = await exampleService.remove(id);
      
      if (!deleted) {
        return reply.status(404).send({ error: 'Example not found' });
      }
      
      return reply.send({ message: 'Example deleted successfully' });
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to delete example' });
    }
  }
};
