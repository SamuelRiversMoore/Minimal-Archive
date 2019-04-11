<?php
if (!defined('minimalarchive')) {
    header('location: /');
    exit();
}

function translate($string, $language = 'en')
{
    $translations = require 'translations.php';
    if (!array_key_exists($language, $translations)) {
        $language = 'en';
    }
    $mediaTranslation = $translations[$language];

    if (array_key_exists($string, $mediaTranslation)) {
        $string = $mediaTranslation[$string];
    }
    return $string;
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

function create_token()
{
    try {
        $dir = VAR_FOLDER . DS;
        $filename = ".token";
        if (!file_exists($dir)) {
            mkdir($dir, 0777, true);
        }
        $file = fopen($dir . DS . $filename, "w");
        fwrite($file, bin2hex(random_bytes(32)) . "\n");
        fclose($file);
    } catch (Exception $e) {
        throw new Exception($e->getMessage(), $e->getCode());
    }
}

function get_token($form_name)
{
    $file = VAR_FOLDER . DS . '.token';
    if (file_exists($file)) {
        $lines = explode("\n", file_get_contents($file));
        if (is_array($lines) && count($lines)) {
            return hash('sha512', $lines[0] . session_id() . $form_name);
        }
    }
    return false;
}

function check_token($token, $form_name)
{
    return $token === get_token('install');
}

function check_password($password)
{
    if (strlen($password) < 8) {
        throw new Exception("password_short.", 1);
        return false;
    }
    if (!preg_match("/[0-9]{1,}/", $password) || !preg_match("/[A-Z]{1,}/", $password)) {
        throw new Exception("password_bad", 1);
        return false;
    }
    return true;
}

function email_sanitize($text)
{
    return filter_var(strtolower(trim($text)), FILTER_SANITIZE_EMAIL);
}

function password_sanitize($text)
{
    return filter_var($text, FILTER_SANITIZE_STRING);
}

function create_account($email, $password)
{
    try {
        $dir = VAR_FOLDER;
        $filename = ".account";
        $hashedPass = password_hash($password, PASSWORD_DEFAULT);
        $hashedEmail = password_hash($email, PASSWORD_DEFAULT);
        if (!file_exists($dir)) {
            mkdir($dir, 0777, true);
        }
        if (file_exists($dir . DS . $filename)) {
            throw new Exception("account_exists", 1);
        }
        $file = fopen($dir . DS . $filename, "w");
        fwrite($file, $hashedEmail. "\n");
        fwrite($file, $hashedPass . "\n");
        fclose($file);
        return true;
    } catch (Exception $e) {
        throw new Exception($e->getMessage(), $e->getCode());
    }
}

function is_installed()
{
    $filename = VAR_FOLDER . DS . ".account";
    return file_exists($filename);
}
