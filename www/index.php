<?php
	define('DS', '/');
	define('LIB', './lib/');
	include_once LIB . 'functions.php';

    $meta = textFileToArray('./meta.txt');
    $imagesdir = array_key_exists('imagesfolder', $meta) ? $meta['imagesfolder'] : null;
    $title = array_key_exists('title', $meta) ? $meta['title'] : '';
    $description = array_key_exists('description', $meta) ? $meta['description'] : '';
    $socialimage = array_key_exists('socialimage', $meta) ? $meta['socialimage'] : '';
    $note = array_key_exists('note', $meta) ? $meta['note'] : '';
?>
<html>
	<head>
    	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    	<title><?= $title; ?></title>
        <meta name="description" content="<?= $description ?>" />

        <meta property="og:title" content="<?= $title ?>">
        <meta property="og:description" content="<?= $description ?>">
        <meta property="og:image" content="<?= url($socialimage) ?>">
        <meta property="og:url" content="<?= url() ?>">

    	<link rel="stylesheet" href="<?php echo url('assets/css/style.css')?>" type="text/css" media="screen"/>

	</head>
	<body>
		<header>
		    <section class="title"><?= $title ?></section>
		</header>
		<main>
            <section class="Gallery">
                <?php
                $images = getImagesInFolder($imagesdir);
                foreach ($images as $image){
                    $output = "<div class='Image'>";
                    $output .= "<div class='Image__container'>";
                    $output .= "<img class='lazy miniarch' src='" . url('assets/css/loading.gif') . "' data-src='" .  url("${imagesdir}/${image}") ."' title='" . $image . "'/>";
                    $output .= "</div>";
                    $output .= "<div class='Image__caption'><span>" . $image . "</span></div>";
                    $output .= "</div>";
                    echo $output;
                }

                ?>
            </section>
		    <span id="breaker"></span>
		</main>
		<footer>
            <section class="note">
                <?= $note ?>
            </section>
		</footer>
		<script src="<?php echo url('assets/js/main.js')?>"></script>
	</body>
</html>
