<?php
if (!defined('minimalarchive') || !is_installed()) {
    header('location: /');
    exit();
}
if (!has_meta()) {
    header('location: /install');
    exit();
}
if (!isset($_POST['csrf_token'])) {
    create_token();
} else {
    if (!check_token($_POST['csrf_token'], 'edit')) {
        create_token();
    }
}
$error = "";
if (isset($_SESSION['id'])) {
    if (validate_session($_SESSION['id'], 'id')) {
        $access_granted = true;
    } else {
        invalidate_session($_SESSION['id'], 'id');
        $access_granted = false;
    }
} else {
    // CREDENTIALS CHECK
    $access_granted = false;
    if (isset($_POST['email']) && isset($_POST['password']) && check_token($_POST['csrf_token'], 'edit')) {
        try {
            if (check_credentials($_POST['email'], $_POST['password']) === true) {
                // if credentials are OK, setup session and create session file
                $_SESSION['id'] = $_POST['email'];
                add_session($_POST['email'], 'id');
                $access_granted = true;
            } else {
                $error .= translate('bad_credentials');
            }
        } catch (Exception $e) {
            $error .= translate($e->getMessage());
        }
    }
}
?>

<?php if (false === $access_granted): ?>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="robots" content="noindex, nofollow">
        <title>Edit</title>
        <link rel="stylesheet" href="<?= url('assets/css/install.css') ?>">
    </head>
    <body>
        <main>
            <?php
            if (strlen($error)) {
                put_error($error);
            }
            ?>
            <section class="Form">
                <form class="pure-form pure-form-stacked" action="/edit" method="post" accept-charset="utf-8">
                    <fieldset>
                        <legend>Edit</legend>
                        <div class="pure-control-group">
                            <label for="email">Email Address *</label>
                            <input id="email" type="email" placeholder="Email Address" required="true" name="email" autofocus="true" autocomplete="on">
                        </div>

                        <div class="pure-control-group">
                            <label for="password">Password *</label>
                            <input id="password" type="password" placeholder="Password" required="true" name="password">
                        </div>

                        <input type="hidden" name="csrf_token" value="<?= get_token('edit') ?>" />
                        <button type="submit" class="pure-button pure-button-primary">Submit</button>
                    </fieldset>
                </form>
            </section>
        </main>
        <footer>
            <section class="note">
            </section>
        </footer>
    </body>
</html>
<?php endif; ?>

<?php
    if ($access_granted):
?>
<?php
$meta = textFileToArray(ROOT_FOLDER . DS . 'meta.txt');
$imagesdir = array_key_exists('imagesfolder', $meta) ? $meta['imagesfolder'] : null;
$title = array_key_exists('title', $meta) ? $meta['title'] : '';
$description = array_key_exists('description', $meta) ? $meta['description'] : '';
$socialimage = array_key_exists('socialimage', $meta) && $meta['socialimage'] ? 'assets/images/' . $meta['socialimage'] : '';
$favicon = array_key_exists('favicon', $meta)  && $meta['favicon'] ? 'assets/images/' . $meta['favicon'] : '';
$note = array_key_exists('note', $meta) ? $meta['note'] : '';

$error = null;
try {
    $images = getImagesInFolder($imagesdir);
} catch (Exception $e) {
    $error = translate($e->getMessage(), $imagesdir);
}
?>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>Edit - <?= $title; ?></title>
        <meta name="description" content="<?= $description ?>" />

        <meta property="og:title" content="<?= $title ?>">
        <meta property="og:description" content="<?= $description ?>">
        <meta property="og:image" content="<?= url($socialimage) ?>">
        <meta property="og:url" content="<?= url() ?>">

        <link rel="icon" type="image/png" href="<?= url($favicon) ?>"/>
        <link rel="stylesheet" href="<?= url('assets/css/edit.css') ?>" type="text/css" media="screen"/>

    </head>
    <body>
        <?php
        if ($error && strlen($error)) {
            put_error($error);
        } else {
            ?>

        <div id="drop-area">
            <span class="drop-message"><?= translate('edit_dragzone') ?></span>
            <form>
                <input type="hidden" name="csrf_token" value="<?= get_token('upload') ?>" />
            </form>
        </div>
        <input class="modal-state" id="modal-1" type="checkbox" checked />
        <aside class="modal">
            <label class="modal__bg" for="modal-1"></label>
            <div class="modal__inner">
                <label class="modal__close" for="modal-1"></label>
                <h1><?= translate('edit_mode_welcome') ?></h1>
                <p>
                    <ul>
                        <li>📝 All the text is editable, just click on the text to change it.</li>
                        <li>🖼 To add an image, just drag and drop it on the screen.</li>
                        <li>🔁 Reorder the images by moving them around.</li>
                    </ul>

                    <br/>
                </p>
            </div>
        </aside>

        <aside class="controls">
            <div class="editbutton preview pure-button">
                <span><?= translate('exit') ?></span>
            </div>
            <div class="editbutton save pure-button">
                <input type="hidden" name="csrf_token" value="<?= get_token('save') ?>" />
                <span><?= translate('save') ?></span>
            </div>
            <div class="editbutton cancel pure-button">
                <span><?= translate('cancel') ?></span>
            </div>
        </aside>
        <header>
            <section class="title" contenteditable='true'><?= $title ?></section>
        </header>
        <main>
            <section class="Gallery">
                <?php
                foreach ($images as $image) {
                    $output = "<div class='Image'>";
                    $output .= "<div class='Image__container'>";
                    $output .= "<img class='lazy miniarch' src='" . url('assets/css/loading.gif') . "' data-filename='" . $image . "' data-src='" .  url("${imagesdir}/${image}") ."' title='" . $image . "'/>";
                    $output .= "</div>";
                    $output .= "<div class='Image__caption'><span contenteditable='true'>" . $image . "</span></div>";
                    $output .= "</div>";
                    echo $output;
                } ?>
            </section>
            <span id="breaker"></span>
        </main>
        <footer>
            <section class="note" contenteditable='true'>
                <?= $note ?>
            </section>
        </footer>
        <?php
        }
        ?>
        <script src="<?= url('assets/js/edit.js')?>"></script>
    </body>
</html>
<?php endif; ?>
