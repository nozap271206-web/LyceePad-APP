<?php
/**
 * formations.php - API formations du lycée
 *
 * GET ?action=all              → toutes les formations actives
 * GET ?action=zones&id=X      → zones liées à la formation X
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once 'config.php';

$action = $_GET['action'] ?? 'all';

try {
    $db = getDB();

    // ── Toutes les formations ────────────────────────────────────────────────
    if ($action === 'all') {
        $stmt = $db->query("
            SELECT id_formation, nom_formation, code_formation, niveau, description, duree
            FROM formations
            WHERE actif = 1
            ORDER BY
              FIELD(niveau, 'CAP', 'Bac Pro', 'Baccalauréat', 'BTS', 'Prépa'),
              nom_formation
        ");
        $formations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $formations]);

    // ── Zones d'une formation ────────────────────────────────────────────────
    } elseif ($action === 'zones') {
        $id = (int)($_GET['id'] ?? 0);
        $stmt = $db->prepare("
            SELECT z.id_zone, z.nom_zone, z.description, z.qr_code, z.batiment, z.etage
            FROM zones z
            INNER JOIN zones_formations zf ON z.id_zone = zf.id_zone
            WHERE zf.id_formation = ? AND z.actif = 1
            ORDER BY z.nom_zone
        ");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

    } else {
        echo json_encode(['success' => false, 'message' => 'Action inconnue']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
