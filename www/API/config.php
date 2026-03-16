<?php
/**
 * Configuration base de données - LyceePad
 *
 * WAMP local  : DB_USER = 'root',          DB_PASS = ''
 * Serveur LAMP: DB_USER = 'lyceepad_user', DB_PASS = 'votre_mot_de_passe'
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'lyceepad');
define('DB_USER', 'root');
define('DB_PASS', '');

function getDB() {
    try {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erreur connexion BDD']);
        exit;
    }
}
