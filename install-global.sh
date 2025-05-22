#!/bin/bash

# Cores para o terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌲 Preparando Aspen CLI para instalação global...${NC}"

# Verificar se as dependências estão instaladas
echo -e "${BLUE}📦 Verificando dependências...${NC}"
npm install

# Limpar pasta dist
echo -e "${BLUE}🗑️ Limpando pasta dist...${NC}"
rm -rf dist

# Construir o projeto
echo -e "${BLUE}�� Construindo o projeto...${NC}"
npm run build

# Verificar se a build foi bem-sucedida
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Falha na construção. Corrigindo erros...${NC}"
  exit 1
fi

# Garantir que o arquivo tenha permissão de execução
echo -e "${BLUE}🔑 Configurando permissões...${NC}"
chmod +x dist/index.js

# Instalar globalmente
echo -e "${BLUE}🌐 Instalando Aspen CLI globalmente...${NC}"
npm link

echo -e "${GREEN}✅ Aspen CLI instalado globalmente com sucesso!${NC}"
echo -e "${BLUE}Para testar, execute: ${GREEN}aspen --help${NC}"
