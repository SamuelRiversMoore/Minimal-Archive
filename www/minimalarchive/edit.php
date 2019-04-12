<?php
if (!defined('minimalarchive') || !is_installed()) {
    header('location: /');
    exit();
}

if (!isset($_POST['csrf_token'])) {
    create_token();
} else {
    if (!check_token($_POST['csrf_token'], 'install')) {
        create_token();
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title></title>
</head>
<body>
    <?php echo "Hello this is the editor" ?>
</body>
</html>
