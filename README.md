# 📱 LycéePad

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/nozap271206-web/LyceePad-APP)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Android-brightgreen.svg)](https://cordova.apache.org/)

> Application mobile interactive de visite guidée du Lycée Polyvalent Saint-Éloi d'Aix-en-Provence

## 📌 À propos

**LycéePad** est une application mobile (Android/PWA) permettant une visite interactive et autonome du lycée grâce à :
- 🗺️ Une carte interactive avec géolocalisation
- 📷 Des QR codes pour accéder aux contenus des zones
- 🎬 Des contenus multimédias (photos, vidéos, textes)
- 📱 Un fonctionnement hors-ligne
- 🎯 Des quiz pédagogiques

Inspiré des **HistoPad** utilisés dans les musées et châteaux.

## ✨ Fonctionnalités

- ✅ **Carte interactive** : Navigation visuelle du lycée avec Leaflet.js
- ✅ **Scanner QR** : Accès instantané aux contenus des zones
- ✅ **Mode hors-ligne** : Synchronisation locale avec SQLite
- ✅ **Quiz interactifs** : Évaluation des connaissances
- ✅ **Administration** : Interface de gestion des contenus
- ✅ **Multi-profils** : Contenus adaptés (élève, parent, visiteur)

## 🛠️ Stack technique

### Frontend
- **Cordova** : Framework mobile multi-plateforme
- **HTML5/CSS3/JavaScript** : Technologies web natives
- **Leaflet.js** : Cartographie interactive
- **html5-qrcode** : Scanner QR codes

### Backend & Données
- **PHP** : API REST pour synchronisation
- **MySQL** : Base de données serveur
- **SQLite** : Stockage local mobile

### Outils de développement
- **Git/GitHub** : Gestion de version
- **Android Studio** : Build Android
- **PowerShell** : Scripts de déploiement automatisé

## 🚀 Installation et démarrage

### Prérequis
```bash
Node.js >= 14.x
Cordova CLI >= 11.x
Android SDK
JDK 11+
```

### Installation
```bash
# Cloner le projet
git clone https://github.com/nozap271206-web/LyceePad-APP.git
cd LyceePad-APP

# Installer les dépendances
npm install

# Ajouter la plateforme Android
cordova platform add android

# Lancer en mode développement
cordova run android
```

### Build de production
```bash
# Build APK signé
cordova build android --release

# L'APK se trouve dans platforms/android/app/build/outputs/apk/release/
```

## 📚 Documentation

- 📖 [Guide d'administration](docs/guides/GUIDE_ADMIN.md)
- 🔐 [Guide d'authentification](docs/guides/GUIDE_AUTHENTIFICATION.md)
- 📷 [Guide QR Codes](docs/guides/GUIDE_QR_CODES.md)
- 🚀 [Guide de déploiement](docs/deployment/RESUME_DEPLOIEMENT.md)
- 🔗 [Configuration Webhook](docs/deployment/GUIDE_WEBHOOK_SIMPLIFIE.md)

## 🤝 Contribution

Veuillez consulter [CONTRIBUTING.md](CONTRIBUTING.md) pour connaître :
- La stratégie de branches (Git Flow)
- Les conventions de code
- Le processus de Pull Request

## 📋 Structure du projet

```
LyceePad/
├── www/                    # Code source application
│   ├── index.html         # Point d'entrée
│   ├── css/              # Feuilles de style
│   ├── js/               # Scripts JavaScript
│   ├── html/             # Pages HTML
│   ├── data/             # Données JSON locales
│   └── API/              # Scripts PHP serveur
├── platforms/            # Plateformes Cordova (générées)
├── plugins/              # Plugins Cordova
├── res/                  # Ressources (icônes, splash)
├── docs/                 # Documentation
└── scripts/              # Scripts utilitaires
```

## 📄 Licence

Ce projet est sous licence Apache 2.0 - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Auteurs

Développé par les étudiants du Lycée Polyvalent Saint-Éloi dans le cadre d'un projet pédagogique.

---

**Note** : Cette application est destinée à un usage interne au lycée.
-   Redémarrage automatique du serveur\
-   Tests post-déploiement

------------------------------------------------------------------------

## 🔍 Tests et qualité

-   Tests navigateurs (Chrome, Firefox)\
-   Tests API (Postman)\
-   Tests PWA (mode hors ligne, installation)\
-   Audit Lighthouse (performance, accessibilité, conformité PWA)

------------------------------------------------------------------------

## 🎓 Contexte pédagogique

-   BTS CIEL -- Option Informatique et Réseaux\
-   Épreuve E6-2 : Valorisation de la donnée et cybersécurité\
-   Projet interne -- Lycée Saint-Éloi\
-   Session 2026

------------------------------------------------------------------------

## 📜 Licence

Projet pédagogique -- Usage interne au Lycée Saint-Éloi.
