<?php
/**
 * API Parcours - LyceePad
 * Fournit les profils visiteurs, parcours et zones associées
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/config.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';
$pdo    = getDB();

switch ($action) {

    // ── Liste des profils visiteurs ──────────────────────────────────────────
    case 'profils':
        $stmt = $pdo->query('SELECT * FROM profils_visiteurs ORDER BY id_profil');
        echo json_encode(['success' => true, 'profils' => $stmt->fetchAll()]);
        break;

    // ── Parcours disponibles (tous ou filtrés par profil) ────────────────────
    case 'parcours':
        $profilId = isset($_GET['profil_id']) ? (int)$_GET['profil_id'] : null;

        if ($profilId) {
            $stmt = $pdo->prepare(
                'SELECT p.*, pr.nom_profil, pr.couleur, pr.icon
                 FROM parcours p
                 JOIN profils_visiteurs pr ON p.id_profil = pr.id_profil
                 WHERE p.id_profil = ? AND p.actif = 1
                 ORDER BY p.nom_parcours'
            );
            $stmt->execute([$profilId]);
        } else {
            $stmt = $pdo->query(
                'SELECT p.*, pr.nom_profil, pr.couleur, pr.icon
                 FROM parcours p
                 JOIN profils_visiteurs pr ON p.id_profil = pr.id_profil
                 WHERE p.actif = 1
                 ORDER BY pr.id_profil, p.nom_parcours'
            );
        }

        echo json_encode(['success' => true, 'parcours' => $stmt->fetchAll()]);
        break;

    // ── Zones d'un parcours dans l'ordre de visite ───────────────────────────
    case 'zones':
        $parcoursId = isset($_GET['parcours_id']) ? (int)$_GET['parcours_id'] : 0;
        if (!$parcoursId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'parcours_id manquant']);
            break;
        }

        $stmt = $pdo->prepare(
            'SELECT z.id_zone, z.nom_zone, z.description, z.qr_code,
                    z.batiment, z.etage, z.image_principale,
                    pz.ordre_visite
             FROM parcours_zones pz
             JOIN zones z ON pz.id_zone = z.id_zone
             WHERE pz.id_parcours = ? AND z.actif = 1
             ORDER BY pz.ordre_visite ASC'
        );
        $stmt->execute([$parcoursId]);

        echo json_encode(['success' => true, 'zones' => $stmt->fetchAll()]);
        break;

    // ── Tout en une seule requête (pour la page parcours) ────────────────────
    case 'all':
        $profils = $pdo->query('SELECT * FROM profils_visiteurs ORDER BY id_profil')->fetchAll();

        foreach ($profils as &$profil) {
            $stmt = $pdo->prepare(
                'SELECT p.id_parcours, p.nom_parcours, p.description, p.duree_estimee
                 FROM parcours p
                 WHERE p.id_profil = ? AND p.actif = 1
                 ORDER BY p.nom_parcours'
            );
            $stmt->execute([$profil['id_profil']]);
            $profil['parcours'] = $stmt->fetchAll();

            foreach ($profil['parcours'] as &$parcours) {
                $stmt2 = $pdo->prepare(
                    'SELECT z.id_zone, z.nom_zone, z.description, z.qr_code,
                            z.batiment, z.etage, pz.ordre_visite
                     FROM parcours_zones pz
                     JOIN zones z ON pz.id_zone = z.id_zone
                     WHERE pz.id_parcours = ? AND z.actif = 1
                     ORDER BY pz.ordre_visite ASC'
                );
                $stmt2->execute([$parcours['id_parcours']]);
                $parcours['zones'] = $stmt2->fetchAll();
            }
        }

        echo json_encode(['success' => true, 'data' => $profils]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Action invalide. Utilisez: profils, parcours, zones, all']);
}
