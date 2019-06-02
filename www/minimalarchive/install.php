<?php
if (!defined('minimalarchive') || is_installed()) {
    redirect('/');
}

if (!isset($_POST['csrf_token'])) {
    create_token();
} else {
    if (!check_token($_POST['csrf_token'], 'install')) {
        create_token();
    }
}

include_once(BASE_FOLDER . DS . 'engine' . DS . 'functions_install.php');
?>

<?php
$error = "";
$success = "";

function install($data, $retry = 0)
{
    if ($retry === 3) {
        throw new Exception("too_many_retries");
        return;
    }
    try {
        process_form($data);
        return "installation_complete";
    } catch (Exception $e) {
        if ($e->getMessage() === 'account_exists') {
            clean_installation();
            return install($data, $retry + 1);
        } else {
            throw new Exception($e->getMessage());
        }
    }
}

if (isset($_POST['confirm']) && check_token($_POST['csrf_token'], 'install')) {
    try {
        $success .= translate(install($_POST));
    } catch (Exception $e) {
        $error .= translate($e->getMessage());
    }
}
if (!has_meta()) {
    clean_installation();
}
?>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="robots" content="noindex, nofollow">
        <title><?= translate('setup')?></title>
        <link rel="stylesheet" href="<?= url('assets/css/install.css') ?>">
    </head>
    <body>
        <main>
            <header>
                <?= translate('setup') ?>
            </header>
            <section class="Form">
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
                <form class="pure-form pure-form-stacked" action="<?= url('/install?action=confirm') ?>" method="post" accept-charset="utf-8" enctype="multipart/form-data">
                    <fieldset>
                        <legend><?= translate('configuration')?></legend>

                        <div class="pure-control-group">
                            <label for="foo"><?= translate('title') ?> *</label>
                            <input id="foo" type="text" class="pure-input-1-2" placeholder="Enter something here..." required="true" name="title">
                        </div>

                        <div class="pure-control-group">
                            <label for="note"><?= translate('note')?></label>
                            <textarea id="note" class="pure-input-1-2" placeholder="Note" name="note"></textarea>
                        </div>

                        <div class="pure-control-group">
                            <label for="favicon"><?= translate('favicon')?></label>
                            <input id="favicon" type="file" accept="image/*" class="pure-input-1-2" name="favicon">
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend><?= translate('social') ?></legend>
                        <div class="pure-control-group">
                            <label for="description"><?= translate('description')?></label>
                            <textarea id="description" class="pure-input-1-2" placeholder="Description" name="description"></textarea>
                        </div>

                        <div class="pure-control-group">
                            <label for="socialimage"><?= translate('share_image')?></label>
                            <input id="socialimage" type="file" accept="image/*" class="pure-input-1-2" name="socialimage">
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend><?= translate('advanced') ?></legend>
                        <div class="pure-control-group">
                            <label for="imagefolder"><?= translate('custom_image_folder')?></label>
                            <input id="imagefolder" type="text" class="pure-input-1-2" placeholder="Folder name without trailing slash (default: images)" name="imagefolder">
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend><?= translate('account') ?></legend>
                        <div class="pure-control-group">
                            <label for="email"><?= translate('email_address') ?> *</label>
                            <input id="email" type="email" placeholder="Email Address" required="true" name="email" autocomplete="off">
                        </div>

                        <div class="pure-control-group">
                            <label for="password"><?= translate('password') ?> *</label>
                            <input id="password" type="password" placeholder="Password" required="true" name="password" autocomplete="new-password">
                        </div>
                    </fieldset>
                    <div class="pure-controls">
                        <label for="cb" class="pure-checkbox">
                            <input id="cb" type="checkbox" name="confirm" required="true"> <?= translate('double_check') ?>
                        </label>
                    </div>
                    <input type="hidden" name="csrf_token" value="<?= get_token('install') ?>" />
                    <button type="submit" class="pure-button pure-button-primary"><?= translate('confirm') ?></button>
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
