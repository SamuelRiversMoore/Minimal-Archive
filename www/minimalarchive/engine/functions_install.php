<?php

function checkForm($post)
{
    if (null !== $post['email']
    && null !== $post['password']) {
        try {
            check_password($post['password']);
            return true;
        } catch (Exception $e) {
            throw $e;
        }
    }
    return false;
}

function check_form($args)
{
    if (!isset($args['email']) || null === $args['email']) {
        throw new Exception("no_email", 1);
    }
    if (!isset($args['password']) || null === $args['password']) {
        throw new Exception("no_password", 1);
    }
    try {
        check_password($args['password']);
        return true;
    } catch (Exception $e) {
        throw $e;
    }
    return false;
}

function create_accountfile($email, $password)
{
    try {
        $dir = VAR_FOLDER;
        $filename = ".account";
        $hashedPass = password_hash($password, PASSWORD_DEFAULT);
        $hashedEmail = password_hash($email, PASSWORD_DEFAULT);
        if (!file_exists($dir)) {
            mkdir($dir, 0777, true);
        }
        if (file_exists($dir . DS . $filename)) {
            throw new Exception("account_exists", 1);
        }
        $file = fopen($dir . DS . $filename, "w");
        fwrite($file, $hashedEmail. "\n");
        fwrite($file, $hashedPass . "\n");
        fclose($file);
        return true;
    } catch (Exception $e) {
        throw new Exception($e->getMessage(), $e->getCode());
    }
}

function create_account($email, $password)
{
    if (null === $email) {
        throw new Exception("no_email", 1);
    }
    if (null === $password) {
        throw new Exception("no_password", 1);
    }
    try {
        $password = sanitize_password($password);
        $email = sanitize_email($email);
        create_accountfile($email, $password);
        return true;
    } catch (Exception $e) {
        throw $e;
    }
    return false;
}

function create_meta($args)
{
    # TODO
}

function clean_install()
{
    uninstall();
}

function process_form($args)
{
    try {
        check_form($args);
    } catch (Exception $e) {
        throw $e;
    }
    try {
        create_account($args['email'], $args['password']);
    } catch (Exception $e) {
        clean_install();
        throw $e;
    }
    // try {
    //     create_meta($args);
    // } catch (Exception $e) {
    //     clean_install();
    //     throw $e;
    // }
    return true;
}
