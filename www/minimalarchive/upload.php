<?php
if (!defined('minimalarchive') || !is_installed() || !isset($_POST['csrf_token']) || !isset($_SESSION['id'])) {
    http_response_code(401);
    exit();
}
if (!validate_session($_SESSION['id'], 'id')) {
    invalidate_session($_SESSION['id'], 'id');
    http_response_code(401);
    exit();
}

header('Content-Type: application/json');
try {
    $data = array(
        'status' => 'ok',
        'code' => 200,
        'data' => array()
    );
    foreach ($_FILES as $file) {
        save_file($file, $file['name'], DEFAULT_IMAGEFOLDER);
        $data['data'][] = array(
            'name' => $file['name'],
            'type' => $file['type'],
            'extension' => pathinfo($file['name'], PATHINFO_EXTENSION)
        );
    }
    http_response_code(200);
    echo json_encode($data);
} catch (Exception $e) {
    $data = array(
        'status' => 'ko',
        'code' => 500,
        'data' => null,
        'error' => $e->getMessage()
    );
    http_response_code(500);
    echo json_encode($data);
}
