#!/bin/bash

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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
  
  # Nettoyage des caches
  echo -e "${BLUE}Nettoyage des caches...${NC}"
  rm -rf node_modules
  npm cache clean --force
  
  # Installation des dépendances principales
  echo -e "${BLUE}Installation des dépendances principales...${NC}"
  npm install --force
  
  # Installation des dépendances de développement
  echo -e "${BLUE}Installation des dépendances de développement...${NC}"
  npm install --save-dev @expo/ngrok@^4.1.0
  npm install --save-dev jest jest-expo@latest
  
  # Installation d'expo-dev-client
  echo -e "${BLUE}Installation d'expo-dev-client...${NC}"
  npx expo install expo-dev-client
  
  echo -e "${GREEN}Dépendances installées${NC}"
}

# Configuration du projet pour le développement
setup_dev_project() {
  echo -e "${YELLOW}Configuration du projet pour le développement...${NC}"
  
  # Création du fichier app.config.js s'il n'existe pas
  if [ ! -f app.config.js ]; then
    echo -e "${BLUE}Création de app.config.js...${NC}"
    cat > app.config.js << EOL
export default {
  expo: {
    name: "NPC Social Sim",
    slug: "npc-social-sim",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#111827"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.npcsocialsim.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#111827"
      },
      package: "com.npcsocialsim.app"
    },
    plugins: [
      "expo-dev-client",
      "expo-image-picker",
      "expo-notifications"
    ],
    extra: {
      eas: {
        projectId: "your-project-id"
      }
    }
  }
};
EOL
  fi
  
  echo -e "${GREEN}Configuration du projet terminée${NC}"
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

# Création du build de développement
create_dev_build() {
  echo -e "${YELLOW}Création du build de développement...${NC}"
  npx expo prebuild --clean
  echo -e "${GREEN}Build de développement créé${NC}"
}

# Menu principal
while true; do
  echo -e "\n${YELLOW}=== Menu NPC Social Sim ===${NC}"
  echo -e "${GREEN}Mode Développement:${NC}"
  echo "1) Installation complète avec dev client (première fois)"
  echo "2) Démarrer sur LAN (développement)"
  echo "3) Démarrer sur localhost"
  echo "4) Démarrer avec Tunnel"
  echo "5) Recréer le build de développement"
  echo "6) Quitter"
  read -p "Choix (1-6): " choice

  case $choice in
    1)
      check_env
      install_deps
      setup_dev_project
      create_dev_build
      echo -e "${GREEN}Installation terminée. Choisissez l'option 2 pour démarrer en développement.${NC}"
      ;;
    2)
      check_env
      echo -e "${YELLOW}Démarrage sur LAN avec Dev Client...${NC}"
      npx expo start --lan --dev-client
      ;;
    3)
      check_env
      echo -e "${YELLOW}Démarrage sur localhost avec Dev Client...${NC}"
      npx expo start --localhost --dev-client
      ;;
    4)
      check_env
      setup_tunnel
      echo -e "${YELLOW}Démarrage avec tunnel et Dev Client...${NC}"
      export EXPO_TUNNEL_SUBDOMAIN=npc-social-sim-$(date +%s)
      npx expo start --tunnel --dev-client
      ;;
    5)
      check_env
      create_dev_build
      ;;
    6)
      echo -e "${GREEN}Au revoir !${NC}"
      exit 0
      ;;
    *)
      echo -e "${RED}Choix invalide${NC}"
      ;;
  esac
done