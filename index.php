<html>
<head>
<meta http-equiv="Content-Type" content="text/html">
<title>Show images in folder</title>
<style type="text/css">
body {
    margin: 10px 0px 10px 10px;
    padding: 0;
    background: #fff;
    text-align: left;
}
.legend {
    padding: 0 0 5px;
    text-align: left;
    font: 10px sans-serif;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.container {
    width: 100%;
}
.img {
	display: inline-block;
	vertical-align: top;
	margin: 0px 10px 10px 0px;
	text-align: center;
}
.small {
	max-width: 150px;
	max-height: 150px;
}
.large {
	max-width: 100% !important;
	max-height: auto;
}
img {
    display: inline-block;
    margin: 0px auto 5px;
	max-width: 100%;
	height: auto;
	cursor: pointer;
}
.small>img{	max-height: 83%;}

</style>
<script type="text/javascript" src="http://code.jquery.com/jquery-1.11.0.min.js"></script>
</head>
<body>
 <!-- <div id="header">Title</div> -->
<?php
$folder = 'img/';
$filetype = '*.*';
$files = glob($folder.$filetype);
$count = count($files);
 
$sortedArray = array();
for ($i = 0; $i < $count; $i++) {
    $sortedArray[date ('YmdHis', filemtime($files[$i]))] = $files[$i];
}
 
krsort($sortedArray);

echo '<div id="container">';
foreach ($sortedArray as &$filename) {
    echo '<div class="img small">';
    echo '<img src="'.$filename.'" />';
    echo '<div class="legend" title="'.substr($filename,strlen($folder),strpos($filename, '.')-strlen($folder)).'">';
    echo substr($filename,strlen($folder),strpos($filename, '.')-strlen($folder));
    echo '</div>';
    echo '</div>';
}
echo '</div>';
?>

<script type="text/javascript">
	$('div.img').on('click', function (event) {
	if ($(this).hasClass('small')){
			$('.large').removeClass('large').addClass('small');
			$(this).removeClass('small').addClass('large');
		} else {
			$(this).removeClass('large').addClass('small');
		}
	});
</script>

</body>