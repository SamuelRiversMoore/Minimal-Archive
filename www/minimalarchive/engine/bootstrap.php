<?php

define('minimalarchive', TRUE);
define('DS', DIRECTORY_SEPARATOR);
define('ROOT_FOLDER', __DIR__ . DS . '../..');
define('BASE_FOLDER', __DIR__ . DS . '..');
define('VAR_FOLDER', BASE_FOLDER . DS . 'var');
define('ASSETS_FOLDER', ROOT_FOLDER . DS . 'assets');
define('DEFAULT_ACCOUNTFILE', VAR_FOLDER . DS . '.account');
define('DEFAULT_IMAGEFOLDER', ROOT_FOLDER . DS . 'images');
define('DEFAULT_METAFILE', ROOT_FOLDER . DS . 'meta.txt');

session_start();

include_once 'functions.php';
include_once 'router.php';
