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

$meta = textFileToArray(ROOT_FOLDER . DS . 'meta.txt');
$imageFolder = array_key_exists('imagesfolder', $meta) ? ROOT_FOLDER . DS . $meta['imagesfolder'] : DEFAULT_IMAGEFOLDER;

$api = new Api($imageFolder);

switch ($_POST['action']) {
    case 'upload':
        $api->upload($_FILES);
        break;
    case 'save':
        $api->save(json_decode($_POST['data'], true));
        break;
    default:
        json_response('ok', 200, null);
        break;
}
