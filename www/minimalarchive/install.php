<?php
if (!defined('minimalarchive') || is_installed()) {
    header('location: /');
    exit();
}

if (!isset($_POST['csrf_token'])) {
    create_token();
} else {
    if (!check_token($_POST['csrf_token'], 'install')) {
        create_token();
    }
}
?>

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
$error = "";
$success = "";

if (isset($_GET['action'])
    && isset($_POST)
    && isset($_POST['csrf_token'])
    && isset($_POST['email'])
    && isset($_POST['password'])) {
    if ($_GET['action'] === "confirm") {
        try {
            if (checkForm($_POST) === true) {
                $email = email_sanitize($_POST['email']);
                $password = password_sanitize($_POST['password']);
                try {
                    create_account($email, $password);
                    $success .= translate('account_created');
                } catch (Exception $e) {
                    $error .= translate($e->getMessage());
                }
            }
        } catch (Exception $e) {
            $error .= translate($e->getMessage());
        }
    }
}
?>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>Minimal-Archive installation</title>
        <link rel="stylesheet" href="<?= url('assets/css/install.css') ?>">
    </head>
    <body>
        <main>
            <?php if (strlen($error)) {
                echo "<aside class=\"notice error\">${error}</aside>";
            }?>

            <?php if (strlen($success)) {
                echo "<aside class=\"notice success\">${success}</aside>";
            }?>

            <?php if (!strlen($success)): ?>
            <section class="Form">
                <form class="pure-form pure-form-stacked" action="/install?action=confirm" method="post" accept-charset="utf-8">
                    <fieldset>
                        <legend>Installation</legend>

                        <div class="pure-control-group">
                            <label for="foo">Site title *</label>
                            <input id="foo" type="text" class="pure-input-1-2" placeholder="Enter something here..." required="true" name="title">
                        </div>

                        <div class="pure-control-group">
                            <label for="description">Site description *</label>
                            <textarea id="description" class="pure-input-1-2" placeholder="Description" name="description"></textarea>
                        </div>

                        <div class="pure-control-group">
                            <label for="imagefolder">Custom Images Folder</label>
                            <input id="imagefolder" type="text" class="pure-input-1-2" placeholder="Folder name without trailing slash (default: images)" name="imagefolder">
                        </div>

                        <div class="pure-control-group">
                            <label for="socialimage">Social Share Image</label>
                            <input id="socialimage" type="file" accept="image/*" class="pure-input-1-2" name="socialimage">
                        </div>

                        <!-- ACCOUNT -->

                        <div class="pure-control-group">
                            <label for="email">Email Address *</label>
                            <input id="email" type="email" placeholder="Email Address" required="true" name="email">
                        </div>

                        <div class="pure-control-group">
                            <label for="password">Password *</label>
                            <input id="password" type="password" placeholder="Password" required="true" name="password">
                        </div>

                        <div class="pure-controls">
                            <label for="cb" class="pure-checkbox">
                                <input id="cb" type="checkbox" required="true"> Double check everything and tick the box
                            </label>
                        </div>

                        <input type="hidden" name="csrf_token" value="<?= get_token('install') ?>" />
                        <button type="submit" class="pure-button pure-button-primary">Submit</button>
                    </fieldset>
                </form>
            </section>
            <?php endif; ?>
        </main>
        <footer>
            <section class="note">
            </section>
        </footer>
    </body>
</html>
