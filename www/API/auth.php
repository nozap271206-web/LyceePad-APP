<?php
// API d'authentification admin - LyceePad
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Config BDD (adapter selon votre config)
define('DB_HOST', 'localhost');
define('DB_NAME', 'lyceepad');
define('DB_USER', 'lyceepad_user');
define('DB_PASS', 'votre_mot_de_passe');

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
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erreur connexion BDD']);
        exit;
    }
}

// Lecture du JSON POST
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['username']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Requête invalide']);
    exit;
}

$username = $input['username'];
$password = $input['password'];

$pdo = getDBConnection();
$stmt = $pdo->prepare('SELECT * FROM utilisateurs WHERE username = ? LIMIT 1');
$stmt->execute([$username]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password'])) {
    echo json_encode(['success' => true, 'username' => $user['username']]);
} else {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Identifiants invalides']);
}
