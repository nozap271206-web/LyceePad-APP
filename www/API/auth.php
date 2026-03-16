<?php
/**
 * API d'authentification admin - LyceePad
 * Colonne identifiant : email
 * Colonne mot de passe : mot_de_passe (bcrypt)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['email']) || empty($input['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email et mot de passe requis']);
    exit;
}

$email    = trim($input['email']);
$password = $input['password'];

$pdo  = getDB();
$stmt = $pdo->prepare('SELECT * FROM utilisateurs WHERE email = ? AND actif = 1 LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Identifiants invalides']);
    exit;
}

if (!password_verify($password, $user['mot_de_passe'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Identifiants invalides']);
    exit;
}

// Mettre à jour la date de dernière connexion
$pdo->prepare('UPDATE utilisateurs SET derniere_connexion = NOW() WHERE id_utilisateur = ?')
    ->execute([$user['id_utilisateur']]);

echo json_encode([
    'success'  => true,
    'user'     => [
        'id'     => $user['id_utilisateur'],
        'nom'    => $user['nom'],
        'prenom' => $user['prenom'],
        'email'  => $user['email'],
        'role'   => $user['role'],
    ]
]);
