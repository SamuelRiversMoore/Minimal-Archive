<?php
if (!defined('minimalarchive') || !is_installed()) {
    header('location: /');
    exit();
}

if (!isset($_POST['csrf_token'])) {
    create_token();
} else {
    if (!check_token($_POST['csrf_token'], 'edit')) {
        create_token();
    }
}
if (!has_meta()) {
    header('location: /install');
    exit();
}

// CREDENTIALS CHECK
$error = "";
$access_granted = false;
if (isset($_POST['email']) && isset($_POST['password']) && check_token($_POST['csrf_token'], 'edit')) {
    try {
        if (check_credentials($_POST['email'], $_POST['password']) === true) {
            $access_granted = true;
        } else {
            $error .= translate('bad_credentials');
        }
    } catch (Exception $e) {
        $error .= translate($e->getMessage());
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
                            <input id="email" type="email" placeholder="Email Address" required="true" name="email">
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
$socialimage = array_key_exists('socialimage', $meta) && null !== $meta['socialimage'] ? 'assets/images/' . $meta['socialimage'] : '';
$favicon = array_key_exists('favicon', $meta)  && null !== $meta['favicon'] ? 'assets/images/' . $meta['favicon'] : '';
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
    <body class="Index">
        <?php
        if ($error && strlen($error)) {
            put_error($error);
        } else {
        ?>
        <header>
            <section class="title" contenteditable='true'><?= $title ?></section>
        </header>
        <main>
            <section class="Gallery">
                <?php
                foreach ($images as $image) {
                    $output = "<div class='Image'>";
                    $output .= "<div class='Image__container'>";
                    $output .= "<img class='lazy miniarch' src='" . url('assets/css/loading.gif') . "' data-src='" .  url("${imagesdir}/${image}") ."' title='" . $image . "'/>";
                    $output .= "</div>";
                    $output .= "<div class='Image__caption'><span contenteditable='true'>" . $image . "</span></div>";
                    $output .= "</div>";
                    echo $output;
                }

                ?>
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
        <script src="<?= url('assets/js/main.js')?>"></script>
    </body>
</html>
<?php endif; ?>
