import { Example, ExampleModel } from '../models/example.model.js';

// Example service class for Fastify
export class ExampleService {
  private examples: Example[] = [];
  private nextId = 1;

  // Get all examples
  async getAll(): Promise<Example[]> {
    return this.examples;
  }

  // Get example by ID
  async getById(id: number): Promise<Example | undefined> {
    return this.examples.find(example => example.id === id);
  }

  // Create a new example
  async create(data: Omit<ExampleModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Example> {
    const example = new Example({
      ...data,
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    this.examples.push(example);
    return example;
  }

  // Update an existing example
  async update(id: number, data: Partial<Omit<ExampleModel, 'id' | 'createdAt'>>): Promise<Example | null> {
    const example = await this.getById(id);
    if (!example) {
      return null;
    }

    example.update(data);
    return example;
  }

  // Delete an example
  async remove(id: number): Promise<boolean> {
    const index = this.examples.findIndex(example => example.id === id);
    if (index === -1) {
      return false;
    }

    this.examples.splice(index, 1);
    return true;
  }

  // Get examples count
  async count(): Promise<number> {
    return this.examples.length;
  }
}
