import { ProjectOptions } from '../types/index.js';
import { PackageName, versions } from './versions.js';

export interface DependencyPlan {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

const pick = (names: PackageName[]): Record<string, string> =>
  Object.fromEntries(names.map(name => [name, versions[name]]));

export const getDependencyPlan = (options: ProjectOptions): DependencyPlan => {
  const deps: PackageName[] = [];
  const devDeps: PackageName[] = [];
  const has = (feature: ProjectOptions['features'][number]) => options.features.includes(feature);

  if (options.framework === 'express') {
    deps.push('express', 'dotenv');
    devDeps.push('typescript', 'tsx', '@types/node', '@types/express');
    if (has('cors')) {
      deps.push('cors');
      devDeps.push('@types/cors');
    }
    if (has('helmet')) deps.push('helmet');
    if (has('swagger')) {
      deps.push('swagger-ui-express');
      devDeps.push('@types/swagger-ui-express');
    }
    if (has('test')) devDeps.push('vitest', 'supertest', '@types/supertest');
  }

  if (options.framework === 'fastify') {
    deps.push('fastify', 'dotenv');
    devDeps.push('typescript', 'tsx', '@types/node');
    if (has('cors')) deps.push('@fastify/cors');
    if (has('helmet')) deps.push('@fastify/helmet');
    if (has('swagger')) deps.push('@fastify/swagger', '@fastify/swagger-ui');
    if (has('test')) devDeps.push('vitest');
  }

  if (options.framework === 'nestjs') {
    if (has('helmet')) deps.push('helmet');
    if (has('swagger')) deps.push('@nestjs/swagger');
  }

  if (options.framework !== 'nestjs' && has('lint')) {
    devDeps.push('eslint', '@eslint/js', 'typescript-eslint', 'prettier', 'eslint-config-prettier');
  }

  if (options.orm === 'prisma') {
    deps.push('@prisma/client', options.database === 'sqlite' ? '@prisma/adapter-libsql' : '@prisma/adapter-pg');
    devDeps.push('prisma');
  }

  if (options.orm === 'drizzle') {
    deps.push('drizzle-orm');
    devDeps.push('drizzle-kit');
    if (options.database === 'sqlite') {
      deps.push('@libsql/client');
    } else {
      deps.push('pg');
      devDeps.push('@types/pg');
    }
  }

  return { dependencies: pick(deps), devDependencies: pick(devDeps) };
};
