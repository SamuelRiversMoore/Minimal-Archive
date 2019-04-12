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

include_once(BASE_FOLDER . DS . 'engine' . DS . 'functions_install.php');
?>

<?php
$error = "";
$success = "";
if (isset($_POST['confirm']) && check_token($_POST['csrf_token'], 'install')) {
    try {
        process_form($_POST);
        $success .= translate("installation_complete");
    } catch (Exception $e) {
        $error .= translate($e->getMessage());
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
            <header>
                Installation
            </header><!-- /header -->
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
                <form class="pure-form pure-form-stacked" action="/install?action=confirm" method="post" accept-charset="utf-8" enctype="multipart/form-data">
                    <fieldset>
                        <legend>Configuration</legend>

                        <div class="pure-control-group">
                            <label for="foo">Title *</label>
                            <input id="foo" type="text" class="pure-input-1-2" placeholder="Enter something here..." required="true" name="title">
                        </div>

                        <div class="pure-control-group">
                            <label for="note">Note (visible at the bottom of the page)</label>
                            <textarea id="note" class="pure-input-1-2" placeholder="Note" name="note"></textarea>
                        </div>

                        <div class="pure-control-group">
                            <label for="favicon">Favicon</label>
                            <input id="favicon" type="file" accept="image/*" class="pure-input-1-2" name="favicon">
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend>Social</legend>
                        <div class="pure-control-group">
                            <label for="description">Description</label>
                            <textarea id="description" class="pure-input-1-2" placeholder="Description" name="description"></textarea>
                        </div>

                        <div class="pure-control-group">
                            <label for="socialimage">Share Image</label>
                            <input id="socialimage" type="file" accept="image/*" class="pure-input-1-2" name="socialimage">
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend>Advanced</legend>
                        <div class="pure-control-group">
                            <label for="imagefolder">Custom Images Folder</label>
                            <input id="imagefolder" type="text" class="pure-input-1-2" placeholder="Folder name without trailing slash (default: images)" name="imagefolder">
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend>Account</legend>
                        <div class="pure-control-group">
                            <label for="email">Email Address *</label>
                            <input id="email" type="email" placeholder="Email Address" required="true" name="email">
                        </div>

                        <div class="pure-control-group">
                            <label for="password">Password *</label>
                            <input id="password" type="password" placeholder="Password" required="true" name="password">
                        </div>
                    </fieldset>
                    <div class="pure-controls">
                        <label for="cb" class="pure-checkbox">
                            <input id="cb" type="checkbox" name="confirm" required="true"> Double check everything and tick the box
                        </label>
                    </div>
                    <input type="hidden" name="csrf_token" value="<?= get_token('install') ?>" />
                    <button type="submit" class="pure-button pure-button-primary">Submit</button>
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
