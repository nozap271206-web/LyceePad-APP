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

// Types autorisés : images courantes + PDF + vidéos
function depotAllowedMimes() {
    return [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
    ];
}

function depotMimeToType($mime) {
    if ($mime === 'application/pdf') return 'pdf';
    if (strpos($mime, 'video/') === 0) return 'video';
    return 'image';
}

// Médias déjà présents dans l'app, exclus du listing (interface + fond accueil)
function depotAppExcluded() {
    return ['logo.png', 'logo_splash.png', 'plan-lycee.png', 'background-hero.mp4'];
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

    // ── Assignation : copier un fichier du dépôt vers le dossier d'une zone ──
    if (isset($_POST['action']) && $_POST['action'] === 'assign') {
        $filename = isset($_POST['filename']) ? basename($_POST['filename']) : '';
        $qrCode   = isset($_POST['qr_code']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', $_POST['qr_code']) : '';

        if (empty($filename) || empty($qrCode)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'filename ou qr_code manquant']);
            exit;
        }

        // Le fichier source peut être dans le dépôt OU dans les médias de l'app (img/, video/)
        $candidates = [
            DEPOT_DIR . $filename,
            __DIR__ . '/../img/' . $filename,
            __DIR__ . '/../video/' . $filename,
        ];
        $src = null;
        foreach ($candidates as $c) {
            if (is_file($c)) { $src = $c; break; }
        }
        if ($src === null) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Fichier source introuvable']);
            exit;
        }

        $zoneDir = __DIR__ . '/../img/zones/' . $qrCode . '/';
        if (!is_dir($zoneDir)) {
            mkdir($zoneDir, 0755, true);
        }

        $ext      = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        $base     = depotSanitizeName(pathinfo($filename, PATHINFO_FILENAME));
        $destName = 'gallery_' . $base . '_' . uniqid() . '.' . $ext;
        $dest     = $zoneDir . $destName;

        if (!copy($src, $dest)) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Impossible de copier le fichier dans la zone']);
            exit;
        }

        echo json_encode([
            'success' => true,
            'message' => 'Fichier assigné à la zone',
            'file'    => [
                'name'    => $destName,
                'url'     => '/img/zones/' . $qrCode . '/' . $destName,
                'type'    => $ext === 'pdf' ? 'pdf' : (in_array($ext, ['mp4', 'webm', 'ogg', 'mov'], true) ? 'video' : 'image'),
                'qr_code' => $qrCode
            ]
        ]);
        exit;
    }

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

    // Taille max 500 Mo (vidéos incluses)
    $maxSize = 500 * 1024 * 1024;
    if ($file['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Fichier trop volumineux (max 500 Mo)']);
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
    $allowedExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'mp4', 'webm', 'ogg', 'mov'];

    $extToType = function ($ext) {
        if ($ext === 'pdf') return 'pdf';
        if (in_array($ext, ['mp4', 'webm', 'ogg', 'mov'], true)) return 'video';
        return 'image';
    };

    // Scanne un dossier (fichiers directs uniquement) et empile les médias trouvés
    $scan = function ($dir, $urlPrefix, $source, array $exclude = [])
            use (&$files, $allowedExt, $extToType) {
        if (!is_dir($dir)) return;
        foreach (scandir($dir) as $f) {
            if ($f === '.' || $f === '..') continue;
            if (in_array(strtolower($f), $exclude, true)) continue;
            $path = $dir . $f;
            if (!is_file($path)) continue;  // ignore les sous-dossiers (zones/, depot/)
            $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
            if (!in_array($ext, $allowedExt, true)) continue;

            $files[] = [
                'name'     => $f,
                'url'      => $urlPrefix . $f,
                'type'     => $extToType($ext),
                'source'   => $source,
                'size'     => filesize($path),
                'modified' => filemtime($path)
            ];
        }
    };

    // 1) Fichiers réellement déposés (modifiables / supprimables)
    $scan(DEPOT_DIR, DEPOT_URL, 'depot');
    // 2) Médias déjà présents dans l'app (lecture seule), hors interface + fond accueil
    $appExclude = depotAppExcluded();
    $scan(__DIR__ . '/../img/',   '/img/',   'app', $appExclude);
    $scan(__DIR__ . '/../video/', '/video/', 'app', $appExclude);

    // Plus récents d'abord
    usort($files, function ($a, $b) { return $b['modified'] - $a['modified']; });

    echo json_encode(['success' => true, 'files' => $files]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
