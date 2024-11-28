# NPC Social Sim

Application de chat social développée avec React Native et Expo.

## Installation

1. Cloner le repository
```bash
git clone [votre-repo]
cd npc-social-sim
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env
# Remplir .env avec vos valeurs
```

4. Démarrer le projet
```bash
npx expo start
```

## Technologies utilisées

- React Native
- Expo
- TypeScript
- Firebase
- React Navigation
- Zustand
- React Query

## Structure du projet

```
src/
├── components/    # Composants réutilisables
├── screens/       # Écrans de l'application
├── navigation/    # Configuration de la navigation
├── services/      # Services (Firebase, API)
├── stores/        # État global (Zustand)
├── hooks/         # Hooks personnalisés
├── utils/         # Fonctions utilitaires
├── constants/     # Constantes et configuration
└── types/         # Types TypeScript
```

## Scripts disponibles

- `npx expo start`: Démarre le serveur de développement
- `npx expo start --ios`: Démarre sur iOS Simulator
- `npx expo start --android`: Démarre sur Android Emulator
- `npx expo build:ios`: Build pour iOS
- `npx expo build:android`: Build pour Android

## Versioning

Le projet suit la spécification [Semantic Versioning](https://semver.org/).
