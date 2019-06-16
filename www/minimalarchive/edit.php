<?php
if (!defined('minimalarchive') || !is_installed()) {
    redirect('/');
}
if (!has_meta()) {
    redirect('/install');
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
unset($_POST);
?>

<?php if (false === $access_granted): ?>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="robots" content="noindex, nofollow">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title><?= translate('editor_title') ?></title>
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
                <form class="pure-form pure-form-stacked" action="<?= url('/edit')?>" method="post" accept-charset="utf-8">
                    <fieldset>
                        <legend><?= translate('editor_title') ?></legend>
                        <div class="pure-control-group">
                            <label for="email"><?= translate('email_address') ?> *</label>
                            <input id="email" type="email" placeholder="Email Address" required="true" name="email" autofocus="true" autocomplete="on">
                        </div>

                        <div class="pure-control-group">
                            <label for="password"><?= translate('password') ?> *</label>
                            <input id="password" type="password" placeholder="Password" required="true" name="password">
                        </div>

                        <input type="hidden" name="csrf_token" value="<?= get_token('edit') ?>" />
                        <button type="submit" class="pure-button pure-button-primary"><?= translate('confirm') ?></button>
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
$bgcolor = array_key_exists('bgcolor', $meta) && $meta['bgcolor'] ? $meta['bgcolor'] : '#c0c0c0';
$textcolor = array_key_exists('textcolor', $meta) && $meta['textcolor'] ? $meta['textcolor'] : '#333';

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
        <meta name="robots" content="noindex, nofollow">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" type="image/png" href="<?= url($favicon) ?>"/>
        <link rel="stylesheet" href="<?= url('assets/css/edit.css') ?>" type="text/css" media="screen"/>
    </head>
    <body style="background-color: <?= $bgcolor ?>; color: <?= $textcolor ?>">
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

        <aside class="modal">
            <label class="modal__bg" for="modal-1"></label>
            <div class="modal__inner">
                <label class="modal__close" for="modal-1"></label>
                <h1><?= translate('edit_mode_welcome') ?></h1>
                <p>
                    <ul>
                        <li>
                            <div class="icon">📝</div>
                            <div>All the text is editable, just click on the text to change it.<div></li>
                        <li>
                            <div class="icon">🖼</div>
                            <div>To add an image, just drag and drop it on the screen.<div>
                        </li>
                        <li>
                            <div class="icon">🔁</div>
                            <div>Reorder the images by renaming them.<div>
                        </li>
                    </ul>

                    <br/>
                </p>
            </div>
        </aside>

        <input type="checkbox" class="controls__toggle" id="toggle" />
        <label for="toggle">
            <div class="controls__mobile-toggle">
                <div class="pure-button controls__mobile-toggle--open">⚙️ <?= translate('controls_open') ?></div>
                <div class="pure-button controls__mobile-toggle--close">⚙️ <?= translate('controls_close') ?></div>
            </div>
        </label>
        <aside class="controls">
            <div class="controls__title"><?= translate('editor_title') ?></div>
            <!-- Buttons -->
            <div class="controls__buttons">
                <div class="editbutton upload">
                    <div class="editbutton__icon">
                        <span class="icon">⏫</span>
                    </div>
                    <div class="editbutton__content">
                        <input type="hidden" name="csrf_token" value="<?= get_token('upload') ?>" />
                        <div class="editbutton__label">
                            <span><?= translate('add_images') ?></span>
                        </div>
                        <input id="file-input" type="file" name="image_upload" multiple accept='image/*'/>
                    </div>
                </div>

                <div class="editbutton background">
                    <div class="editbutton__icon">
                        <span class="icon">🌄</span>
                    </div>
                    <div class="editbutton__content">
                        <div class="editbutton__label">
                            <span><?= translate('background_color') ?></span>
                        </div>
                        <div class="editbutton__submenu">
                            <input type="color" id="bg_color" name="bg_color" value="<?= $bgcolor ?>"><label for="bg_color"><?= $bgcolor ?></label>
                        </div>
                    </div>
                </div>

                <div class="editbutton text">
                    <div class="editbutton__icon">
                        <span class="icon">🅰</span>
                    </div>
                    <div class="editbutton__content">
                        <div class="editbutton__label">
                            <span><?= translate('text_color') ?></span>
                        </div>
                        <div class="editbutton__submenu">
                            <input type="color" id="text_color" name="text_color" value="<?= $textcolor ?>"><label for="text_color"><?= $textcolor ?></label>
                        </div>
                    </div>
                </div>
            </div>
            <!-- /Buttons -->

            <div class="controls__footer">
                <div class="controls__footer__note">
                    <span><?= translate('tip') ?>: </span><?= translate('instructions_add_pic') ?>
                </div>
                <div class="controls__footer__buttons">
                    <div class="editbutton save">
                        <div class="editbutton__icon">
                            <span class="icon">✍️</span>
                        </div>
                        <div class="editbutton__content">
                            <input type="hidden" name="csrf_token" value="<?= get_token('save') ?>" />
                            <div class="editbutton__label">
                                <span><?= translate('save') ?></span>
                            </div>
                        </div>

                    </div>

                    <div class="editbutton cancel">
                        <div class="editbutton__icon">
                            <span class="icon">🙅</span>
                        </div>
                        <div class="editbutton__content">
                            <div class="editbutton__label">
                                <span><?= translate('cancel') ?></span>
                            </div>
                        </div>
                    </div>

                    <div class="editbutton preview">
                        <div class="editbutton__icon">
                            <span class="icon">🏃</span>
                        </div>
                        <div class="editbutton__content">
                            <div class="editbutton__label">
                                <span><?= translate('exit') ?></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
        <main>

            <header>
                <section class="title" contenteditable='true'><?= $title ?></section>
            </header>

            <section class="Gallery">
                <?php
                foreach ($images as $image) {
                    $output = "<div class='Image'>";
                    $output .= "<div class='Image__container'>";
                    $output .= "<img class='lazy miniarch' src='" . url('assets/css/loading.gif') . "' data-filename='" . $image . "' data-src='" .  url("${imagesdir}/${image}") ."' title='" . $image . "'/>";
                    $output .= "</div>";
                    $output .= "<div class='Image__caption'><span contenteditable='true'>" . pathinfo($image, PATHINFO_FILENAME) . "</span></div>";
                    $output .= "</div>";
                    echo $output;
                } ?>
            </section>

            <footer>
                <section class="note" contenteditable='true'>
                    <?= $note ?>
                </section>
            </footer>
        </main>
        <?php
        }
        ?>
        <script src="<?= url('assets/js/edit.js')?>"></script>
    </body>
</html>
<?php endif; ?>
