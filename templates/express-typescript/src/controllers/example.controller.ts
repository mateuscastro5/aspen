import { Request, Response } from 'express';

// Example controller with basic CRUD operations
export const exampleController = {
  // Get all examples
  getAll: async (req: Request, res: Response) => {
    try {
      // In a real application, this would fetch data from a database
      const examples = [
        { id: 1, name: 'Example 1', description: 'This is example 1' },
        { id: 2, name: 'Example 2', description: 'This is example 2' }
      ];
      
      res.json({ data: examples });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve examples' });
    }
  },
  
  // Get example by ID
  getById: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // In a real application, this would fetch data from a database
      const example = { id, name: `Example ${id}`, description: `This is example ${id}` };
      
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
      
      // In a real application, this would create a record in a database
      const newExample = {
        id: Math.floor(Math.random() * 1000),
        name,
        description
      };
      
      res.status(201).json({ data: newExample, message: 'Example created successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create example' });
    }
  },
  
  // Update an existing example
  update: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description } = req.body;
      
      // In a real application, this would update a record in a database
      const updatedExample = {
        id,
        name,
        description
      };
      
      res.json({ data: updatedExample, message: 'Example updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update example' });
    }
  },
  
  // Delete an example
  remove: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // In a real application, this would delete a record from a database
      
      res.json({ message: `Example ${id} deleted successfully` });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete example' });
    }
  }
};
