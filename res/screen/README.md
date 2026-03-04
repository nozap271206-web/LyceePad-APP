# 🎨 Splash Screen - Configuration et Personnalisation

## ✅ Configuration actuelle (Méthode Android 12+ moderne)

Votre splash screen utilise maintenant la **nouvelle API Android 12+** ! 

### Paramètres actuels :
- 🎨 **Icône** : www/img/logo.png
- 🌈 **Couleur de fond** : Bleu (#3b82f6)
- ⏱️ **Durée d'affichage** : 3 secondes
- 🚫 **Spinner de chargement** : Désactivé
- ✨ **API moderne** : AndroidWindowSplashScreenAnimatedIcon

---

## 📁 Fichiers importants

### Image SVG de base
`res/screen/splashscreen-template.svg` - Modèle personnalisable avec :
- Logo hexagonal LycéePad
- Fond dégradé bleu/violet
- Texte "Lycée Saint-Éloi"
- Animation de chargement

### Configuration
`config.xml` - Préférences et chemins des images

---

## 🎨 Comment personnaliser la splash screen

### Option 1 : Créer des images PNG professionnelles (Recommandé)

#### Dimensions requises pour Android :

**Portrait (vertical)** :
- `ldpi` : 200 × 320 px
- `mdpi` : 320 × 480 px
- `hdpi` : 480 × 800 px
- `xhdpi` : 720 × 1280 px ⭐ (le plus commun)
- `xxhdpi` : 960 × 1600 px
- `xxxhdpi` : 1280 × 1920 px ⭐ (haute résolution)

**Landscape (horizontal)** :
- Même principe avec largeur/hauteur inversées

#### Étapes :

1. **Personnaliser le SVG** :
   - Ouvrir `res/screen/splashscreen-template.svg` dans un éditeur (Inkscape, Figma, Adobe Illustrator)
   - Modifier les couleurs, le texte, ajouter votre logo
   - Sauvegarder

2. **Convertir en PNG** :
   
   **Méthode A - Outil en ligne** (le plus simple) :
   - Aller sur https://cloudconvert.com/svg-to-png
   - Uploader votre SVG
   - Définir la largeur à 1280px pour xxxhdpi
   - Télécharger et renommer en `splash-port-xxxhdpi.png`
   - Répéter pour les autres tailles

   **Méthode B - Inkscape** (gratuit) :
   - Ouvrir le SVG
   - Fichier → Exporter en PNG
   - Définir la largeur (1280px pour xxxhdpi)
   - Exporter

   **Méthode C - ImageMagick** (ligne de commande) :
   ```powershell
   magick splashscreen-template.svg -resize 1280x1920 splash-port-xxxhdpi.png
   magick splashscreen-template.svg -resize 720x1280 splash-port-xhdpi.png
   magick splashscreen-template.svg -resize 480x800 splash-port-hdpi.png
   ```

3. **Placer les images** :
   - Créer les fichiers dans `res/screen/android/`
   - Nommer selon le format : `splash-port-xxxhdpi.png`, `splash-land-xhdpi.png`, etc.

4. **Mettre à jour config.xml** :
   ```xml
   <splash src="res/screen/android/splash-port-xxxhdpi.png" density="port-xxxhdpi" />
   <splash src="res/screen/android/splash-port-xhdpi.png" density="port-xhdpi" />
   <!-- etc. -->
   ```

### Option 2 : Utiliser votre image actuelle (Temporaire - déjà fait)

Le logo actuel (`www/img/logo.png`) est déjà configuré comme splash screen.
Cela fonctionne mais peut être déformé selon les écrans.

---

## 🚀 Tester la splash screen

1. **Recompiler l'application** :
   ```powershell
   cordova build android
   ```

2. **Installer sur un appareil/émulateur** :
   ```powershell
   cordova run android
   ```

3. La splash screen devrait apparaître pendant 3 secondes au démarrage !

---

## ⚙️ Modifier les paramètres

Dans `config.xml`, vous pouvez ajuster :

```xml
<!-- Icône de la splash screen (PNG recommandé, 288x288px) -->
<preference name="AndroidWindowSplashScreenAnimatedIcon" value="www/img/logo.png" />

<!-- Couleur de fond (format hexadécimal) -->
<preference name="AndroidWindowSplashScreenBackground" value="#3b82f6" />

<!-- Couleur de fond de l'icône -->
<preference name="AndroidWindowSplashScreenIconBackgroundColor" value="#3b82f6" />

<!-- Durée d'affichage (en millisecondes) -->
<preference name="SplashScreenDelay" value="3000" />

<!-- Afficher le spinner de chargement (true/false) -->
<preference name="ShowSplashScreenSpinner" value="false" />
```

### 🎨 Conseils pour l'icône :
- **Taille recommandée** : 288x288 pixels (format PNG)
- **Format** : Carré avec transparence
- **Couleurs** : Utilisez une couleur de fond assortie à votre app
- L'icône sera centrée automatiquement

---

## 🎨 Conseils de design

1. **Zone de sécurité** : Gardez le contenu important au centre (éviter les bords)
2. **Couleurs** : Utilisez des couleurs cohérentes avec votre app
3. **Texte** : Lisible, pas trop petit
4. **Logo** : Centré, taille adaptée
5. **Fond** : Uni ou dégradé subtil (éviter les patterns complexes)

---

## 📝 Checklist finale

- [ ] SVG personnalisé créé
- [ ] Images PNG générées aux bonnes dimensions
- [ ] Images placées dans `res/screen/android/`
- [ ] `config.xml` mis à jour avec les bons chemins
- [ ] Application recompilée
- [ ] Splash screen testée sur un appareil

---

## 🆘 Problèmes courants

**La splash screen ne s'affiche pas** :
- Vérifier que le plugin est bien installé : `cordova plugin list`
- Recompiler complètement : `cordova clean && cordova build android`

**L'image est déformée** :
- Activer `SplashMaintainAspectRatio` dans config.xml
- Créer des images spécifiques pour portrait et landscape

**La splash screen dure trop longtemps** :
- Réduire `SplashScreenDelay` dans config.xml
- Ou masquer manuellement : `navigator.splashscreen.hide()` dans votre code

---

**Créé le 3 mars 2026** - Projet LycéePad BTS CIEL
