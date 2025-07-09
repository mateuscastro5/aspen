import { Request, Response } from 'express';
import { ExampleService } from '../services/example.service.js';

// Initialize the service
const exampleService = new ExampleService();

// Example controller with basic CRUD operations
export const exampleController = {
  // Get all examples
  getAll: async (req: Request, res: Response) => {
    try {
      const examples = await exampleService.getAll();
      res.json({ data: examples });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve examples' });
    }
  },
  
  // Get example by ID
  getById: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const example = await exampleService.getById(id);
      
      if (!example) {
        return res.status(404).json({ error: 'Example not found' });
      }
      
      res.json({ data: example });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve example' });
    }
  },
  
  // Create a new example
  create: async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;
      
      // Validate required fields
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }
      
      const newExample = await exampleService.create({ name, description });
      res.status(201).json({ data: newExample, message: 'Example created successfully' });
    } catch (error: any) {
      if (error.message.includes('required') || error.message.includes('characters')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to create example' });
    }
  },
  
  // Update an existing example
  update: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description } = req.body;
      
      const updatedExample = await exampleService.update(id, { name, description });
      
      if (!updatedExample) {
        return res.status(404).json({ error: 'Example not found' });
      }
      
      res.json({ data: updatedExample, message: 'Example updated successfully' });
    } catch (error: any) {
      if (error.message.includes('required') || error.message.includes('characters')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to update example' });
    }
  },
  
  // Delete an example
  remove: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      const deleted = await exampleService.delete(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Example not found' });
      }
      
      res.json({ message: `Example ${id} deleted successfully` });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete example' });
    }
  }
};
