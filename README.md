# Aspen CLI

[![npm version](https://img.shields.io/npm/v/cli-aspen.svg)](https://www.npmjs.com/package/cli-aspen)
[![npm downloads](https://img.shields.io/npm/dt/cli-aspen.svg)](https://www.npmjs.com/package/cli-aspen)

A modern command-line tool for creating backend projects with customizable options and robust framework support.

Available on npm: [cli-aspen](https://www.npmjs.com/package/cli-aspen)


## Features

- 🚀 Fast backend project creation
- 🛠️ Support for multiple frameworks: Express, Fastify, NestJS, AdonisJS
- 📊 Integration with various ORMs: Prisma, TypeORM, Mongoose, Drizzle, Sequelize, Lucid (AdonisJS)
- 🗄️ Support for different databases: PostgreSQL, MySQL, SQLite, MongoDB
- 📦 Uses native CLIs for robust frameworks (NestJS, AdonisJS) and local templates for simple frameworks (Express, Fastify)
- 🔧 Customizable additional features and configurations
- 🎨 Beautiful and intuitive command-line interface
- ⚡ Automatic CLI installation for frameworks that require it
- 🚫 No fallback to templates for frameworks with official CLIs

## Installation

```bash
# Global installation via npm
npm install -g cli-aspen

# Or via yarn
yarn global add cli-aspen

# Or via pnpm
pnpm add -g cli-aspen
```

## Usage

### Create a new project

```bash
# Create a new project with interactive wizard
aspen create my-project

# Create a project specifying directory
aspen create my-project --directory ./projects

# Create a project with specific template (for Express/Fastify)
aspen create my-project --template express-typescript
```

### List available templates

```bash
aspen list
```

## Project Creation Options

When creating a new project, you can customize:

- **Language**: TypeScript or JavaScript
- **Framework**: Express, Fastify, NestJS, AdonisJS
- **ORM**: Prisma, TypeORM, Mongoose, Drizzle, Sequelize, Lucid (AdonisJS) or none
- **Database**: PostgreSQL, MySQL, SQLite, MongoDB or none
- **Additional Features**:
  - ESLint for code linting
  - Prettier for code formatting
  - Biome as an alternative formatter/linter
  - Jest for testing
  - Docker configuration
  - Swagger/OpenAPI documentation
  - JWT Authentication
  - Rate limiting
  - CORS support
  - Helmet for security
  - Winston for logging
  - Husky for git hooks
  - GitHub Actions for CI/CD
  - And more...

## Framework Strategies

### Simple Frameworks (Express, Fastify)
- Uses **complete local templates** with example files
- Includes pre-configured project structure
- Ready-to-use example controllers, services, and routes
- Faster setup with immediate development readiness

### Robust Frameworks (NestJS, AdonisJS)
- Uses **official CLIs only** - no fallback to templates
- Automatically installs framework CLI if not present
- Leverages the full power and latest features of official tooling
- Ensures compatibility with framework best practices

## Generated Project Structure

### Express/Fastify Projects
```
my-backend-project/
├── src/
│   ├── controllers/     # Application controllers with examples
│   ├── models/          # Data models
│   ├── routes/          # Route definitions
│   ├── middlewares/     # Custom middlewares
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   ├── config/          # Configuration files
│   └── index.ts         # Application entry point
├── .env                 # Environment variables
├── .env.example         # Environment variables example
├── .gitignore           # Git ignore rules
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── Dockerfile           # Docker configuration (if selected)
├── docker-compose.yml   # Docker Compose setup (if selected)
└── README.md            # Project documentation
```

### NestJS/AdonisJS Projects
```
my-backend-project/
├── [Framework-specific structure created by official CLI]
├── Additional ORM configuration (if selected)
├── Additional features configuration (if selected)
└── Environment and Docker setup (if selected)
```

## Why This Approach?

- **Reliability**: Official CLIs are maintained by framework authors and always up-to-date
- **Best Practices**: Framework CLIs ensure proper project structure and configuration
- **No Maintenance Burden**: No need to maintain custom templates for complex frameworks
- **Flexibility**: Simple frameworks get rich templates, complex frameworks get official tooling
- **Performance**: Faster setup for simple projects, robust setup for complex projects

## Contributing

We welcome contributions! Please see our contributing guidelines for more information.

## License

MIT

## Support

If you encounter any issues or have questions/suggestions, please open an issue on our GitHub repository or let me know by any means.
