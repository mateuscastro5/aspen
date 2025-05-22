#!/usr/bin/env bash

# Script para construir e publicar o pacote Aspen CLI

# Cores para o terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌲 Preparando Aspen CLI para publicação...${NC}"

# Verificar se as dependências estão instaladas
echo -e "${BLUE}📦 Verificando dependências...${NC}"
npm install

# Lint e formatação
echo -e "${BLUE}🧹 Executando lint...${NC}"
npm run lint

# Limpar pasta dist
echo -e "${BLUE}🗑️ Limpando pasta dist...${NC}"
rm -rf dist

# Construir o projeto
echo -e "${BLUE}🔨 Construindo o projeto...${NC}"
npm run build

# Verificar se a build foi bem-sucedida
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Falha na construção. Corrigindo erros...${NC}"
  exit 1
fi

# Testar o pacote localmente
echo -e "${BLUE}🧪 Testando o pacote localmente...${NC}"
npm link

# Solicitar confirmação para publicar
read -p "Publicar o pacote no npm? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Solicitar versão
  echo -e "${BLUE}📝 Qual versão será publicada? (patch/minor/major)${NC}"
  read VERSION_TYPE
  
  # Incrementar versão
  npm version $VERSION_TYPE
  
  # Publicar no npm
  echo -e "${BLUE}🚀 Publicando no npm...${NC}"
  npm publish
  
  echo -e "${GREEN}✅ Aspen CLI v$(node -p "require('./package.json').version") publicado com sucesso!${NC}"
else
  echo -e "${BLUE}🛑 Publicação cancelada.${NC}"
fi
