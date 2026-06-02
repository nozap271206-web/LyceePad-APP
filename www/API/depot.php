<?php
/**
 * API Dépôt de médias - LyceePad
 * Banque de fichiers libre (PDF, images) déposés depuis n'importe quel PC connecté.
 * Les fichiers sont rangés dans www/img/depot/ et listés pour la tablette / l'admin.
 *
 *  POST   (auth) → upload d'un fichier         (champ multipart "file")
 *  GET           → liste tous les fichiers du dépôt
 *  DELETE (auth) → suppression d'un fichier    (JSON { "filename": "..." })
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, DELETE, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Dossier de stockage du dépôt (relatif à ce fichier : www/API/ → www/img/depot/)
define('DEPOT_DIR', __DIR__ . '/../img/depot/');
define('DEPOT_URL', '/img/depot/'); // URL publique relative

if (!is_dir(DEPOT_DIR)) {
    mkdir(DEPOT_DIR, 0755, true);
}

// Types autorisés : images courantes + PDF
function depotAllowedMimes() {
    return [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf'
    ];
}

function depotMimeToType($mime) {
    if ($mime === 'application/pdf') return 'pdf';
    return 'image';
}

function depotSanitizeName($name) {
    $name = basename($name);
    return preg_replace('/[^a-zA-Z0-9._-]/', '_', $name);
}

function depotUploadErrorMessage($code) {
    switch ($code) {
        case UPLOAD_ERR_INI_SIZE:   return 'Fichier trop volumineux (limite php.ini : upload_max_filesize)';
        case UPLOAD_ERR_FORM_SIZE:  return 'Fichier trop volumineux (limite du formulaire)';
        case UPLOAD_ERR_PARTIAL:    return 'Transfert interrompu (fichier reçu partiellement)';
        case UPLOAD_ERR_NO_FILE:    return 'Aucun fichier reçu';
        case UPLOAD_ERR_NO_TMP_DIR: return 'Dossier temporaire serveur manquant';
        case UPLOAD_ERR_CANT_WRITE: return 'Impossible d\'écrire sur le disque serveur';
        case UPLOAD_ERR_EXTENSION:  return 'Upload bloqué par une extension PHP';
        default:                    return 'Erreur upload inconnue (code ' . $code . ')';
    }
}

// ─── Upload ───────────────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_once __DIR__ . '/check_auth.php';
    requireApiAuth();

    // Détecter le dépassement de post_max_size (PHP vide $_POST/$_FILES silencieusement)
    $contentLength = isset($_SERVER['CONTENT_LENGTH']) ? (int)$_SERVER['CONTENT_LENGTH'] : 0;
    $raw  = trim(ini_get('post_max_size'));
    $unit = strtoupper(substr($raw, -1));
    $val  = (int)$raw;
    if      ($unit === 'G') $postMaxBytes = $val * 1073741824;
    elseif  ($unit === 'M') $postMaxBytes = $val * 1048576;
    elseif  ($unit === 'K') $postMaxBytes = $val * 1024;
    else                    $postMaxBytes = $val;

    if ($contentLength > 0 && $postMaxBytes > 0 && $contentLength > $postMaxBytes) {
        http_response_code(413);
        echo json_encode(['success' => false, 'message' => 'Fichier trop volumineux (limite serveur : post_max_size = ' . ini_get('post_max_size') . ')']);
        exit;
    }

    if (empty($_FILES['file'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Aucun fichier reçu']);
        exit;
    }

    $file = $_FILES['file'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => depotUploadErrorMessage($file['error'])]);
        exit;
    }

    // Taille max 100 Mo
    $maxSize = 100 * 1024 * 1024;
    if ($file['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Fichier trop volumineux (max 100 Mo)']);
        exit;
    }

    // Vérifier le type MIME réel
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime  = $finfo->file($file['tmp_name']);
    if (!in_array($mime, depotAllowedMimes(), true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Type non autorisé (acceptés : PDF, JPG, PNG, GIF, WEBP)']);
        exit;
    }

    $ext        = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $safeName   = depotSanitizeName(pathinfo($file['name'], PATHINFO_FILENAME));
    $uniqueName = $safeName . '_' . uniqid() . '.' . $ext;
    $destPath   = DEPOT_DIR . $uniqueName;
    $publicUrl  = DEPOT_URL . $uniqueName;

    if (!move_uploaded_file($file['tmp_name'], $destPath)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Impossible d\'enregistrer le fichier']);
        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Fichier déposé avec succès',
        'file'    => [
            'name'     => $uniqueName,
            'original' => $file['name'],
            'url'      => $publicUrl,
            'type'     => depotMimeToType($mime),
            'mime'     => $mime,
            'size'     => $file['size']
        ]
    ]);
    exit;
}

// ─── Suppression ────────────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    require_once __DIR__ . '/check_auth.php';
    requireApiAuth();

    $input    = json_decode(file_get_contents('php://input'), true);
    $filename = isset($input['filename']) ? basename($input['filename']) : '';

    if (empty($filename)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Nom de fichier manquant']);
        exit;
    }

    $filePath = DEPOT_DIR . $filename;
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

// ─── Liste (publique) ─────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $files      = [];
    $allowedExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'];

    if (is_dir(DEPOT_DIR)) {
        foreach (scandir(DEPOT_DIR) as $f) {
            if ($f === '.' || $f === '..') continue;
            $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
            if (!in_array($ext, $allowedExt)) continue;

            $files[] = [
                'name'     => $f,
                'url'      => DEPOT_URL . $f,
                'type'     => $ext === 'pdf' ? 'pdf' : 'image',
                'size'     => filesize(DEPOT_DIR . $f),
                'modified' => filemtime(DEPOT_DIR . $f)
            ];
        }
    }

    // Plus récents d'abord
    usort($files, function ($a, $b) { return $b['modified'] - $a['modified']; });

    echo json_encode(['success' => true, 'files' => $files]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
