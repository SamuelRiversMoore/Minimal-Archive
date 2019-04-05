<?php
if (!defined('minimalarchive'))
{
    header('location: /');
    exit();
}

function url(string $path = '')
{
    // server protocol
    $protocol = empty($_SERVER['HTTPS']) ? 'http' : 'https';

    // domain name
    $domain = $_SERVER['SERVER_NAME'];

    // server port
    $port = $_SERVER['SERVER_PORT'];
    $disp_port = ($protocol == 'http' && $port == 80 || $protocol == 'https' && $port == 443) ? '' : ":$port";

    // put em all together to get the complete base URL
    return "${protocol}://${domain}${disp_port}" . ($path ? "/" . htmlspecialchars($path) : '');
}

function getFilenamesInFolder(string $folder = null, array $supported = [])
{
    if (!$folder || !is_dir($folder)) {
        throw new Exception('no_folder');
        return array();
    }
    if (!is_array($supported)) {
        throw new Exception('no_supported_files_provided');
        return array();
    }
    $result = array();
    $files = scandir($folder);
    $i = -1;
    while (++$i < count($files)) {
        if ($files[$i] != "." && $files[$i] != "..") {
            $extension = strtolower(pathinfo($files[$i], PATHINFO_EXTENSION));
            if (in_array($extension, $supported)) {
                $result[] = htmlspecialchars($files[$i]);
            }
        }
    }
    return $result;
}

function getImagesInFolder(string $folder = null)
{
    $supported_formats = array(
        'gif',
        'jpg',
        'jpeg',
        'png'
    );
    try {
        return getFilenamesInFolder($folder, $supported_formats);
    } catch (Exception $e) {
        throw $e;
    }
}

function textFileToArray(string $file)
{
    $result = array();
    if (file_exists($file)) {
        $lines = explode("\n", file_get_contents($file));
        if (is_array($lines) && count($lines)) {
            $i = -1;
            while (++$i < count($lines)) {
                $tokens = explode(':', trim(htmlspecialchars($lines[$i])), 2);
                if (is_array($tokens) && count($tokens) === 2) {
                    $result[trim($tokens[0])] = trim($tokens[1]);
                }
            }
        }
    }
    return $result;
}
