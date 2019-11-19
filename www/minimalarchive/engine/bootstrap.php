<?php
define('minimalarchive', true);

define('DS', DIRECTORY_SEPARATOR);
define('ROOT_FOLDER', __DIR__ . DS . '../..');
define('BASE_FOLDER', __DIR__ . DS . '..');

define('ASSETS_FOLDER', ROOT_FOLDER . DS . 'assets');
define('DEFAULT_IMAGEFOLDER', ROOT_FOLDER . DS . 'images');
define('DEFAULT_METAFILE', ROOT_FOLDER . DS . 'meta.txt');

define('TRANSLATIONS_FOLDER', BASE_FOLDER . DS . 'translations');
define('VAR_FOLDER', BASE_FOLDER . DS . 'var');

define('DEFAULT_ACCOUNTFILE', VAR_FOLDER . DS . '.account');
define('DEFAULT_SESSIONSFILE', VAR_FOLDER . DS . '.sessions');
define('DEFAULT_LOGFILE', VAR_FOLDER . DS . 'debug.log');

define('ROOT_URL', trim(substr($_SERVER['SCRIPT_NAME'], 0, strrpos($_SERVER['SCRIPT_NAME'], '/')), '/'));

// In hours
define('SESSION_MAXDURATION', 2);

session_start();

include_once 'functions.php';
include_once 'class_loader.php';

// order matters
new Router(array(
    array(
        "match" => "/(^$|^\b$|\bindex|\bhome|\bhomepage|\bindex\.php|\bindex\.html)\/?$/",
        "script" => BASE_FOLDER . DS . 'index.php'
    ),
    array(
        "match" => "/(\binstall)\/?$/",
        "script" => BASE_FOLDER . DS . 'install.php'
    ),
    array(
        "match" => "/(\buninstall)\/?$/",
        "script" => BASE_FOLDER . DS . 'uninstall.php'
    ),
    array(
        "match" => "/(\bedit)\/?$/",
        "script" => BASE_FOLDER . DS . 'edit.php'
    ),
    array(
        "match" => "/(\bapi)\/?$/",
        "script" => BASE_FOLDER . DS . 'api.php'
    ),
    array(
        "match" => "/./",
        "script" => BASE_FOLDER . DS . '404.php'
    ),
));
