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
            }
        } catch (Exception $e) {
            echo translate($e->getMessage());
        }
        try {
            create_account($email, $password);
            echo translate('account_created');
        } catch (Exception $e) {
            echo translate($e->getMessage());
        }
    }
}
?>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Minimal-Archive installation</title>
</head>
<body>
    <header>
        <section class="title">Installation</section>
    </header>
    <main>
        <section class="Form">
            <form action="/install?action=confirm" method="post" accept-charset="utf-8">
                <div class="field">
                    <label class="label">Title</label>
                    <div class="control">
                        <input class="input" type="text" placeholder="Minimal-Archive" name="title">
                    </div>
                </div>

                <div class="field">
                    <label class="label">Description</label>
                    <div class="control">
                        <textarea class="textarea" name="site-description" placeholder="Textarea"></textarea>
                    </div>
                </div>

                <div class="field">
                    <label class="label">Email</label>
                    <div class="control">
                        <input class="input is-danger" type="email" placeholder="Email input" name="email">
                    </div>
                </div>

                <div class="field">
                    <label class="label">Password</label>
                    <div class="control">
                        <input class="input is-danger" type="password" placeholder="Email input" name="password">
                    </div>
                </div>

                <div class="field">
                    <label class="label">Social Share Image</label>
                    <div class="control">
                        <input class="upload" type="file">
                    </div>
                </div>

                <div class="field">
                    <label class="label">Images folder</label>
                    <div class="control">
                        <input class="folder" name="site-folder" type="text" placeholder="Folder name without trailing slash or ./">
                    </div>
                </div>

                <div class="field">
                    <div class="control">
                        <label class="checkbox">
                            <input type="checkbox">
                            Double checked everything ? (in case something is wrong, delete the files in ./config folder and the installation will be available again)
                        </label>
                    </div>
                </div>
                <input type="hidden" name="csrf_token" value="<?= get_token('install') ?>" />
                <button type="submit">SUBMIT</button>
                </form>
            </section>
        </main>
        <footer>
            <section class="note">
            </section>
        </footer>
    </body>
</html>
