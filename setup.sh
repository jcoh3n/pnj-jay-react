#!/bin/bash

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Fonctions utilitaires
log() { echo -e "${BLUE}$1${NC}"; }
success() { echo -e "${GREEN}$1${NC}"; }
warn() { echo -e "${YELLOW}$1${NC}"; }
error() { echo -e "${RED}$1${NC}"; }

# Vérification de l'environnement
check_env() {
  warn "Vérification de l'environnement..."
  if ! command -v node &> /dev/null; then
    error "Node.js n'est pas installé"
    exit 1
  fi
  success "Environnement OK"
}

# Nettoyage rapide
quick_clean() {
  warn "Nettoyage rapide..."
  watchman watch-del-all &>/dev/null
  rm -rf $TMPDIR/react-* &>/dev/null
  rm -rf $TMPDIR/metro-* &>/dev/null
  success "Nettoyage terminé"
}

# Nettoyage complet
deep_clean() {
  warn "Nettoyage complet..."
  quick_clean
  rm -rf node_modules
  rm -rf ios/Pods
  rm -rf ios/build
  rm -rf android/build
  rm -rf android/app/build
  npm cache clean --force
  success "Nettoyage complet terminé"
}

# Installation des dépendances
install_deps() {
  warn "Installation des dépendances..."
  npm install --force
  npx expo install expo-dev-client
  npm install --save-dev react-native-svg-transformer
  success "Dépendances installées"
}

# Démarrage du dev client
start_dev() {
  local mode=$1
  quick_clean
  case $mode in
    "lan") npx expo start --lan --dev-client ;;
    "local") npx expo start --localhost --dev-client ;;
    "tunnel") 
      export EXPO_TUNNEL_SUBDOMAIN=npc-social-sim-$(date +%s)
      npx expo start --tunnel --dev-client 
      ;;
  esac
}

# Menu rapide
show_menu() {
  echo -e "\n${YELLOW}=== NPC Social Sim Dev Tools ===${NC}"
  echo "1) 🚀 Démarrer LAN (dev quotidien)"
  echo "2) 🧹 Nettoyage rapide + Démarrer"
  echo "3) 🔄 Clean install + Démarrer"
  echo "4) 🌐 Démarrer avec Tunnel"
  echo "5) 🧪 Tests"
  echo "6) 📱 Build dev iOS"
  echo "7) 🤖 Build dev Android"
  echo "q) Quitter"
}

# Menu principal
while true; do
  show_menu
  read -p "Choix: " choice

  case $choice in
    1) start_dev "lan" ;;
    2) 
      quick_clean
      start_dev "lan"
      ;;
    3)
      deep_clean
      install_deps
      start_dev "lan"
      ;;
    4) start_dev "tunnel" ;;
    5) npm test ;;
    6) 
      quick_clean
      npx expo run:ios
      ;;
    7)
      quick_clean
      npx expo run:android
      ;;
    q|Q) exit 0 ;;
    *) error "Choix invalide" ;;
  esac
done