#!/bin/bash

# Instalador para o Aspen CLI
# Uso: curl -fsSL https://raw.githubusercontent.com/username/aspen/main/install.sh | bash

# Cores para o terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌲 Instalando Aspen CLI...${NC}"

# Instalar globalmente via npm
npm install -g aspen-cli

# Verificar se a instalação foi bem-sucedida
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Falha na instalação. Tente instalar manualmente:${NC}"
  echo -e "npm install -g aspen-cli"
  exit 1
fi

echo -e "${GREEN}✅ Aspen CLI instalado com sucesso!${NC}"
echo -e "${BLUE}Para criar um novo projeto:${NC}"
echo -e "${GREEN}aspen create my-project${NC}"
echo -e "${BLUE}Para listar templates disponíveis:${NC}"
echo -e "${GREEN}aspen list${NC}"
