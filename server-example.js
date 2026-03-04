const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Base de données fictive (à remplacer par MySQL)
const zones = {
  "QR_CDI_001": {
    id: 1,
    nom: "Centre de Documentation et d'Information",
    description: "Le CDI est un espace de travail et de recherche documentaire ouvert à tous les élèves. Vous y trouverez des livres, magazines, ordinateurs et un espace calme pour étudier.",
    batiment: "Bâtiment Principal",
    etage: "Rez-de-chaussée",
    qr_code: "QR_CDI_001",
    medias: [
      { type: "image", url: "https://via.placeholder.com/800x600/3b82f6/ffffff?text=CDI" },
      { type: "video", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" }
    ],
    horaires: "Lundi-Vendredi: 8h-17h"
  },
  "QR_CAFET_001": {
    id: 2,
    nom: "Cafétéria",
    description: "Espace de restauration pour les élèves et le personnel. Menus variés et équilibrés proposés chaque jour.",
    batiment: "Bâtiment Principal",
    etage: "Rez-de-chaussée",
    qr_code: "QR_CAFET_001",
    medias: [
      { type: "image", url: "https://via.placeholder.com/800x600/8b5cf6/ffffff?text=Cafeteria" }
    ],
    horaires: "Lundi-Vendredi: 8h-16h"
  },
  "QR_SUD_05": {
    id: 3,
    nom: "Atelier Électronique Sud 05",
    description: "Atelier équipé pour les travaux pratiques en électronique. Oscilloscopes, générateurs de signaux et composants disponibles.",
    batiment: "Bâtiment Sud",
    etage: "Rez-de-chaussée",
    qr_code: "QR_SUD_05",
    medias: [
      { type: "image", url: "https://via.placeholder.com/800x600/10b981/ffffff?text=Atelier+Electronique" }
    ],
    horaires: "Selon planning des cours"
  },
  "QR_SUD_06": {
    id: 4,
    nom: "Salle de cours Sud 06",
    description: "Salle de cours théorique équipée de vidéoprojecteur et tableau interactif.",
    batiment: "Bâtiment Sud",
    etage: "Rez-de-chaussée",
    qr_code: "QR_SUD_06",
    medias: [],
    horaires: "Selon planning des cours"
  },
  "QR_SUD_07": {
    id: 5,
    nom: "Salle de cours Sud 07",
    description: "Salle de cours théorique pour les formations BTS et Bac Pro.",
    batiment: "Bâtiment Sud",
    etage: "Rez-de-chaussée",
    qr_code: "QR_SUD_07",
    medias: [],
    horaires: "Selon planning des cours"
  },
  "QR_SUD_08": {
    id: 6,
    nom: "Salle informatique Sud 08",
    description: "Salle équipée de 30 postes informatiques pour les cours de programmation et systèmes.",
    batiment: "Bâtiment Sud",
    etage: "Rez-de-chaussée",
    qr_code: "QR_SUD_08",
    medias: [
      { type: "image", url: "https://via.placeholder.com/800x600/f59e0b/ffffff?text=Salle+Info" }
    ],
    horaires: "Selon planning des cours"
  },
  "QR_SUD_09": {
    id: 7,
    nom: "Salle de cours Sud 09",
    description: "Salle polyvalente adaptée aux cours théoriques et aux travaux dirigés.",
    batiment: "Bâtiment Sud",
    etage: "Rez-de-chaussée",
    qr_code: "QR_SUD_09",
    medias: [],
    horaires: "Selon planning des cours"
  },
  "QR_LABO_SUD": {
    id: 8,
    nom: "Laboratoire Sud",
    description: "Laboratoire pour les expériences en sciences physiques et chimie. Équipements de sécurité conformes.",
    batiment: "Bâtiment Sud",
    etage: "1er étage",
    qr_code: "QR_LABO_SUD",
    medias: [
      { type: "image", url: "https://via.placeholder.com/800x600/ef4444/ffffff?text=Laboratoire" }
    ],
    horaires: "Selon planning des cours"
  },
  "QR_FB_10": {
    id: 9,
    nom: "Foyer Bâtiment 10",
    description: "Espace de détente pour les élèves. Baby-foot, distributeurs automatiques et canapés disponibles.",
    batiment: "Bâtiment 10",
    etage: "Rez-de-chaussée",
    qr_code: "QR_FB_10",
    medias: [
      { type: "image", url: "https://via.placeholder.com/800x600/6366f1/ffffff?text=Foyer" }
    ],
    horaires: "8h-18h"
  }
};

// ===== ROUTE PRINCIPALE : Récupérer une zone par QR Code =====
app.get('/api/zone/:code', (req, res) => {
  const qrCode = req.params.code;
  console.log(`[${new Date().toLocaleTimeString()}] 🔍 Recherche zone: ${qrCode}`);
  
  const zone = zones[qrCode];
  
  if (zone) {
    console.log(`[${new Date().toLocaleTimeString()}] ✅ Zone trouvée: ${zone.nom}`);
    res.json(zone);
  } else {
    console.log(`[${new Date().toLocaleTimeString()}] ❌ Zone non trouvée: ${qrCode}`);
    res.status(404).json({ 
      error: 'Zone non trouvée',
      code: qrCode,
      suggestion: 'Vérifiez que le QR code est valide'
    });
  }
});

// ===== ROUTE DE TEST =====
app.get('/api/test', (req, res) => {
  console.log(`[${new Date().toLocaleTimeString()}] 🧪 Test API appelé`);
  res.json({ 
    status: 'OK',
    message: 'API LycéePad fonctionne parfaitement !',
    timestamp: new Date().toISOString(),
    zones_disponibles: Object.keys(zones).length,
    codes_qr: Object.keys(zones)
  });
});

// ===== ROUTE : Lister toutes les zones =====
app.get('/api/zones', (req, res) => {
  console.log(`[${new Date().toLocaleTimeString()}] 📋 Liste de toutes les zones demandée`);
  res.json({
    total: Object.keys(zones).length,
    zones: Object.values(zones)
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    nom: 'API LycéePad',
    version: '1.0.0',
    routes: [
      'GET /api/test - Tester l\'API',
      'GET /api/zones - Lister toutes les zones',
      'GET /api/zone/:code - Récupérer une zone par QR code'
    ]
  });
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.clear();
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║   🚀 Serveur API LycéePad démarré !           ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  
  console.log(`📍 URL locale:  http://localhost:${PORT}`);
  console.log(`📍 URL réseau:  http://VOTRE_IP:${PORT}`);
  console.log(`⏰ Démarrage:   ${new Date().toLocaleString()}\n`);
  
  console.log('✅ Routes disponibles:');
  console.log(`   • GET /api/test`);
  console.log(`   • GET /api/zones`);
  console.log(`   • GET /api/zone/:code\n`);
  
  console.log(`🔍 ${Object.keys(zones).length} zones QR disponibles:`);
  Object.keys(zones).forEach(code => {
    console.log(`   • ${code} → ${zones[code].nom}`);
  });
  
  console.log('\n⚠️  N\'oubliez pas de modifier l\'IP dans l\'app mobile !');
  console.log('📖 Voir: GUIDE_QR_CODES.md\n');
  console.log('🛑 Appuyez sur CTRL+C pour arrêter le serveur\n');
});

// Gestion de l'arrêt propre du serveur
process.on('SIGINT', () => {
  console.log('\n\n🛑 Arrêt du serveur...');
  process.exit(0);
});
