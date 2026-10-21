import { describe, expect, it } from 'vitest';
import { getDependencyPlan } from '../src/core/dependencies.js';
import { ProjectOptions } from '../src/types/index.js';

const options = (overrides: Partial<ProjectOptions>): ProjectOptions => ({
  name: 'api',
  framework: 'express',
  orm: 'none',
  database: 'none',
  features: [],
  packageManager: 'npm',
  ...overrides,
});

describe('getDependencyPlan', () => {
  it('only adds packages for selected features', () => {
    const plan = getDependencyPlan(options({ features: [] }));

    expect(Object.keys(plan.dependencies)).toEqual(['express', 'dotenv']);
    expect(plan.devDependencies).not.toHaveProperty('vitest');
    expect(plan.devDependencies).not.toHaveProperty('eslint');
  });

  it('uses the framework-specific packages for each feature', () => {
    const express = getDependencyPlan(options({ features: ['cors', 'helmet', 'swagger'] }));
    const fastify = getDependencyPlan(options({ framework: 'fastify', features: ['cors', 'helmet', 'swagger'] }));

    expect(express.dependencies).toHaveProperty('swagger-ui-express');
    expect(fastify.dependencies).toHaveProperty('@fastify/swagger-ui');
    expect(fastify.dependencies).not.toHaveProperty('helmet');
  });

  it('picks the driver adapter that matches the database', () => {
    expect(getDependencyPlan(options({ orm: 'prisma', database: 'postgresql' })).dependencies).toHaveProperty('@prisma/adapter-pg');
    expect(getDependencyPlan(options({ orm: 'prisma', database: 'sqlite' })).dependencies).toHaveProperty('@prisma/adapter-libsql');
    expect(getDependencyPlan(options({ orm: 'drizzle', database: 'postgresql' })).dependencies).toHaveProperty('pg');
    expect(getDependencyPlan(options({ orm: 'drizzle', database: 'sqlite' })).dependencies).toHaveProperty('@libsql/client');
  });

  it('leaves lint and tests to the NestJS CLI', () => {
    const plan = getDependencyPlan(options({ framework: 'nestjs', features: ['lint', 'test'] }));

    expect(plan.devDependencies).not.toHaveProperty('eslint');
    expect(plan.devDependencies).toHaveProperty('vite');
  });
});
