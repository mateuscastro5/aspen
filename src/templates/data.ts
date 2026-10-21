import { Choice, Database, Feature, Framework, ORM, PackageManager } from '../types/index.js';

export const frameworks: Choice<Framework>[] = [
  { value: 'express', description: 'Fast, unopinionated, minimalist web framework' },
  { value: 'fastify', description: 'Fast and low overhead web framework' },
  { value: 'nestjs', description: 'Progressive framework for scalable server-side applications' }
];

export const orms: Choice<ORM>[] = [
  { value: 'prisma', description: 'Type-safe ORM with schema and migrations' },
  { value: 'drizzle', description: 'Lightweight TypeScript ORM, SQL-like' },
  { value: 'none', description: 'No ORM' }
];

export const databases: Choice<Database>[] = [
  { value: 'postgresql', description: 'PostgreSQL' },
  { value: 'sqlite', description: 'SQLite (local file)' }
];

export const features: (Choice<Feature> & { defaultSelected: boolean })[] = [
  { value: 'docker', description: 'Dockerfile and docker-compose', defaultSelected: true },
  { value: 'lint', description: 'ESLint and Prettier', defaultSelected: true },
  { value: 'test', description: 'Test setup with an example test', defaultSelected: true },
  { value: 'swagger', description: 'OpenAPI documentation with Swagger UI', defaultSelected: true },
  { value: 'cors', description: 'Cross-Origin Resource Sharing', defaultSelected: true },
  { value: 'helmet', description: 'Security headers with Helmet', defaultSelected: true }
];

export const packageManagers: Choice<PackageManager>[] = [
  { value: 'npm', description: 'npm' },
  { value: 'pnpm', description: 'pnpm' }
];
