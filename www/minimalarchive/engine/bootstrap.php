<?php

define('DS', DIRECTORY_SEPARATOR);
define('minimalarchive', TRUE);
define('ROOT_FOLDER', __DIR__ . DS . '../..');
define('VAR_FOLDER', __DIR__ . DS . '../var');

session_start();

include_once 'functions.php';
include_once 'router.php';
