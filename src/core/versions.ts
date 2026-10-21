export const versions = {
  typescript: '~6.0.3',
  '@types/node': '^24.19.2',
  tsx: '^4.23.15',
  dotenv: '^18.0.8',

  express: '^5.3.0',
  '@types/express': '^5.0.6',
  cors: '^2.8.6',
  '@types/cors': '^2.8.19',
  helmet: '^8.3.0',
  'swagger-ui-express': '^5.0.1',
  '@types/swagger-ui-express': '^4.1.8',
  supertest: '^7.3.1',
  '@types/supertest': '^6.0.3',

  fastify: '^5.12.7',
  '@fastify/cors': '^11.3.1',
  '@fastify/helmet': '^13.2.0',
  '@fastify/swagger': '^9.9.2',
  '@fastify/swagger-ui': '^6.1.2',

  '@nestjs/cli': '12.0.10',
  '@nestjs/swagger': '^12.0.2',

  prisma: '^7.10.1',
  '@prisma/client': '^7.10.1',
  '@prisma/adapter-pg': '^7.10.1',
  '@prisma/adapter-libsql': '^7.10.1',

  'drizzle-orm': '^0.45.4',
  'drizzle-kit': '^0.31.11',
  pg: '^8.23.1',
  '@types/pg': '^8.23.1',
  '@libsql/client': '^0.18.0',

  vitest: '^5.0.5',
  eslint: '^10.13.0',
  '@eslint/js': '^10.0.1',
  'typescript-eslint': '^8.72.0',
  prettier: '^3.9.10',
  'eslint-config-prettier': '^10.1.8'
} as const;

export type PackageName = keyof typeof versions;
