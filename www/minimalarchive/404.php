<?php
if (!defined('minimalarchive'))
{
    redirect('/');
}
?>

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="robots" content="noindex, nofollow">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title><?= translate('404')?></title>
        <style type="text/css">
            body {
                margin: 0;
                padding: 0;
                font-size: 12px;
                font-family: "Arcadia Textbook", "SF Mono", "Arcadia", "Zwizz", "Fira Code", "IBM Plex Mono", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
                width: 100%;
                overflow-x: hidden;
                color: #333;
                min-height: 100%;
            }
        </style>
    </head>
    <body>
        <div>
            <h1><?= translate('404') ?></h1>
            <div>Go to homepage? <a href="<?= url('/') ?>">Yes</a> — <span>No</span>
            </div>
        </div>
    </body>
</html>
