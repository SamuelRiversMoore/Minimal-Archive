<?php
	define('DS', '/');
	define('LIB', './lib/');
	include_once LIB . 'functions.php';

    /**
     * Image folder name
     * @var string
     */
    $dir = 'images';
    $meta = textFileToArray('./meta.txt');
?>
<html>
	<head>
    	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    	<title><?= $meta['title']; ?></title>
        <meta name="description" content="<?= $meta['description']; ?>" />

        <meta property="og:title" content="<?= $meta['title'] ?>">
        <meta property="og:description" content="<?= $meta['description'] ?>">
        <meta property="og:image" content="<?= url($meta['socialimage']) ?>">
        <meta property="og:url" content="<?= url() ?>">

    	<link rel="stylesheet" href="<?php echo url('assets/css/style.css')?>" type="text/css" media="screen"/>

	</head>
	<body>
		<header>
		    <section class="title"><?= $meta['title']; ?></section>
		</header>
		<main>
            <section class="Gallery">
                <?php
                $images = getImagesInFolder($dir);
                foreach ($images as $image){
                    $output = "<div class='Image'>";
                    $output .= "<div class='Image__container'>";
                    $output .= "<img class='lazy miniarch' src='" . url('assets/css/loading.gif') . "' data-src='" .  url("${dir}/${image}") ."' title='" . $image . "'/>";
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
                <?= $meta['note'] ?>
            </section>
		</footer>
		<script src="<?php echo url('assets/js/main.js')?>"></script>
	</body>
</html>
