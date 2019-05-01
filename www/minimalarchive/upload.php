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
