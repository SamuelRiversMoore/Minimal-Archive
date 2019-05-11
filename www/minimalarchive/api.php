<?php
if (!defined('minimalarchive') || !is_installed() || !isset($_POST['csrf_token']) || !isset($_POST['action']) || !isset($_SESSION['id'])) {
    http_response_code(401);
    exit();
}
if (!validate_session($_SESSION['id'], 'id')) {
    invalidate_session($_SESSION['id'], 'id');
    http_response_code(401);
    exit();
}

header('Content-Type: application/json');
switch ($_POST['action']) {
    case 'upload':
        upload($_FILES);
        break;
    case 'save':
        save(json_decode($_POST['data'], true));
        break;
    default:
        # code...
        break;
}

function apiResponse($message = 'Error', $code = 500, $data = null)
{
    $response = array(
        'code' => $code,
        'data' => $data,
        'message' => $message
    );
    http_response_code($code);
    echo json_encode($response);
}

function upload(array $files = [], $folder = DEFAULT_IMAGEFOLDER)
{
    try {
        $data = array();
        foreach ($files as $file) {
            $filename = save_file($file, $file['name'], $folder);
            $data[] = array(
                'name' => $filename,
                'type' => $file['type'],
                'extension' => pathinfo($file['name'], PATHINFO_EXTENSION)
            );
        }
        apiResponse('ok', 200, $data);
        return;
    } catch (Exception $e) {
        apiResponse($e->getMessage(), 500);
        return;
    }
}

function save(array $data = null)
{
    if (!$data || !count($data)) {
        apiResponse('Bad query', 400);
        return;
    }
    try {
        $meta = textFileToArray(DEFAULT_METAFILE);
        $result = array();
        foreach ($data as $key => $value) {
            if (array_key_exists($key, $meta)) {
                $meta[$key] = trim($value);
                $result[$key] = $meta[$key];
            }
        }

        update_file($meta);
        apiResponse('ok', 200, $result);
        return;
    } catch (Exception $e) {
        apiResponse($e->getMessage(), 500);
    }
}
