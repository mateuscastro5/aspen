import { databases, features, frameworks, orms, packageManagers } from '../templates/data.js';
import { Choice, Database, Feature, Framework, ORM, PackageManager, ProjectOptions } from '../types/index.js';

export interface CreateInput {
  name?: string;
  directory?: string;
  framework?: string;
  orm?: string;
  database?: string;
  features?: string;
  packageManager?: string;
  template?: string;
}

export class OptionsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OptionsError';
  }
}

export const defaultFeatures = (): Feature[] => features.filter(f => f.defaultSelected).map(f => f.value);

const allowed = <T extends string>(choices: Choice<T>[]) => choices.map(c => c.value);

const ensureChoice = <T extends string>(field: string, value: string, choices: Choice<T>[]): T => {
  const values = allowed(choices);
  if (!values.includes(value as T)) {
    throw new OptionsError(`Invalid ${field} "${value}". Use one of: ${values.join(', ')}`);
  }
  return value as T;
};

export const validateProjectName = (name: string): string | true => {
  if (!name) {
    return 'Project name cannot be empty';
  }
  if (!/^[a-z0-9-_]+$/.test(name)) {
    return 'Project name can only contain lowercase letters, numbers, hyphens, and underscores';
  }
  return true;
};

export const parseFeatures = (value: string): Feature[] => {
  const raw = value.trim().toLowerCase();
  if (raw === 'none' || raw === '') {
    return [];
  }
  const legacy: Record<string, Feature> = { eslint: 'lint', prettier: 'lint', jest: 'test', vitest: 'test' };
  const parsed = raw.split(',').map(item => item.trim()).filter(Boolean).map(item => legacy[item] ?? item);
  return [...new Set(parsed.map(item => ensureChoice('feature', item, features)))];
};

export const frameworkFromTemplate = (template: string): Framework =>
  ensureChoice('template', template.replace(/-typescript$/, ''), frameworks);

export const resolveOptions = (input: CreateInput): ProjectOptions => {
  const name = input.name ?? '';
  const nameCheck = validateProjectName(name);
  if (nameCheck !== true) {
    throw new OptionsError(nameCheck);
  }

  const framework: Framework = input.framework
    ? ensureChoice('framework', input.framework, frameworks)
    : input.template
      ? frameworkFromTemplate(input.template)
      : 'express';

  const orm: ORM = input.orm ? ensureChoice('orm', input.orm, orms) : 'none';

  let database: Database = 'none';
  if (orm === 'none') {
    if (input.database && input.database !== 'none') {
      throw new OptionsError('A database requires an ORM. Use --orm prisma or --orm drizzle');
    }
  } else {
    database = input.database ? ensureChoice('database', input.database, databases) : 'postgresql';
  }

  const packageManager: PackageManager = input.packageManager
    ? ensureChoice('package manager', input.packageManager, packageManagers)
    : 'npm';

  return {
    name,
    directory: input.directory,
    framework,
    orm,
    database,
    features: input.features !== undefined ? parseFeatures(input.features) : defaultFeatures(),
    packageManager
  };
};
