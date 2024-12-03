#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Chemins Android Studio
ANDROID_HOME="$HOME/Library/Android/sdk"
EMULATOR="$ANDROID_HOME/emulator/emulator"
ADB="$ANDROID_HOME/platform-tools/adb"

check_android_sdk() {
  if [ ! -d "$ANDROID_HOME" ]; then
    echo -e "${RED}Android SDK non trouvé. Installez Android Studio:${NC}"
    echo "https://developer.android.com/studio"
    return 1
  fi
  
  export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"
  return 0
}

install_all() {
  npm install || { echo -e "${RED}Erreur npm install${NC}"; exit 1; }
  
  npx expo install expo-dev-client \
    expo-image-picker \
    expo-notifications \
    expo-constants \
    expo-device \
    expo-linking \
    expo-splash-screen \
    expo-status-bar \
    expo-system-ui \
    expo-updates \
    expo-web-browser

  npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs \
    lucide-react-native @react-native-async-storage/async-storage \
    zustand @tanstack/react-query date-fns firebase
}

clean() {
  rm -rf node_modules
  watchman watch-del-all 2>/dev/null
  rm -rf $TMPDIR/react-* 2>/dev/null
  rm -rf $TMPDIR/metro-* 2>/dev/null
  npm install
}

build_ios() {
  npx expo run:ios || { echo -e "${RED}Erreur build iOS${NC}"; exit 1; }
}

check_android_device() {
  if ! check_android_sdk; then
    return 1
  fi

  if ! "$ADB" devices | grep -q "device$"; then
    echo -e "${YELLOW}Aucun appareil Android connecté ou émulateur lancé.${NC}"
    
    avd_list=$("$EMULATOR" -list-avd)
    if [ -z "$avd_list" ]; then
      echo -e "${RED}Aucun émulateur Android configuré.${NC}"
      echo "Créez un émulateur via Android Studio > Device Manager"
      return 1
    fi
    
    echo -e "1) Lancer l'émulateur Android"
    echo -e "2) Retour au menu principal"
    read -p "> " choice
    case $choice in
      1)
        echo -e "Lancement de l'émulateur..."
        first_avd=$("$EMULATOR" -list-avd | head -n 1)
        "$EMULATOR" -avd "$first_avd" &
        echo -e "Attente du démarrage..."
        sleep 15
        ;;
      *) return 1 ;;
    esac
  fi
  return 0
}

build_android() {
  if check_android_device; then
    npx expo run:android || { echo -e "${RED}Erreur build Android${NC}"; exit 1; }
  fi
}

while true; do
  echo -e "\n=== NPC Social Sim ===\n"
  echo "1) 📱 Dev quotidien (start)"
  echo "2) 🧹 Problèmes de cache/build (clean + start)"
  echo "3) 📥 Premier clone / nouvelles dépendances (full install)"
  echo "4) 🔄 Tests externes (tunnel)"
  echo "5) 🍎 Build iOS"
  echo "6) 🤖 Build Android"
  echo "7) ❌ Quitter"
  read -p "> " choice

  case $choice in
    1) npx expo start --lan ;;
    2) 
      clean
      npx expo start --lan ;;
    3) 
      clean
      install_all
      npx expo start --lan ;;
    4) 
      export EXPO_TUNNEL_SUBDOMAIN=npc-social-sim-$(date +%s)
      npx expo start --tunnel ;;
    5) build_ios ;;
    6) build_android ;;
    7) exit 0 ;;
    *) echo -e "${RED}Choix invalide${NC}" ;;
  esac
done