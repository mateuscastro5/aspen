# Aspen

Aspen é uma ferramenta de linha de comando moderna para criar projetos backend com opções personalizáveis.

![Aspen CLI](https://i.imgur.com/YourAspenCLIScreenshot.png)

## Características

- 🚀 Criação rápida de projetos backend
- 🛠️ Suporte para vários frameworks: Express, Fastify, NestJS, Hono, AdonisJS
- 📊 Integração com diversos ORMs: Prisma, TypeORM, Mongoose, Drizzle, Sequelize, Lucid (AdonisJS)
- 🗄️ Suporte para diferentes bancos de dados: PostgreSQL, MySQL, SQLite, MongoDB
- 📦 Utiliza os CLIs nativos dos frameworks quando disponíveis
- 🔧 Configuração personalizada de recursos adicionais
- 🎨 Interface de linha de comando intuitiva e bonita

## Instalação

```bash
# Instalação global via npm
npm install -g aspen-cli

# Ou via yarn
yarn global add aspen-cli

# Ou via pnpm
pnpm add -g aspen-cli
```

## Uso

### Criar um novo projeto

```bash
# Criar um novo projeto com assistente interativo
aspen create my-project

# Criar um projeto especificando diretório
aspen create my-project --directory ./projects

# Criar um projeto com template específico
aspen create my-project --template express-typescript
```

### Listar templates disponíveis

```bash
aspen list
```

### Inicializar Aspen em um projeto existente

```bash
# Navegue até o diretório do projeto existente
cd meu-projeto-existente

# Inicializar Aspen
aspen init
```

```bash
# Criar um novo projeto
aspen create my-backend-project

# Obter ajuda
aspen --help
```

## Opções de Criação de Projeto

Ao criar um novo projeto, você pode personalizar:

- **Linguagem**: TypeScript ou JavaScript
- **Framework**: Express, Fastify, NestJS, Hono, AdonisJS
- **ORM**: Prisma, TypeORM, Mongoose, Drizzle, Sequelize, Lucid (AdonisJS) ou nenhum
- **Banco de Dados**: PostgreSQL, MySQL, SQLite, MongoDB ou nenhum
- **Recursos Adicionais**:
  - ESLint
  - Prettier
  - Biome
  - Jest
  - Docker
  - Swagger/OpenAPI
  - Autenticação JWT
  - Limitação de taxa
  - CORS
  - Helmet
  - Winston (logging)
  - e mais...

## Estrutura do Projeto Gerado

```
my-backend-project/
├── src/
│   ├── controllers/     # Controladores da aplicação
│   ├── models/          # Modelos de dados
│   ├── routes/          # Definição de rotas
│   ├── middlewares/     # Middlewares
│   ├── services/        # Serviços da aplicação
│   ├── utils/           # Utilitários
│   ├── config/          # Configurações
│   └── index.ts         # Ponto de entrada da aplicação
├── .env                 # Variáveis de ambiente
├── .env.example         # Exemplo de variáveis de ambiente
├── .gitignore           # Arquivos ignorados pelo git
├── package.json         # Dependências e scripts
├── tsconfig.json        # Configuração do TypeScript (se aplicável)
└── README.md            # Documentação
```

## Licença

MIT
