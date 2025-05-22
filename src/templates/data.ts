import { Feature, TemplateConfig } from '../types/index.js';

export const templates: TemplateConfig[] = [
  {
    name: 'typescript',
    description: 'TypeScript backend project',
    frameworks: [
      {
        name: 'express',
        description: 'Fast, unopinionated, minimalist web framework for Node.js',
        orms: [
          {
            name: 'prisma',
            description: 'Next-generation ORM for Node.js and TypeScript',
            databases: [
              { name: 'postgresql', description: 'PostgreSQL database' },
              { name: 'mysql', description: 'MySQL database' },
              { name: 'sqlite', description: 'SQLite database' },
              { name: 'mongodb', description: 'MongoDB database (via Prisma Data Proxy)' }
            ]
          },
          {
            name: 'typeorm',
            description: 'ORM for TypeScript and JavaScript',
            databases: [
              { name: 'postgresql', description: 'PostgreSQL database' },
              { name: 'mysql', description: 'MySQL database' },
              { name: 'sqlite', description: 'SQLite database' },
              { name: 'mongodb', description: 'MongoDB database' }
            ]
          },
          {
            name: 'drizzle',
            description: 'TypeScript ORM for Node.js',
            databases: [
              { name: 'postgresql', description: 'PostgreSQL database' },
              { name: 'mysql', description: 'MySQL database' },
              { name: 'sqlite', description: 'SQLite database' }
            ]
          },
          {
            name: 'mongoose',
            description: 'MongoDB object modeling for Node.js',
            databases: [
              { name: 'mongodb', description: 'MongoDB database' }
            ]
          },
          {
            name: 'none',
            description: 'No ORM',
            databases: [
              { name: 'none', description: 'No database' }
            ]
          }
        ]
      },
      {
        name: 'fastify',
        description: 'Fast and low overhead web framework for Node.js',
        orms: [
          {
            name: 'prisma',
            description: 'Next-generation ORM for Node.js and TypeScript',
            databases: [
              { name: 'postgresql', description: 'PostgreSQL database' },
              { name: 'mysql', description: 'MySQL database' },
              { name: 'sqlite', description: 'SQLite database' },
              { name: 'mongodb', description: 'MongoDB database (via Prisma Data Proxy)' }
            ]
          },
          {
            name: 'typeorm',
            description: 'ORM for TypeScript and JavaScript',
            databases: [
              { name: 'postgresql', description: 'PostgreSQL database' },
              { name: 'mysql', description: 'MySQL database' },
              { name: 'sqlite', description: 'SQLite database' },
              { name: 'mongodb', description: 'MongoDB database' }
            ]
          },
          {
            name: 'drizzle',
            description: 'TypeScript ORM for Node.js',
            databases: [
              { name: 'postgresql', description: 'PostgreSQL database' },
              { name: 'mysql', description: 'MySQL database' },
              { name: 'sqlite', description: 'SQLite database' }
            ]
          },
          {
            name: 'mongoose',
            description: 'MongoDB object modeling for Node.js',
            databases: [
              { name: 'mongodb', description: 'MongoDB database' }
            ]
          },
          {
            name: 'none',
            description: 'No ORM',
            databases: [
              { name: 'none', description: 'No database' }
            ]
          }
        ]
      },
      {
        name: 'nestjs',
        description: 'Progressive Node.js framework for building efficient and scalable server-side applications',
        orms: [
          {
            name: 'prisma',
            description: 'Next-generation ORM for Node.js and TypeScript',
            databases: [
              { name: 'postgresql', description: 'PostgreSQL database' },
              { name: 'mysql', description: 'MySQL database' },
              { name: 'sqlite', description: 'SQLite database' },
              { name: 'mongodb', description: 'MongoDB database (via Prisma Data Proxy)' }
            ]
          },
          {
            name: 'typeorm',
            description: 'ORM for TypeScript and JavaScript',
            databases: [
              { name: 'postgresql', description: 'PostgreSQL database' },
              { name: 'mysql', description: 'MySQL database' },
              { name: 'sqlite', description: 'SQLite database' },
              { name: 'mongodb', description: 'MongoDB database' }
            ]
          },
          {
            name: 'drizzle',
            description: 'TypeScript ORM for Node.js',
            databases: [
              { name: 'postgresql', description: 'PostgreSQL database' },
              { name: 'mysql', description: 'MySQL database' },
              { name: 'sqlite', description: 'SQLite database' }
            ]
          },
          {
            name: 'mongoose',
            description: 'MongoDB object modeling for Node.js',
            databases: [
              { name: 'mongodb', description: 'MongoDB database' }
            ]
          },
          {
            name: 'none',
            description: 'No ORM',
            databases: [
              { name: 'none', description: 'No database' }
            ]
          }
        ]
      },
      {
        name: 'hono',
        description: 'Ultrafast web framework for the Edges',
        orms: [
          {
            name: 'prisma',
            description: 'Next-generation ORM for Node.js and TypeScript',
            databases: [
              { name: 'postgresql', description: 'PostgreSQL database' },
              { name: 'mysql', description: 'MySQL database' },
              { name: 'sqlite', description: 'SQLite database' },
              { name: 'mongodb', description: 'MongoDB database (via Prisma Data Proxy)' }
            ]
          },
          {
            name: 'drizzle',
            description: 'TypeScript ORM for Node.js',
            databases: [
              { name: 'postgresql', description: 'PostgreSQL database' },
              { name: 'mysql', description: 'MySQL database' },
              { name: 'sqlite', description: 'SQLite database' }
            ]
          },
          {
            name: 'mongoose',
            description: 'MongoDB object modeling for Node.js',
            databases: [
              { name: 'mongodb', description: 'MongoDB database' }
            ]
          },
          {
            name: 'none',
            description: 'No ORM',
            databases: [
              { name: 'none', description: 'No database' }
            ]
          }
        ]
      },
      {
        name: 'adonisjs',
        description: 'Full-stack framework with a focus on developer ergonomics and speed',
        orms: [
          {
            name: 'lucid',
            description: 'AdonisJS built-in ORM',
            databases: [
              { name: 'postgresql', description: 'PostgreSQL database' },
              { name: 'mysql', description: 'MySQL database' },
              { name: 'sqlite', description: 'SQLite database' }
            ]
          },
          {
            name: 'prisma',
            description: 'Next-generation ORM for Node.js and TypeScript',
            databases: [
              { name: 'postgresql', description: 'PostgreSQL database' },
              { name: 'mysql', description: 'MySQL database' },
              { name: 'sqlite', description: 'SQLite database' }
            ]
          },
          {
            name: 'none',
            description: 'No ORM',
            databases: [
              { name: 'none', description: 'No database' }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'javascript',
    description: 'JavaScript backend project',
    frameworks: [
      {
        name: 'express',
        description: 'Fast, unopinionated, minimalist web framework for Node.js',
        orms: [
          {
            name: 'prisma',
            description: 'Next-generation ORM for Node.js and TypeScript',
            databases: [
              { name: 'postgresql', description: 'PostgreSQL database' },
              { name: 'mysql', description: 'MySQL database' },
              { name: 'sqlite', description: 'SQLite database' },
              { name: 'mongodb', description: 'MongoDB database (via Prisma Data Proxy)' }
            ]
          },
          {
            name: 'mongoose',
            description: 'MongoDB object modeling for Node.js',
            databases: [
              { name: 'mongodb', description: 'MongoDB database' }
            ]
          },
          {
            name: 'sequelize',
            description: 'Promise-based ORM for Node.js',
            databases: [
              { name: 'postgresql', description: 'PostgreSQL database' },
              { name: 'mysql', description: 'MySQL database' },
              { name: 'sqlite', description: 'SQLite database' }
            ]
          },
          {
            name: 'none',
            description: 'No ORM',
            databases: [
              { name: 'none', description: 'No database' }
            ]
          }
        ]
      },
      {
        name: 'fastify',
        description: 'Fast and low overhead web framework for Node.js',
        orms: [
          {
            name: 'prisma',
            description: 'Next-generation ORM for Node.js and TypeScript',
            databases: [
              { name: 'postgresql', description: 'PostgreSQL database' },
              { name: 'mysql', description: 'MySQL database' },
              { name: 'sqlite', description: 'SQLite database' },
              { name: 'mongodb', description: 'MongoDB database (via Prisma Data Proxy)' }
            ]
          },
          {
            name: 'mongoose',
            description: 'MongoDB object modeling for Node.js',
            databases: [
              { name: 'mongodb', description: 'MongoDB database' }
            ]
          },
          {
            name: 'sequelize',
            description: 'Promise-based ORM for Node.js',
            databases: [
              { name: 'postgresql', description: 'PostgreSQL database' },
              { name: 'mysql', description: 'MySQL database' },
              { name: 'sqlite', description: 'SQLite database' }
            ]
          },
          {
            name: 'none',
            description: 'No ORM',
            databases: [
              { name: 'none', description: 'No database' }
            ]
          }
        ]
      },
      {
        name: 'hono',
        description: 'Ultrafast web framework for the Edges',
        orms: [
          {
            name: 'prisma',
            description: 'Next-generation ORM for Node.js and TypeScript',
            databases: [
              { name: 'postgresql', description: 'PostgreSQL database' },
              { name: 'mysql', description: 'MySQL database' },
              { name: 'sqlite', description: 'SQLite database' },
              { name: 'mongodb', description: 'MongoDB database (via Prisma Data Proxy)' }
            ]
          },
          {
            name: 'mongoose',
            description: 'MongoDB object modeling for Node.js',
            databases: [
              { name: 'mongodb', description: 'MongoDB database' }
            ]
          },
          {
            name: 'none',
            description: 'No ORM',
            databases: [
              { name: 'none', description: 'No database' }
            ]
          }
        ]
      }
    ]
  }
];

// Available features
export const features: Feature[] = [
  {
    name: 'Swagger/OpenAPI',
    description: 'API documentation with Swagger/OpenAPI',
    value: 'swagger',
    defaultSelected: true
  },
  {
    name: 'Jest',
    description: 'Testing with Jest',
    value: 'jest',
    defaultSelected: true
  },
  {
    name: 'ESLint',
    description: 'Linting with ESLint',
    value: 'eslint',
    defaultSelected: true
  },
  {
    name: 'Prettier',
    description: 'Code formatting with Prettier',
    value: 'prettier',
    defaultSelected: true
  },
  {
    name: 'Biome',
    description: 'Formatter, linter, bundler, and more for JavaScript and TypeScript',
    value: 'biome'
  },
  {
    name: 'Docker',
    description: 'Docker configuration for containerization',
    value: 'docker',
    defaultSelected: true
  },
  {
    name: 'GitHub Actions',
    description: 'CI/CD with GitHub Actions',
    value: 'github-actions'
  },
  {
    name: 'Husky',
    description: 'Git hooks with Husky',
    value: 'husky'
  },
  {
    name: 'Winston',
    description: 'Logging with Winston',
    value: 'winston',
    defaultSelected: true
  },
  {
    name: 'dotenv',
    description: 'Environment variables with dotenv',
    value: 'dotenv',
    defaultSelected: true
  },
  {
    name: 'JWT Authentication',
    description: 'Authentication with JSON Web Tokens',
    value: 'jwt'
  },
  {
    name: 'Rate Limiting',
    description: 'API rate limiting',
    value: 'rate-limiting'
  },
  {
    name: 'CORS',
    description: 'Cross-Origin Resource Sharing',
    value: 'cors',
    defaultSelected: true
  },
  {
    name: 'Helmet',
    description: 'Security with Helmet',
    value: 'helmet',
    defaultSelected: true
  }
];
