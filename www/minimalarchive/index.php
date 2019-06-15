<?php
    if (!defined('minimalarchive')) {
        redirect('/');
    }

    if (!has_meta()) {
        redirect('/install');
    }
    $meta = textFileToArray(DEFAULT_METAFILE);
    $imagesdir = array_key_exists('imagesfolder', $meta) ? $meta['imagesfolder'] : null;
    $title = array_key_exists('title', $meta) ? $meta['title'] : '';
    $description = array_key_exists('description', $meta) ? $meta['description'] : '';
    $socialimage = array_key_exists('socialimage', $meta) && $meta['socialimage'] ? 'assets/images/' . $meta['socialimage'] : '';
    $favicon = array_key_exists('favicon', $meta)  && $meta['favicon'] ? 'assets/images/' . $meta['favicon'] : '';
    $note = array_key_exists('note', $meta) ? $meta['note'] : '';
    $bgcolor = array_key_exists('bgcolor', $meta) && $meta['bgcolor']? $meta['bgcolor'] : '#c0c0c0';
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
        <title><?= $title; ?></title>
        <meta name="description" content="<?= $description ?>" />

        <meta property="og:title" content="<?= $title ?>">
        <meta property="og:description" content="<?= $description ?>">
        <meta property="og:image" content="<?= url($socialimage) ?>">
        <meta property="og:url" content="<?= url() ?>">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <link rel="icon" type="image/png" href="<?= url($favicon) ?>"/>
        <link rel="stylesheet" href="<?= url('assets/css/index.css') ?>" type="text/css" media="screen"/>

    </head>
    <body style="background-color: <?= $bgcolor ?>; color: <?= $textcolor ?>"">
        <?php
        if ($error && strlen($error)) {
            put_error($error);
        } else {
            ?>
        <header>
            <section class="title"><?= $title ?></section>
        </header>
        <main>
            <section class="Gallery">
                <?php
                foreach ($images as $image) {
                    $output = "<div class='Image'>";
                    $output .= "<div class='Image__container'>";
                    $output .= "<img class='lazy miniarch' src='" . url('assets/css/loading.gif') . "' data-filename='" . $image . "' data-src='" .  url("${imagesdir}/${image}") ."' title='" . $image . "'/>";
                    $output .= "</div>";
                    $output .= "<div class='Image__caption'><span>" . pathinfo($image, PATHINFO_FILENAME) . "</span></div>";
                    $output .= "</div>";
                    echo $output;
                } ?>
            </section>
            <span id="breaker"></span>
        </main>
        <footer>
            <section class="note">
                <?= $note ?>
            </section>
        </footer>
        <?php
        }
        ?>
        <script src="<?= url('assets/js/index.js')?>"></script>
    </body>
</html>
