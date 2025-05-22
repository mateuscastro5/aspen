export interface ProjectOptions {
  name: string;
  directory?: string;
  template?: string;
  language: 'typescript' | 'javascript';
  framework: string;
  orm?: string;
  database?: string;
  features: string[];
  packageManager: 'npm' | 'yarn' | 'pnpm';
}

export interface TemplateConfig {
  name: string;
  description: string;
  frameworks: Framework[];
}

export interface Framework {
  name: string;
  description: string;
  orms: ORM[];
}

export interface ORM {
  name: string;
  description: string;
  databases: Database[];
}

export interface Database {
  name: string;
  description: string;
}

export interface Feature {
  name: string;
  description: string;
  value: string;
  defaultSelected?: boolean;
}
