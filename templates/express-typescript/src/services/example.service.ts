import { ExampleModel, Example } from '../models/example.model.js';

// Example service class with business logic
export class ExampleService {
  private examples: Example[] = [];
  private nextId = 1;

  // Get all examples
  async getAll(): Promise<Example[]> {
    return this.examples;
  }

  // Get example by ID
  async getById(id: number): Promise<Example | null> {
    return this.examples.find(example => example.id === id) || null;
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
  async update(id: number, data: Partial<ExampleModel>): Promise<Example | null> {
    const example = await this.getById(id);
    
    if (!example) {
      return null;
    }
    
    example.update(data);
    return example;
  }

  // Delete an example
  async delete(id: number): Promise<boolean> {
    const index = this.examples.findIndex(example => example.id === id);
    
    if (index === -1) {
      return false;
    }
    
    this.examples.splice(index, 1);
    return true;
  }

  // Search examples by name
  async searchByName(query: string): Promise<Example[]> {
    const lowercaseQuery = query.toLowerCase();
    return this.examples.filter(example => 
      example.name.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get paginated examples
  async getPaginated(page: number = 1, limit: number = 10): Promise<{
    data: Example[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const total = this.examples.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const data = this.examples.slice(offset, offset + limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages
    };
  }
}
