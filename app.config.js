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
    extra: {
    eas: {
      projectId: "pnj-jay"
    }
  },
  plugins: [
    "expo-dev-client",
    "expo-image-picker",
    "expo-notifications",
    [
      "expo-build-properties",
      {
        "ios": {
          "newArchEnabled": true
        },
        "android": {
          "newArchEnabled": true
        }
      }
    ]
  ]
  }
};
