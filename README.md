# Aspen CLI

[![npm version](https://img.shields.io/npm/v/cli-aspen.svg)](https://www.npmjs.com/package/cli-aspen)
[![npm downloads](https://img.shields.io/npm/dt/cli-aspen.svg)](https://www.npmjs.com/package/cli-aspen)

Create TypeScript backend projects that build, lint and pass their tests from the first minute.

Available on npm: [cli-aspen](https://www.npmjs.com/package/cli-aspen)

## Why Aspen

- **Small, tested surface.** A short list of frameworks, ORMs and databases, and every combination is generated and verified in CI.
- **Works with or without prompts.** Answer a few questions, or pass everything as flags. Scripts and AI agents can use `--json` to get a machine-readable result.
- **Current versions.** Express 5, Fastify 5, NestJS 12, Prisma 7, Drizzle, ESLint 10 and Vitest.

## Installation

```bash
npm install -g cli-aspen
```

Or run it without installing:

```bash
npx cli-aspen create my-api
```

## Usage

Interactive:

```bash
aspen create my-api
```

Without prompts:

```bash
aspen create my-api --framework fastify --orm drizzle --database postgresql --yes
```

For scripts and AI agents:

```bash
aspen create my-api --framework nestjs --orm prisma --database sqlite --json
aspen list --json
```

### Options

| Flag | Values | Default |
|---|---|---|
| `-f, --framework` | `express`, `fastify`, `nestjs` | `express` |
| `-o, --orm` | `prisma`, `drizzle`, `none` | `none` |
| `--database` | `postgresql`, `sqlite` (requires an ORM) | `postgresql` when an ORM is chosen |
| `--features` | comma-separated list of `docker`, `lint`, `test`, `swagger`, `cors`, `helmet`, or `none` | all |
| `-p, --package-manager` | `npm`, `pnpm` | `npm` |
| `-d, --directory` | parent directory for the project | current directory |
| `-y, --yes` | use defaults for anything not provided, without prompts | |
| `--no-install` | skip installing dependencies | |
| `--json` | print the result as JSON (implies `--yes`) | |

## What you get

| | Express / Fastify | NestJS |
|---|---|---|
| Base project | Aspen template: `app.ts` + `index.ts`, routes, an example service and a health check | Official `@nestjs/cli` project |
| `lint` | ESLint 10 + typescript-eslint + Prettier | Included by NestJS (oxlint + Prettier) |
| `test` | Vitest with example tests | Included by NestJS (Vitest) |
| `swagger` | Swagger UI at `/docs` | `@nestjs/swagger` at `/docs` |
| `cors`, `helmet` | Registered in `app.ts` | Registered in `main.ts` |
| `docker` | Multi-stage `Dockerfile`, `docker-compose.yml` with PostgreSQL when selected | Same |

With an ORM, the project also gets:

- **Prisma**: `prisma/schema.prisma`, `prisma.config.ts` and a client in `src/db/client.ts` using the PostgreSQL or libSQL adapter.
- **Drizzle**: `drizzle.config.ts`, `src/db/schema.ts` and a client in `src/db/client.ts` using `pg` or libSQL.
- Scripts: `db:generate`, `db:migrate` and `db:studio`.

## Development

```bash
npm install
npm run build
npm test
```

## License

MIT
