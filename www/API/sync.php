<?php
/**
 * API de synchronisation - LyceePad
 * Reçoit les données de la tablette et met à jour la base MySQL + fichiers JSON
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gérer les requêtes OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Configuration base de données
require_once __DIR__ . '/config.php';

// Chemins des fichiers
define('DATA_DIR', __DIR__ . '/../data/');
define('QR_DATA_FILE', DATA_DIR . 'qr-data.json');
define('VERSION_FILE', DATA_DIR . 'db-version.json');

/**
 * Connexion à la base de données
 */
function getDBConnection() {
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        error_log("Erreur connexion BDD: " . $e->getMessage());
        return null;
    }
}

/**
 * Mettre à jour une zone dans MySQL
 */
function updateZoneInDB($pdo, $zone) {
    try {
        // Vérifier si la zone existe
        $stmt = $pdo->prepare("SELECT id_zone FROM zones WHERE qr_code = ?");
        $stmt->execute([$zone['qr_code']]);
        $existing = $stmt->fetch();

        $gps = null;
        if (isset($zone['coordonnees_gps']['lat']) && isset($zone['coordonnees_gps']['lng'])) {
            $gps = json_encode(['lat' => $zone['coordonnees_gps']['lat'], 'lng' => $zone['coordonnees_gps']['lng']]);
        }

        if ($existing) {
            // UPDATE
            $sql = "UPDATE zones SET
                    nom_zone = ?,
                    batiment = ?,
                    etage = ?,
                    description = ?,
                    coordonnees_gps = ?,
                    actif = ?,
                    ordre_affichage = ?
                    WHERE qr_code = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $zone['nom'] ?? $zone['nom_zone'] ?? null,
                $zone['batiment'] ?? null,
                $zone['etage'] ?? null,
                $zone['description'] ?? $zone['description_courte'] ?? null,
                $gps,
                isset($zone['actif']) ? ($zone['actif'] ? 1 : 0) : 1,
                $zone['ordre'] ?? $zone['ordre_affichage'] ?? 999,
                $zone['qr_code']
            ]);
        } else {
            // INSERT
            $sql = "INSERT INTO zones (
                    qr_code, nom_zone, batiment, etage, description,
                    coordonnees_gps, actif, ordre_affichage, date_creation
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $zone['qr_code'],
                $zone['nom'] ?? $zone['nom_zone'] ?? null,
                $zone['batiment'] ?? null,
                $zone['etage'] ?? null,
                $zone['description'] ?? $zone['description_courte'] ?? null,
                $gps,
                isset($zone['actif']) ? ($zone['actif'] ? 1 : 0) : 1,
                $zone['ordre'] ?? $zone['ordre_affichage'] ?? 999
            ]);
        }
        
        return true;
    } catch (PDOException $e) {
        error_log("Erreur update zone: " . $e->getMessage());
        return false;
    }
}

/**
 * Régénérer le fichier qr-data.json depuis MySQL
 */
function regenerateJSONFromDB($pdo) {
    try {
        // Récupérer toutes les zones
        $stmt = $pdo->query("SELECT * FROM zones ORDER BY ordre_affichage ASC");
        $zones = $stmt->fetchAll();

        // Récupérer les parcours
        $stmt = $pdo->query("SELECT * FROM parcours");
        $parcours = $stmt->fetchAll();

        // Récupérer les profils
        $stmt = $pdo->query("SELECT * FROM profils_visiteurs");
        $profils = $stmt->fetchAll();

        // Récupérer les types de contenu
        $stmt = $pdo->query("SELECT * FROM types_contenu");
        $typesContenu = $stmt->fetchAll();

        // Construire la structure JSON
        $data = [
            'zones' => [],
            'parcours' => [],
            'profils' => [],
            'types_contenu' => []
        ];

        // Convertir zones
        foreach ($zones as $zone) {
            $gpsData = null;
            if (!empty($zone['coordonnees_gps'])) {
                $parsed = json_decode($zone['coordonnees_gps'], true);
                if ($parsed) $gpsData = $parsed;
            }
            $zoneData = [
                'id' => (int)$zone['id_zone'],
                'qr_code' => $zone['qr_code'],
                'nom' => $zone['nom_zone'],
                'description' => $zone['description'] ?? '',
                'description_courte' => $zone['description'] ?? '',
                'batiment' => $zone['batiment'],
                'etage' => $zone['etage'] ?? null,
                'coordonnees_gps' => $gpsData,
                'ordre' => (int)($zone['ordre_affichage'] ?? 0),
                'actif' => (bool)$zone['actif'],
                'statut' => $zone['actif'] ? 'active' : 'inactive',
                'contenus' => []
            ];

            // Récupérer les contenus de la zone
            $stmt = $pdo->prepare("SELECT * FROM contenus WHERE id_zone = ? ORDER BY ordre_affichage ASC");
            $stmt->execute([$zone['id_zone']]);
            $contenus = $stmt->fetchAll();

            foreach ($contenus as $contenu) {
                $zoneData['contenus'][] = [
                    'id' => (int)$contenu['id_contenu'],
                    'titre' => $contenu['titre'],
                    'description' => $contenu['description'] ?? '',
                    'fichier' => $contenu['fichier_media'] ?? null,
                    'ordre' => (int)($contenu['ordre_affichage'] ?? 0)
                ];
            }

            // Récupérer les médias uploadés depuis le dossier
            $uploadDir = __DIR__ . '/../img/zones/' . $zone['qr_code'] . '/';
            $photos = [];
            $videos = [];
            if (is_dir($uploadDir)) {
                $allowedExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'ogg', 'mov'];
                foreach (scandir($uploadDir) as $f) {
                    if ($f === '.' || $f === '..') continue;
                    $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
                    if (!in_array($ext, $allowedExt)) continue;
                    $finfo = new finfo(FILEINFO_MIME_TYPE);
                    $mime = $finfo->file($uploadDir . $f);
                    $url = '/img/zones/' . $zone['qr_code'] . '/' . $f;
                    if (strpos($mime, 'video') === 0) {
                        $videos[] = $url;
                    } else {
                        $photos[] = $url;
                    }
                }
            }
            $zoneData['photos'] = $photos;
            $zoneData['videos'] = $videos;

            $data['zones'][$zone['qr_code']] = $zoneData;
        }

        // Convertir parcours
        foreach ($parcours as $p) {
            // Récupérer les zones du parcours
            $stmtPZ = $pdo->prepare("SELECT id_zone FROM parcours_zones WHERE id_parcours = ? ORDER BY ordre_visite ASC");
            $stmtPZ->execute([$p['id_parcours']]);
            $zonesIds = array_column($stmtPZ->fetchAll(), 'id_zone');

            $data['parcours'][$p['id_parcours']] = [
                'id' => (int)$p['id_parcours'],
                'nom' => $p['nom_parcours'],
                'description' => $p['description'] ?? '',
                'zones_ids' => $zonesIds
            ];
        }

        // Convertir profils
        foreach ($profils as $p) {
            $data['profils'][$p['nom_profil']] = [
                'nom' => $p['nom_profil'],
                'label' => $p['nom_profil'],
                'description' => $p['description'] ?? '',
                'icone' => $p['icon'] ?? ''
            ];
        }

        // Convertir types de contenu
        foreach ($typesContenu as $tc) {
            $data['types_contenu'][] = [
                'id' => (int)$tc['id_type'],
                'nom' => $tc['nom_type'],
                'label' => $tc['nom_type'],
                'icone' => $tc['icon'] ?? ''
            ];
        }

        // Sauvegarder le JSON
        $jsonData = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        file_put_contents(QR_DATA_FILE, $jsonData);

        return true;
    } catch (Exception $e) {
        error_log("Erreur génération JSON: " . $e->getMessage());
        return false;
    }
}

/**
 * Incrémenter la version
 */
function incrementVersion($currentVersion) {
    $parts = explode('.', $currentVersion);
    $parts[2] = (int)$parts[2] + 1;
    return implode('.', $parts);
}

/**
 * Mettre à jour le fichier de version
 */
function updateVersionFile() {
    try {
        if (file_exists(VERSION_FILE)) {
            $versionData = json_decode(file_get_contents(VERSION_FILE), true);
            $newVersion = incrementVersion($versionData['version']);
        } else {
            $newVersion = '1.0.1';
        }

        $versionData = [
            'version' => $newVersion,
            'release_date' => date('Y-m-d'),
            'description' => 'Mise à jour depuis tablette',
            'changelog' => [
                'Synchronisation depuis tablette admin',
                'Mise à jour le ' . date('Y-m-d H:i:s')
            ],
            'data_file' => 'qr-data.json',
            'size_kb' => round(filesize(QR_DATA_FILE) / 1024)
        ];

        file_put_contents(VERSION_FILE, json_encode($versionData, JSON_PRETTY_PRINT));
        return $newVersion;
    } catch (Exception $e) {
        error_log("Erreur update version: " . $e->getMessage());
        return null;
    }
}

/**
 * Point d'entrée principal
 */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Récupérer les données envoyées
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Données invalides'
        ]);
        exit;
    }

    // Connexion BDD
    $pdo = getDBConnection();
    if (!$pdo) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erreur connexion base de données'
        ]);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // Mettre à jour chaque zone
        $zonesUpdated = 0;
        if (isset($data['zones'])) {
            foreach ($data['zones'] as $qrCode => $zone) {
                if (updateZoneInDB($pdo, $zone)) {
                    $zonesUpdated++;
                }
            }
        }

        $pdo->commit();

        // Régénérer le fichier JSON
        if (regenerateJSONFromDB($pdo)) {
            // Mettre à jour la version
            $newVersion = updateVersionFile();

            echo json_encode([
                'success' => true,
                'message' => 'Synchronisation réussie',
                'stats' => [
                    'zones_updated' => $zonesUpdated,
                    'new_version' => $newVersion
                ]
            ]);
        } else {
            throw new Exception('Erreur génération JSON');
        }

    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erreur: ' . $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Méthode non autorisée'
    ]);
}
