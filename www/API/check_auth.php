<?php
/**
 * Vérification token API - LyceePad
 * Inclure ce fichier et appeler requireApiAuth() pour protéger un endpoint.
 */

function requireApiAuth() {
    // Récupérer le header Authorization (compatible Apache + Nginx)
    $auth = '';
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }
    if (!$auth) {
        $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    }

    if (!preg_match('/^Bearer\s+(\S+)$/i', $auth, $matches)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authentification requise']);
        exit;
    }

    $token = $matches[1];

    require_once __DIR__ . '/config.php';

    try {
        $pdo  = getDB();
        $stmt = $pdo->prepare(
            'SELECT id_utilisateur FROM sessions WHERE token = ? AND expires_at > NOW()'
        );
        $stmt->execute([$token]);
        $session = $stmt->fetch();

        if (!$session) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Token invalide ou expiré']);
            exit;
        }

        return (int) $session['id_utilisateur'];

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erreur vérification auth']);
        exit;
    }
}
