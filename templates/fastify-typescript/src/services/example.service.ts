export interface Example {
  id: number;
  name: string;
  createdAt: string;
}

const examples: Example[] = [];

export const exampleService = {
  list(): Example[] {
    return examples;
  },

  create(name: string): Example {
    const example = { id: examples.length + 1, name, createdAt: new Date().toISOString() };
    examples.push(example);
    return example;
  },
};
