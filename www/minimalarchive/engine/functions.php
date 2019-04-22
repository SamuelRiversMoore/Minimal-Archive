<?php
if (!defined('minimalarchive')) {
    header('location: /');
    exit();
}

function file_to_lines(string $file)
{
    $result = array();
    if (file_exists($file)) {
        return explode("\n", file_get_contents($file));
    }
    return $result;
}

function textFileToArray(string $file)
{
    $result = array();
    $lines = file_to_lines($file);
    if (is_array($lines) && count($lines)) {
        $i = -1;
        while (++$i < count($lines)) {
            $tokens = explode(':', trim(htmlspecialchars($lines[$i])), 2);
            if (is_array($tokens) && count($tokens) === 2) {
                $result[trim($tokens[0])] = trim($tokens[1]);
            }
        }
    }
    return $result;
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

function check_imagesfolder(string $folder)
{
    if (file_exists($folder)) {
        if (!is_writable($folder)) {
            throw new Exception("no_rights", 1);
        }
    }
}

function check_uploadedfile($file, $uploadfolder = VAR_FOLDER, $max_filesize = 2097152)
{
    if ($file) {
        if (!is_uploaded_file($file['tmp_name'])) {
            throw new Exception("file_upload_error", 1);
        }
        if (filesize($file['tmp_name']) > $max_filesize) {
            throw new Exception("file_too_large", 1);
        }
    }
}

function save_file($file, $name = null, $folder = VAR_FOLDER)
{
    if ($file) {
        if (!move_uploaded_file($file['tmp_name'], $folder . DS. basename($name ? $name : $file['name']))) {
            throw new Exception("file_upload_error", 1);
        }
    }
}

function get_credentials()
{
    $credentials = array(
        'email' => null,
        'password' => null
    );
    $lines = file_to_lines(VAR_FOLDER . DS . '.account');
    if ($lines && count($lines) >= 2) {
        $credentials['email'] = $lines[0];
        $credentials['password'] = $lines[1];
    }
    return $credentials;
}

function check_credentials(string $email, string $password)
{
    if (!has_account() || !$email || !$password) {
        return false;
    }
    $credentials = get_credentials();
    return password_verify(sanitize_email($email), $credentials['email']) && password_verify(sanitize_password($password), $credentials['password']);
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
    return $token === get_token($form_name);
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

function parse_sessions($content)
{
    if (!$content) {
        return [];
    }
    $json = json_decode($content);
    if ($json && count($json)) {
        return $json;
    }
    return [];
}

function invalidate_session($id, $key)
{
    session_destroy();
    $dir = VAR_FOLDER;
    $filename = DEFAULT_SESSIONSFILE;
    if (!file_exists($dir)) {
        return false;
    }
    $sessions = array();
    if (file_exists($filename)) {
        $content = file_get_contents($filename);
        $sessions = parse_sessions($content);
        if (($index = getindex_sessionbykey($id, $key, $sessions)) > -1) {
            $i = 0;
            foreach ($sessions as $session) {
                if ($i !== $index) {
                    $sessions[$i] = $session;
                }
                $i++;
            }
        }
        $file = fopen($filename, "w");
        fwrite($file, json_encode($sessions). "\n");
        fclose($file);
    }
}

function validate_session($id, $key)
{
    $dir = VAR_FOLDER;
    $filename = DEFAULT_SESSIONSFILE;
    if (!file_exists($dir)) {
        return false;
    }
    if (file_exists($filename)) {
        $content = file_get_contents($filename);
        $sessions = parse_sessions($content);
        if (($index = getindex_sessionbykey($id, $key, $sessions)) > -1) {
            if (((int)(new \DateTime())->getTimestamp() - (int)$sessions[$index]->time) / (60 * 60) < SESSION_MAXDURATION) {
                return true;
            }
        }
    }
    return false;
}

function getindex_sessionbykey($id, $key, $sessions)
{
    if (!$sessions) {
        return -1;
    }
    $i = -1;
    while (++$i < count($sessions)) {
        if (property_exists($sessions[$i], $key)) {
            if (password_verify($id, $sessions[$i]->$key)) {
                return $i;
            }
        }
    }
}

function add_session($id, $key)
{
    try {
        $dir = VAR_FOLDER;
        $filename = DEFAULT_SESSIONSFILE;
        if (!file_exists($dir)) {
            mkdir($dir, 0777, true);
        }
        $sessions = array();
        $account = null;
        // if file exists, try to update the entry
        if (file_exists($filename)) {
            $content = file_get_contents($filename);
            $sessions = parse_sessions($content);
            if (($index = getindex_sessionbykey($id, $key, $sessions)) > -1) {
                $sessions[$index]->time = (new \DateTime())->getTimestamp();
            }
        }
        // else, create a new session
        if (!$account) {
            $sessions[] = (object) array(
                'id' => password_hash($id, PASSWORD_DEFAULT),
                'time' => (new \DateTime())->getTimestamp()
            );
        }
        $file = fopen($filename, "w");
        fwrite($file, json_encode($sessions). "\n");
        fclose($file);
        return true;
    } catch (Exception $e) {
        throw new Exception($e->getMessage(), $e->getCode());
    }
}

function clean_installation()
{
    $files = glob(VAR_FOLDER . DS . '*');
    foreach ($files as $file) {
        if (is_file($file) && $file !== DEFAULT_ACCOUNTFILE && $FILE !== DEFAULT_METAFILE) {
            unlink($file);
        }
    }
}

function uninstall()
{
    $files = glob(VAR_FOLDER . DS . '{,.}[!.,!..]*', GLOB_MARK|GLOB_BRACE);
    foreach ($files as $file) {
        unlink($file);
    }
}

function put_error(string $message)
{
    echo "<aside class=\"notice error\">${message}</aside>";
}

function put_success(string $message)
{
    echo "<aside class=\"notice success\">${message}</aside>";
}

function sanitize_email($text)
{
    return filter_var(strtolower(trim($text)), FILTER_SANITIZE_EMAIL);
}

function sanitize_password($text)
{
    return filter_var($text, FILTER_SANITIZE_STRING);
}

function sanitize_text($text)
{
    return filter_var(trim($text), FILTER_SANITIZE_FULL_SPECIAL_CHARS);
}

function has_account()
{
    return file_exists(VAR_FOLDER . DS . ".account");
}

function has_meta()
{
    return file_exists(ROOT_FOLDER . DS . "meta.txt");
}

function is_installed()
{
    return has_account() && has_meta();
}

function translate($string, $extra = "", $language = 'en')
{
    $translations = require 'translations.php';
    if (!array_key_exists($language, $translations)) {
        $language = 'en';
    }
    $mediaTranslation = $translations[$language];

    if (array_key_exists($string, $mediaTranslation)) {
        $string = $mediaTranslation[$string];
    }
    $string .= strlen($extra) ? "<br/>" . $extra : "";
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
