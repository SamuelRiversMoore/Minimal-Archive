<?php

function getIp()
{
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) { //check ip
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) { //check proxy
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    return $ip;
}

$extensions = array("bmp", "webp", "jpg", "jpeg", "png", "gif", "css", "js", "sqlite", "eot", "svg", "ttf", "woff", "woff2");

$path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$ext = pathinfo($path, PATHINFO_EXTENSION);

if (in_array($ext, $extensions)) {
    // let the server handle the request as-is
    return false;
} else {
    include_once "minimalarchive" . DIRECTORY_SEPARATOR . "engine" . DIRECTORY_SEPARATOR . "bootstrap.php";
    return true;
}
