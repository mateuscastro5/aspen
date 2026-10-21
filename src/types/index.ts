export type Framework = 'express' | 'fastify' | 'nestjs';
export type ORM = 'prisma' | 'drizzle' | 'none';
export type Database = 'postgresql' | 'sqlite' | 'none';
export type Feature = 'docker' | 'lint' | 'test' | 'swagger' | 'cors' | 'helmet';
export type PackageManager = 'npm' | 'pnpm';

export interface Choice<T extends string> {
  value: T;
  description: string;
}

export interface ProjectOptions {
  name: string;
  directory?: string;
  framework: Framework;
  orm: ORM;
  database: Database;
  features: Feature[];
  packageManager: PackageManager;
}
