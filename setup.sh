#!/bin/bash

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Vérification de l'environnement
check_env() {
  echo -e "${YELLOW}Vérification de l'environnement...${NC}"
  if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js n'est pas installé${NC}"
    exit 1
  fi
  echo -e "${GREEN}Environnement OK${NC}"
}

# Installation des dépendances
install_deps() {
  echo -e "${YELLOW}Installation des dépendances...${NC}"
  # Installation des dépendances principales
  npm install --force
  # Installation spécifique de ngrok
  npm install --save-dev @expo/ngrok@^4.1.0
  npm install --save-dev jest jest-expo@latest
  echo -e "${GREEN}Dépendances installées${NC}"
}

# Configuration du tunnel
setup_tunnel() {
  echo -e "${YELLOW}Configuration du tunnel...${NC}"
  if ! npm list @expo/ngrok --depth=0 2>/dev/null | grep -q "@expo/ngrok"; then
    echo -e "${YELLOW}Installation de @expo/ngrok...${NC}"
    npm install --save-dev @expo/ngrok@^4.1.0
  fi
  echo -e "${GREEN}Tunnel configuré${NC}"
}

# Menu principal
while true; do
  echo -e "\n${YELLOW}=== Menu NPC Social Sim ===${NC}"
  echo "1) Installation complète (première fois)"
  echo "2) Démarrer avec Tunnel"
  echo "3) Démarrer sur LAN"
  echo "4) Démarrer sur localhost"
  echo "5) Quitter"
  read -p "Choix (1-5): " choice

  case $choice in
    1)
      check_env
      install_deps
      setup_tunnel
      echo -e "${GREEN}Installation terminée. Choisissez l'option 2 pour démarrer.${NC}"
      ;;
    2)
      check_env
      setup_tunnel
      echo -e "${YELLOW}Démarrage avec tunnel...${NC}"
      export EXPO_TUNNEL_SUBDOMAIN=npc-social-sim-$(date +%s)
      npx expo start --tunnel
      ;;
    3)
      check_env
      echo -e "${YELLOW}Démarrage sur LAN...${NC}"
      npx expo start --lan
      ;;
    4)
      check_env
      echo -e "${YELLOW}Démarrage sur localhost...${NC}"
      npx expo start --localhost
      ;;
    5)
      echo -e "${GREEN}Au revoir !${NC}"
      exit 0
      ;;
    *)
      echo -e "${RED}Choix invalide${NC}"
      ;;
  esac
done