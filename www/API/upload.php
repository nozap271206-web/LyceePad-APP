<?php
/**
 * API d'upload de médias - LyceePad
 * Reçoit les fichiers images/vidéos depuis la tablette et les enregistre sur le serveur
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, DELETE, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Dossier de stockage des médias (relatif à ce fichier : www/API/ → on remonte vers www/img/zones/)
define('UPLOAD_BASE_DIR', __DIR__ . '/../img/zones/');
define('UPLOAD_BASE_URL', '/img/zones/'); // URL publique relative

// Créer le dossier de base si inexistant
if (!is_dir(UPLOAD_BASE_DIR)) {
    mkdir(UPLOAD_BASE_DIR, 0755, true);
}

/**
 * Valider et nettoyer un nom de fichier
 */
function sanitizeFilename($filename) {
    // Supprimer les caractères dangereux, garder l'extension
    $filename = basename($filename);
    $filename = preg_replace('/[^a-zA-Z0-9._-]/', '_', $filename);
    return $filename;
}

/**
 * Vérifier que le type MIME est autorisé
 */
function isAllowedMime($tmpPath, $originalName) {
    $allowedMimes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
    ];

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime  = $finfo->file($tmpPath);
    return in_array($mime, $allowedMimes, true);
}

/**
 * Upload d'un fichier
 */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $qrCode = isset($_POST['qr_code']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', $_POST['qr_code']) : '';

    if (empty($qrCode)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'qr_code manquant']);
        exit;
    }

    if (empty($_FILES['file'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Aucun fichier reçu']);
        exit;
    }

    $file = $_FILES['file'];

    // Vérifier les erreurs d'upload
    if ($file['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Erreur upload : code ' . $file['error']]);
        exit;
    }

    // Vérifier la taille (max 50 Mo)
    $maxSize = 50 * 1024 * 1024;
    if ($file['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Fichier trop volumineux (max 50 Mo)']);
        exit;
    }

    // Vérifier le type MIME
    if (!isAllowedMime($file['tmp_name'], $file['name'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Type de fichier non autorisé']);
        exit;
    }

    // Créer le dossier de la zone
    $zoneDir = UPLOAD_BASE_DIR . $qrCode . '/';
    if (!is_dir($zoneDir)) {
        mkdir($zoneDir, 0755, true);
    }

    // Générer un nom unique
    $ext          = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $safeName     = sanitizeFilename(pathinfo($file['name'], PATHINFO_FILENAME));
    $uniqueName   = $safeName . '_' . uniqid() . '.' . $ext;
    $destPath     = $zoneDir . $uniqueName;
    $publicUrl    = UPLOAD_BASE_URL . $qrCode . '/' . $uniqueName;

    if (!move_uploaded_file($file['tmp_name'], $destPath)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Impossible de déplacer le fichier']);
        exit;
    }

    // Déterminer le type (image ou vidéo)
    $finfo    = new finfo(FILEINFO_MIME_TYPE);
    $mime     = $finfo->file($destPath);
    $fileType = strpos($mime, 'video') === 0 ? 'video' : 'image';

    echo json_encode([
        'success'   => true,
        'message'   => 'Fichier uploadé avec succès',
        'file'      => [
            'name'      => $uniqueName,
            'original'  => $file['name'],
            'url'       => $publicUrl,
            'type'      => $fileType,
            'mime'      => $mime,
            'size'      => $file['size'],
            'qr_code'   => $qrCode
        ]
    ]);
    exit;
}

/**
 * Suppression d'un fichier
 */
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input   = json_decode(file_get_contents('php://input'), true);
    $qrCode  = isset($input['qr_code'])  ? preg_replace('/[^a-zA-Z0-9_-]/', '', $input['qr_code'])  : '';
    $filename = isset($input['filename']) ? basename($input['filename']) : '';

    if (empty($qrCode) || empty($filename)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Paramètres manquants']);
        exit;
    }

    $filePath = UPLOAD_BASE_DIR . $qrCode . '/' . $filename;

    if (!file_exists($filePath)) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Fichier introuvable']);
        exit;
    }

    if (unlink($filePath)) {
        echo json_encode(['success' => true, 'message' => 'Fichier supprimé']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Impossible de supprimer le fichier']);
    }
    exit;
}

/**
 * Lister les fichiers d'une zone
 */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $qrCode = isset($_GET['qr_code']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', $_GET['qr_code']) : '';

    if (empty($qrCode)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'qr_code manquant']);
        exit;
    }

    $zoneDir = UPLOAD_BASE_DIR . $qrCode . '/';
    $files   = [];

    if (is_dir($zoneDir)) {
        $allowedExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'ogg', 'mov'];
        foreach (scandir($zoneDir) as $f) {
            if ($f === '.' || $f === '..') continue;
            $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
            if (!in_array($ext, $allowedExt)) continue;

            $finfo    = new finfo(FILEINFO_MIME_TYPE);
            $mime     = $finfo->file($zoneDir . $f);
            $fileType = strpos($mime, 'video') === 0 ? 'video' : 'image';

            $files[] = [
                'name'     => $f,
                'url'      => UPLOAD_BASE_URL . $qrCode . '/' . $f,
                'type'     => $fileType,
                'size'     => filesize($zoneDir . $f),
                'modified' => filemtime($zoneDir . $f)
            ];
        }
    }

    echo json_encode(['success' => true, 'files' => $files, 'qr_code' => $qrCode]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
