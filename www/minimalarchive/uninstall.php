<?php
if (!defined('minimalarchive')) {
    header('location: /');
    exit();
}

if (!has_account()) {
    header('location: /install');
    exit();
}

if (!isset($_POST['csrf_token'])) {
    create_token();
} else {
    if (!check_token($_POST['csrf_token'], 'uninstall')) {
        create_token();
    }
}
?>

<?php
$error = "";
$success = "";
if (isset($_POST['email']) && isset($_POST['password']) && check_token($_POST['csrf_token'], 'uninstall')) {
    try {
        if (check_credentials($_POST['email'], $_POST['password']) === true) {
            uninstall();
            $success .= translate("uninstall_complete");
        } else {
            $error .= translate('bad_credentials');
        }
    } catch (Exception $e) {
        $error .= translate($e->getMessage());
    }
}
?>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="robots" content="noindex, nofollow">
        <title>Uninstallation</title>
        <link rel="stylesheet" href="<?= url('assets/css/install.css') ?>">
    </head>
    <body>
        <main>
            <?php if (strlen($error)) {
                put_error($error);
            }?>

            <?php if (strlen($success)) {
                put_success($success);
            }?>

            <?php if (!strlen($success)): ?>
            <section class="Form">
                <form class="pure-form pure-form-stacked" action="/uninstall" method="post" accept-charset="utf-8">
                    <fieldset>
                        <legend>Uninstallation</legend>
                        <div class="pure-control-group">
                            <label for="email">Email Address *</label>
                            <input id="email" type="email" placeholder="Email Address" required="true" name="email">
                        </div>

                        <div class="pure-control-group">
                            <label for="password">Password *</label>
                            <input id="password" type="password" placeholder="Password" required="true" name="password">
                        </div>

                        <input type="hidden" name="csrf_token" value="<?= get_token('uninstall') ?>" />
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
