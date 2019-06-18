<?php
define('minimalarchive', true);

define('DS', DIRECTORY_SEPARATOR);
define('ROOT_FOLDER', __DIR__ . DS . '../..');
define('BASE_FOLDER', __DIR__ . DS . '..');
define('VAR_FOLDER', BASE_FOLDER . DS . 'var');
define('ASSETS_FOLDER', ROOT_FOLDER . DS . 'assets');
define('ROOT_URL', trim(substr($_SERVER['SCRIPT_NAME'], 0, strrpos($_SERVER['SCRIPT_NAME'], '/')), '/'));

define('DEFAULT_ACCOUNTFILE', VAR_FOLDER . DS . '.account');
define('DEFAULT_SESSIONSFILE', VAR_FOLDER . DS . '.sessions');
define('DEFAULT_IMAGEFOLDER', ROOT_FOLDER . DS . 'images');
define('DEFAULT_METAFILE', ROOT_FOLDER . DS . 'meta.txt');
define('DEFAULT_LOGFILE', VAR_FOLDER . DS . 'debug.log');

// In hours
define('SESSION_MAXDURATION', 2);

session_start();

include_once 'functions.php';
include_once 'loader.php';
include_once 'router.php';
