<?php
	$baseUrl = "http://" . $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI'];
	$file = '*';
	$dir = 'assets/img/'; //put images here
?>
<html>
	<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>Show images in folder</title>
		<link rel="stylesheet" href="<?php echo $baseUrl ?>assets/css/style.css" type="text/css" media="screen"/>
	</head>
	<body>
		<header>
		    <section class="title">Minimal Archive</section>
		</header>
		<main>
		    <?php

	        // Open the directory, and read its contents
	        if (is_dir($dir)){
	            $files = scandir($dir);
	            foreach ($files as $file){
	                if ($file != "." && $file != "..") {
	                    echo "<div class='img small'>";
	                    echo "<img class='lazy' src='" . $baseUrl . "assets/css/loading.gif' data-original='" . $baseUrl . $dir . $file ."' title='" . $file . "'/>";
	                    echo "<div class='caption'>" . $file . "</div>";
	                    echo "</div>";
	                }
	            }
	        }

	        ?>
		    <span id="breaker"></span>
		</main>
		<footer>
		</footer>
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
		<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery.lazyload/1.9.1/jquery.lazyload.min.js"></script>
		<script src="<?php echo $baseUrl ?>assets/js/main.js"></script>
	</body>
</html>