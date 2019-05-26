<?php
if (!defined('minimalarchive')) {
    redirect('/');
}

function get_sanitizedform($args)
{
    return array(
        'email' => isset($args['email']) ? sanitize_email($args['email']) : null,
        'password' => isset($args['password']) ? sanitize_password($args['password']) : null,
        'title' => isset($args['title']) ? sanitize_text($args['title']) : null,
        'imagesfolder' => isset($args['imagesfolder']) ? rtrim(ltrim(sanitize_text($args['imagesfolder']), '/')) : pathinfo(DEFAULT_IMAGEFOLDER, PATHINFO_FILENAME),
        'description' => isset($args['description']) ? sanitize_text($args['description']) : null,
        'note' => isset($args['note']) ? sanitize_text($args['note']) : null,
        'favicon' => isset($_FILES['favicon']) && strlen($_FILES['favicon']['name'])? $_FILES['favicon'] : null,
        'socialimage' => isset($_FILES['socialimage']) && $_FILES['socialimage']['name'] ? $_FILES['socialimage'] : null,
    );
}

function check_form($args)
{
    $required = array(
        'email',
        'password',
        'title'
    );
    foreach ($required as $item) {
        if (null === $args[$item]) {
            throw new Exception("no_${item}", 1);
        }
    }
    try {
        check_password($args['password']);
    } catch (Exception $e) {
        throw $e;
    }
    try {
        check_imagesfolder(ROOT_FOLDER . DS . $args['imagesfolder']);
    } catch (Exception $e) {
        throw $e;
    }
    if (null !== $args['socialimage']) {
        try {
            check_uploadedfile($args['socialimage']);
        } catch (Exception $e) {
            throw $e;
        }
    }
    if (null !== $args['favicon']) {
        try {
            check_uploadedfile($args['favicon']);
        } catch (Exception $e) {
            throw $e;
        }
    }
}

function create_accountfile($email, $password)
{
    try {
        $dir = VAR_FOLDER;
        $filename = DEFAULT_ACCOUNTFILE;
        $hashedPass = password_hash($password, PASSWORD_DEFAULT);
        $hashedEmail = password_hash($email, PASSWORD_DEFAULT);
        if (!file_exists($dir)) {
            mkdir($dir, 0777, true);
        }
        if (file_exists($filename)) {
            throw new Exception("account_exists", 1);
        }
        $file = fopen($filename, "w");
        fwrite($file, $hashedEmail. "\n");
        fwrite($file, $hashedPass . "\n");
        fclose($file);
        return true;
    } catch (Exception $e) {
        throw new Exception($e->getMessage(), $e->getCode());
    }
}

function create_metafile($args)
{
    try {
        $exclusion = array(
            'email',
            'password'
        );
        $images = array(
            'favicon',
            'socialimage'
        );
        $dir = ROOT_FOLDER;
        $filename = DEFAULT_METAFILE;
        if (!file_exists($dir)) {
            mkdir($dir, 0777, true);
        }
        $file = fopen($filename, "w");
        foreach ($args as $key => $value) {
            if (!in_array($key, $exclusion)) {
                if (in_array($key, $images) && $args[$key]) {
                    fwrite($file, "${key}: " . $key . "." . pathinfo($args[$key]['name'], PATHINFO_EXTENSION)."\n");
                } else {
                    fwrite($file, "${key}: ${value}\n");
                }
            }
        }
        fclose($file);
        return true;
    } catch (Exception $e) {
        throw new Exception($e->getMessage(), $e->getCode());
    }
}

function save_uploadedfiles($args)
{
    try {
        save_file($args['favicon'], 'favicon.' . pathinfo($args['favicon']['name'], PATHINFO_EXTENSION), ASSETS_FOLDER . DS . 'images');
        save_file($args['socialimage'], 'socialimage.' . pathinfo($args['socialimage']['name'], PATHINFO_EXTENSION), ASSETS_FOLDER . DS . 'images');
    } catch (Exception $e) {
        throw $e;
    }
}

function process_form($args)
{
    try {
        $form = get_sanitizedform($args);
        check_form($form);
        save_uploadedfiles($form);
        create_accountfile($form['email'], $form['password']);
        create_metafile($form);
    } catch (Exception $e) {
        uninstall();
        throw $e;
    }
    clean_installation();
}
