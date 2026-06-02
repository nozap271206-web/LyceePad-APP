<?php
/**
 * API zones - LycéePad
 * GET : retourne toutes les zones actives (BDD → fallback qr-data.json)
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

/* ── Tentative de connexion MySQL ──────────────────────────────────────────── */
$pdo = null;
try {
    require_once __DIR__ . '/config.php'; // définit DB_HOST, DB_NAME, DB_USER, DB_PASS
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER, DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT            => 3,
        ]
    );
} catch (Exception $e) {
    $pdo = null; // BDD indisponible, on utilisera le fallback JSON
}

/* ── Source : base de données ──────────────────────────────────────────────── */
if ($pdo) {
    try {
        $stmt = $pdo->query(
            "SELECT id_zone, qr_code, nom_zone, description,
                    batiment, etage, coordonnees_gps,
                    ordre_affichage, actif
             FROM zones
             WHERE actif = 1
             ORDER BY ordre_affichage ASC"
        );
        $rows = $stmt->fetchAll();

        $zones = array_map(function ($z) {
            $coords = null;
            if (!empty($z['coordonnees_gps'])) {
                $parsed = json_decode($z['coordonnees_gps'], true);
                if ($parsed && isset($parsed['lat'], $parsed['lng'])) {
                    $coords = ['lat' => (float)$parsed['lat'], 'lng' => (float)$parsed['lng']];
                }
            }
            return [
                'id'          => (int)$z['id_zone'],
                'qr_code'     => $z['qr_code'],
                'nom'         => $z['nom_zone'],
                'description' => $z['description'] ?? '',
                'batiment'    => $z['batiment'] ?? '',
                'etage'       => $z['etage'] ?? '',
                'ordre'       => (int)$z['ordre_affichage'],
                'actif'       => true,
                'coordonnees' => $coords,
            ];
        }, $rows);

        echo json_encode(['success' => true, 'source' => 'db', 'data' => $zones]);
        exit;

    } catch (Exception $e) {
        // Requête échouée, on tombe dans le fallback
    }
}

/* ── Fallback : qr-data.json ───────────────────────────────────────────────── */
$jsonPath = __DIR__ . '/../data/qr-data.json';
if (file_exists($jsonPath)) {
    $raw   = json_decode(file_get_contents($jsonPath), true);
    $zones = array_values($raw['zones'] ?? []);
    $zones = array_filter($zones, fn($z) => ($z['actif'] ?? true) !== false);
    usort($zones, fn($a, $b) => (int)($a['ordre'] ?? 0) - (int)($b['ordre'] ?? 0));

    // Normaliser les noms de champs (qr-data.json utilise "coordonnees" pas "coordonnees_gps_*")
    $zones = array_map(function ($z) {
        return [
            'id'          => $z['id'] ?? null,
            'qr_code'     => $z['qr_code'] ?? '',
            'nom'         => $z['nom'] ?? '',
            'description' => $z['description'] ?? '',
            'batiment'    => $z['batiment'] ?? '',
            'etage'       => $z['etage'] ?? '',
            'ordre'       => (int)($z['ordre'] ?? 0),
            'actif'       => true,
            'coordonnees' => $z['coordonnees'] ?? null,
            'image'       => $z['image'] ?? null,
        ];
    }, array_values($zones));

    echo json_encode(['success' => true, 'source' => 'json', 'data' => $zones]);
} else {
    http_response_code(503);
    echo json_encode(['success' => false, 'message' => 'Aucune source de données disponible']);
}
