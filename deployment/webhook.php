<?php
/**
 * GitHub Webhook Handler pour LyceePad
 * Ce fichier reçoit les notifications de GitHub et déclenche le déploiement
 */

// Configuration
define('SECRET_TOKEN', 'CHANGEZ_CE_TOKEN_SECRET'); // À changer avec un token sécurisé
define('DEPLOY_SCRIPT', __DIR__ . '/deploy.sh'); // Chemin vers le script de déploiement
define('LOG_FILE', __DIR__ . '/webhook.log'); // Fichier de log

// Fonction de log
function logMessage($message) {
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[{$timestamp}] {$message}\n";
    file_put_contents(LOG_FILE, $logEntry, FILE_APPEND);
}

// Vérification de la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    logMessage('ERROR: Méthode non autorisée');
    die('Method Not Allowed');
}

// Récupération du payload
$payload = file_get_contents('php://input');
$event = isset($_SERVER['HTTP_X_GITHUB_EVENT']) ? $_SERVER['HTTP_X_GITHUB_EVENT'] : '';

// Vérification de la signature GitHub
$signature = isset($_SERVER['HTTP_X_HUB_SIGNATURE_256']) ? $_SERVER['HTTP_X_HUB_SIGNATURE_256'] : '';
$expectedSignature = 'sha256=' . hash_hmac('sha256', $payload, SECRET_TOKEN);

if (!hash_equals($expectedSignature, $signature)) {
    http_response_code(403);
    logMessage('ERROR: Signature invalide');
    die('Invalid signature');
}

// Décodage du payload
$data = json_decode($payload, true);

// Vérification que c'est un événement push
if ($event !== 'push') {
    logMessage("INFO: Événement ignoré: {$event}");
    http_response_code(200);
    echo json_encode(['status' => 'ignored', 'event' => $event]);
    exit;
}

// Vérification de la branche (seulement main)
$branch = isset($data['ref']) ? str_replace('refs/heads/', '', $data['ref']) : '';
if ($branch !== 'main') {
    logMessage("INFO: Branche ignorée: {$branch}");
    http_response_code(200);
    echo json_encode(['status' => 'ignored', 'branch' => $branch]);
    exit;
}

// Log des informations du push
$pusher = isset($data['pusher']['name']) ? $data['pusher']['name'] : 'unknown';
$commits = isset($data['commits']) ? count($data['commits']) : 0;
logMessage("INFO: Push reçu de {$pusher} avec {$commits} commit(s)");

// Exécution du script de déploiement
if (!file_exists(DEPLOY_SCRIPT)) {
    http_response_code(500);
    logMessage("ERROR: Script de déploiement non trouvé: " . DEPLOY_SCRIPT);
    die('Deploy script not found');
}

// Rendre le script exécutable (pour Linux/Unix)
chmod(DEPLOY_SCRIPT, 0755);

// Exécution du script
$output = [];
$returnCode = 0;
exec(DEPLOY_SCRIPT . ' 2>&1', $output, $returnCode);

// Log du résultat
$outputStr = implode("\n", $output);
if ($returnCode === 0) {
    logMessage("SUCCESS: Déploiement réussi\n{$outputStr}");
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Deployment successful',
        'output' => $outputStr
    ]);
} else {
    logMessage("ERROR: Déploiement échoué (code: {$returnCode})\n{$outputStr}");
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Deployment failed',
        'code' => $returnCode,
        'output' => $outputStr
    ]);
}
