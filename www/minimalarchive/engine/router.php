<?php
if (!defined('minimalarchive')) {
    redirect('/');
}

// Grabs the URI and breaks it apart in case we have querystring stuff
$request_uri = explode('?', trim($_SERVER['REQUEST_URI'], '/'), 2);
$base = $request_uri[0];
if (ROOT_URL) {
    $tmp = strstr($request_uri[0], ROOT_URL);
    $base = substr($tmp, strlen(ROOT_URL) + 1);
}

// Route it up!
switch ($base) {
  case '':
  case '/':
  case ROOT_URL:
  case (preg_match("/(\bindex|\bhome|\bhomepage|\bindex\.php|\bindex\.html)\/?$/", $base) ? true : false):
    require BASE_FOLDER . DS . 'index.php';
    break;
  // Installation page
  case (preg_match("/(\binstall)\/?$/", $base) ? true : false):
    require BASE_FOLDER . DS . 'install.php';
    break;
  // Installation page
  case (preg_match("/(\buninstall)\/?$/", $base) ? true : false):
    require BASE_FOLDER . DS . 'uninstall.php';
    break;
  // Editor page
  case (preg_match("/(\bedit)\/?$/", $base) ? true : false):
    require BASE_FOLDER . DS . 'edit.php';
    break;
  // API
  case (preg_match("/(\bapi)\/?$/", $base) ? true : false):
    require BASE_FOLDER . DS . 'api.php';
    break;
  // Everything else
  default:
    require BASE_FOLDER . DS . '404.php';
    break;
}
