import { describe, expect, it } from 'vitest';
import { OptionsError, defaultFeatures, parseFeatures, resolveOptions } from '../src/core/options.js';

describe('resolveOptions', () => {
  it('fills defaults when only the name is given', () => {
    expect(resolveOptions({ name: 'my-api' })).toEqual({
      name: 'my-api',
      directory: undefined,
      framework: 'express',
      orm: 'none',
      database: 'none',
      features: defaultFeatures(),
      packageManager: 'npm',
    });
  });

  it('defaults the database to postgresql when an ORM is chosen', () => {
    expect(resolveOptions({ name: 'api', orm: 'prisma' }).database).toBe('postgresql');
  });

  it('rejects a database without an ORM', () => {
    expect(() => resolveOptions({ name: 'api', database: 'sqlite' })).toThrow(OptionsError);
  });

  it('rejects unsupported values', () => {
    expect(() => resolveOptions({ name: 'api', framework: 'adonisjs' })).toThrow(/Invalid framework/);
    expect(() => resolveOptions({ name: 'api', orm: 'typeorm' })).toThrow(/Invalid orm/);
    expect(() => resolveOptions({ name: 'api', orm: 'prisma', database: 'mysql' })).toThrow(/Invalid database/);
    expect(() => resolveOptions({ name: 'api', packageManager: 'yarn' })).toThrow(/Invalid package manager/);
  });

  it('rejects invalid project names', () => {
    expect(() => resolveOptions({ name: 'My Api' })).toThrow(OptionsError);
    expect(() => resolveOptions({})).toThrow(OptionsError);
  });

  it('maps the legacy template flag to a framework', () => {
    expect(resolveOptions({ name: 'api', template: 'fastify-typescript' }).framework).toBe('fastify');
  });
});

describe('parseFeatures', () => {
  it('parses a comma-separated list without duplicates', () => {
    expect(parseFeatures('docker, lint,docker')).toEqual(['docker', 'lint']);
  });

  it('accepts "none"', () => {
    expect(parseFeatures('none')).toEqual([]);
  });

  it('maps legacy feature names', () => {
    expect(parseFeatures('eslint,prettier,jest')).toEqual(['lint', 'test']);
  });

  it('rejects unknown features', () => {
    expect(() => parseFeatures('docker,winston')).toThrow(/Invalid feature/);
  });
});
