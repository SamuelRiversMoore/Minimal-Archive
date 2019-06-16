<?php
if (!defined('minimalarchive')) {
    redirect('/');
}

if (!has_account()) {
    redirect('/install');
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
            uninstall(isset($_POST['deleteimages']));
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title><?= translate('uninstall') ?></title>
        <link rel="stylesheet" href="<?= url('assets/css/install.css') ?>">
    </head>
    <body>
        <main>
            <?php
            if (strlen($error)) {
                put_error($error);
            }
            ?>

            <?php
            if (strlen($success)) {
                put_success($success);
            }
            ?>

            <?php if (!strlen($success)): ?>
            <section class="Form">
                <form class="pure-form pure-form-stacked" action="<?= url('/uninstall') ?>" method="post" accept-charset="utf-8">
                    <fieldset>
                        <legend><?= translate('uninstall') ?></legend>
                        <div class="pure-control-group">
                            <label for="email"><?= translate('email_address') ?> *</label>
                            <input id="email" type="email" placeholder="Email Address" required="true" name="email">
                        </div>

                        <div class="pure-control-group">
                            <label for="password"><?= translate('password') ?> *</label>
                            <input id="password" type="password" placeholder="Password" required="true" name="password">
                        </div>

                        <div class="pure-controls">
                            <label for="deleteimages" class="pure-checkbox">
                                <input id="deleteimages" type="checkbox" name="deleteimages"> <?= translate('delete_images') ?>
                            </label>
                        </div>

                        <div class="pure-controls">
                            <label for="cb" class="pure-checkbox">
                                <input id="cb" type="checkbox" name="confirm" required="true"> <?= translate('double_check') ?>
                            </label>
                        </div>
                        <input type="hidden" name="csrf_token" value="<?= get_token('uninstall') ?>" />
                        <button type="submit" class="pure-button pure-button-primary"><?= translate('confirm') ?></button>
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
