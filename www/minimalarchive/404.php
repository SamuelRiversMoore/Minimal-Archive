<?php
if (!defined('minimalarchive')) {
    redirect('/');
}
?>

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="robots" content="noindex, nofollow">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title><?= translate('404')?></title>
        <?php
        if ($font = getFontByName("Arcadia Textbook")) {
            echo "<style>" . getFontStyle($font) . "</style>";
        }
        ?>
        <style type="text/css">
            html {
                height: 100%;
                width: 100%;
            }
            body {
                margin: 0;
                padding: 0;
                font-size: 12px;
                font-family: "Arcadia Textbook", "SF Mono", "Arcadia", "Zwizz", "Fira Code", "IBM Plex Mono", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
                width: 100%;
                overflow-x: hidden;
                color: #333;
                min-height: 100%;
                height: 100%;
                width: 100%;
                position: relative;
            }
            .content {
                display: inline-block;
                text-align: center;
                top: 50%;
                left: 50%;
                -webkit-transform: translate(-50%, -50%);
                transform: translate(-50%, -50%);
                position: absolute;
            }
        </style>
    </head>
    <body>
        <div class="content">
            <h1><?= translate('404') ?></h1>
            <div><?= translate('gotohomepage') ?>? <a href="<?= url('/') ?>"><?= translate('yes')?></a> — <span><?= translate('no')?></span>
            </div>
        </div>
    </body>
</html>
