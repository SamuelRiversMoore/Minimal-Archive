<?php

define('minimalarchive', TRUE);
define('DS', DIRECTORY_SEPARATOR);
define('ROOT_FOLDER', __DIR__ . DS . '../..');
define('BASE_FOLDER', __DIR__ . DS . '..');
define('VAR_FOLDER', BASE_FOLDER . DS . 'var');

session_start();

include_once 'functions.php';
include_once 'router.php';
