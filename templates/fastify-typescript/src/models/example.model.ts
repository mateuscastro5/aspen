// Example model interface for Fastify
export interface ExampleModel {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Example model class with basic validation
export class Example implements ExampleModel {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<ExampleModel>) {
    this.id = data.id || 0;
    this.name = data.name || '';
    this.description = data.description;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    
    this.validate();
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Name is required');
    }
    
    if (this.name.length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
  }

  // Update the model
  update(data: Partial<ExampleModel>): void {
    Object.assign(this, data);
    this.updatedAt = new Date();
    this.validate();
  }

  // Convert to JSON
  toJSON(): ExampleModel {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
