<?php
if (!defined('minimalarchive'))
{
    header('location: /');
    exit();
}

if (file_exists(__DIR__ . DS . 'minimalarchive' . DS . 'account' . DS . 'account.txt')) {
  define('minimalarchive-installed', TRUE);
}

// Grabs the URI and breaks it apart in case we have querystring stuff
$request_uri = explode('?', $_SERVER['REQUEST_URI'], 2);

// Route it up!
switch ($request_uri[0]) {
  case '':
  case '/':
  case (preg_match('/\/(index|home|homepage|index\.php|index\.html)\/?$/', $request_uri[0]) ? true : false):
    require 'minimalarchive/index.php';
    break;
  // Admin page
  case (preg_match('/\/(install)\/?$/', $request_uri[0]) ? true : false):
    require 'minimalarchive' . DS . 'install.php';
    break;
  // Everything else
  default:
    require 'minimalarchive' . DS . '404.php';
    break;
}
?>
