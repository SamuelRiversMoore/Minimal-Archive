<?php
if (!defined('minimalarchive'))
{
    header('location: /');
    exit();
}

// Grabs the URI and breaks it apart in case we have querystring stuff
$request_uri = explode('?', $_SERVER['REQUEST_URI'], 2);

// Route it up!
switch ($request_uri[0]) {
  case '':
  case '/':
  case (preg_match('/\/(index|home|homepage|index\.php|index\.html)\/?$/', $request_uri[0]) ? true : false):
    require BASE_FOLDER . DS . 'index.php';
    break;
  // Installation page
  case (preg_match('/\/(install)\/?$/', $request_uri[0]) ? true : false):
    require BASE_FOLDER . DS . 'install.php';
    break;
  // Installation page
  case (preg_match('/\/(uninstall)\/?$/', $request_uri[0]) ? true : false):
    require BASE_FOLDER . DS . 'uninstall.php';
    break;
  // Editor page
  case (preg_match('/\/(edit)\/?$/', $request_uri[0]) ? true : false):
    require BASE_FOLDER . DS . 'edit.php';
    break;
  // Editor page
  case (preg_match('/\/(upload)\/?$/', $request_uri[0]) ? true : false):
    require BASE_FOLDER . DS . 'upload.php';
    break;
  // Everything else
  default:
    require BASE_FOLDER . DS . '404.php';
    break;
}
?>
