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
$socialimage = array_key_exists('socialimage', $meta) && $meta['socialimage'] ? 'assets/images/' . $meta['socialimage'] : '';
$favicon = array_key_exists('favicon', $meta)  && $meta['favicon'] ? 'assets/images/' . $meta['favicon'] : '';
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
    <body>
        <?php
        if ($error && strlen($error)) {
            put_error($error);
        } else {
        ?>

        <div id="drop_file_zone" ondrop="upload_file(event)" ondragover="onDragOver()">
            <div id="drag_upload_file">
            <p>Drop file here</p>
            <p>or</p>
            <p>
                <input type="button" value="Select File" onclick="file_explorer();">
            </p>
            <input type="file" id="selectfile">
        </div>
        <input class="modal-state" id="modal-1" type="checkbox" checked />
        <aside class="modal">
            <label class="modal__bg" for="modal-1"></label>
            <div class="modal__inner">
                <label class="modal__close" for="modal-1"></label>
                <h1><?= translate('edit_mode_welcome') ?></h1>
                <p>
                    <ul>
                        <li>📝 All the text is editable, just click on the text to change it.</li>
                        <li> 🖼 To add an image, just drag and drop it on the screen.</li>
                        <li>🔁 Reorder the images by moving them around.</li>
                    </ul>

                    <br/>
                </p>
            </div>
        </aside>

        <aside class="controls">
            <div class="editbutton preview">
                <img src="data:image/png;base64,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" alt="<?= translate('preview') ?>"/>
            </div>
            <div class="editbutton save">
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEUAAABQCAYAAABPlrgBAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAABAxJREFUeJztmkFoXEUch7/f23TRhiJakIBCLU03oUQ8bApSC/GiJxOhWKUIelCaJm2tePEYxIvgQRTtJqGmeBLBImLxohLwJLHRqtBoNjaCFsWq1ZLEZpN9fw+NGppJsm/3vexmd77jvP/M/Pje7Nu3swMej8fjSRQBZIcubcVmnsPUI3RbtUOVhGzWjAkCfVwops9807/jSmxD7zs1sW1+IfWJpL1xDbrRGPa34M1CGLz4dX/rr5WOFxQWm17YzEIAhG4GHUsH4bfZXP7hSscLDDsUR7DaQLcKey87NPVkJaMEQi1xRaoJJCkMT1cipsnZajZn0o8r5jNrQbql3MmWTXDF0JqffWEpjF1IcuUDGaLZ3fk/MYz3tr4VNZ1bChodP7L7oRtbs7nJ1wVHo06yHDPOEzTfN957x9x6tZ0n8z2I91355rbPH9j6W7obMYB098qS8sUEUYrjQPBpKUIAzvW1frDatQuPdhTO9WfO/FlgrxnuujI/ShsuxYSVXCytWzt1IjP/V8EOxilmw6UkQdxi6kIKxCumbqRAfGLqSgrEI6bupEDlYupSClQmpm6lQAQxufwTy5vrWgqUJgZsJJvL3/9vU91LgfXFSEoBI12np2+CBpECpYhh58y1xaehgaTA/2KAs67rgqOYqaGkwHUxwbw9jnF5xUXRnh2+2FGFX8mWKrW2a2B0la2Nyhg7kbmKbNh9tbi/GiulOzs0uWu9oq6B0abZljufTSyF9KGzPdTORO7E2miHjKnOwfyaVbMJpzCKfwjHohXpSCtFUfZCEsQgTHL8SFIMTScVJAqCRHNEe6Zo4W1gJpkopWJhQDiS5AyRpIz37vk5DO2QmV1LKtDaWCjTkbG+tq+SnCXyg/aL/szZ7NBkB8Zhw9plKvkrtlwMQsF0gI2M9WUSFQJlSAEY7818Dzwfc5aaoeHeaEvBS3HgpTjwUhx4KQ68FAdeigMvxYGX4sBLcVDWa342N/mApGcMa1MN7vOamAH7KFhYfOnz43t+j9o/spTsYP644DUAoaXjybXF9Ui6J9yy5ZF7c9/t/6yv7VKU/pHucufJiTbMXonSp5oI7lqU3ojaL9rOWxAcXPo3bTPRve/UxLYoHaI9D2wznrlVMF9M3R6lRyy7+WZMIwpxjFUJq53zDRccZ3HXIBYpYZEHvzy2eyqOsSohjnO+4N9TnHgpDrwUB16KAy/FgZfiwEtx4KU48FIceCkOvBQHXooDL8WBl+LAS3HgpThQ52C+Jo6B1goGr/qVcgOCMDD4odpBagkzLgYyVjm433gYXC2m7Z2g+ZefXgberXagqmM2F8Bj55/KXNZSgzpz+QME9GDaXuV4G4rJijJdCFLF4bHD7TVxzN7j8Xg8jcg/8n6sufy1u4cAAAAASUVORK5CYII=" alt="<?= translate('save') ?>" />
            </div>
            <div class="editbutton cancel">
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAABQCAYAAACu/a1QAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAABKlJREFUeJztnE1sFGUYx///mek2KsFDd4diMKbIwfSgN/xGJEYuJtYvPFEXCpSk8aJUpKUWYreJJyVRoEHttoZLY/DjIEoEgomeuGiUaiq0ftDYbguCqch+zOOBVujOu7a78y5LM+/vts/zzH+f/868OzPvzruAwWAwhASWQ7T2vUS9Z8tWgA9CcGupOkKkABzNQfadi+88q7FFALrNH+903JFIF4hWAJYuWQH+BrAt9ULbfpCiS1dbgxBhbCTSD2K7Vl0ABG4msNft627XqWvrEorVVTWS7NClV4A1ixrWHJ76+JiWIaBnD4kQ4DYtWnO9lcb30TLmo8nXV1mwTqhyIhgmkS5aVOQWkMv8cWRzOeeOyU3bR4vvdDZOUAEAsIQtyo9R8HZqQ/uLJYmKMJbs/ojEk7PihGPZ2S0AdpWkew2BD/uad9+4DeDTvoSIwLPeLFmYFAveWwVSzfUDnZGStacJbN6ys1tAxRFEfjbetONMEO2x+M4TIhj0Z1g7ecl5Kog2ENB8/UBnhJRmVc6DvBNEGwBAikD2q1IibAkqH8j8lU+ftb6E4PTEcOaLINozZJDpn77IyYMPu8nE3UG0WdObuMsm1l45XRW7NeIA78kPi8hxAp8GaWyWHrGZYL0/IUcAHC5BLwuJfEi3NzEKYqmOJhcSAjlqhdE4ABBcpvUafKERbvMi+KHSTVSI75w00g9FUL0ScvUoIL17Ae7ylYvsE1javsX147WQfMIX9aSJtP67FyAkcxPSXzsXNuz+E8CRa4uX9HU7Iv45AyFOpeJtn5ejbR24yS6fcQCgY32Vamz7OT8e7jFf6QYqiTEfVoz5sKJlGgudnVbszurlXk4cALBsZlPrd5wuNMe+9GBnNJ2ORGdei5MePbd+90Wldk9PVY09thy2TQCoynmX/tjU8YuOtrXsebcucoCeDNnEoE0M0pOhWF/3XlXtkmTXymw6cnam1iYG7WzVmegHXcobLDcy8aXt2D/O1HqONeL2Jl7W0bemqWs8kh8i8KiyVPAAiVnzbyRrmLV88wLTQqsUMaV2sYR6zBvzYcWYDyvGfFgx5sOKMR9WjPmwYsyHFWM+rBjzYcWYDyvGfFgx5sOKJvPyuy8C+VVZCfzmD4rYnroeAv+qCilQWyR6fqjM8nlUoUEgVQBAMGPneEhVmoq3H3L7Ew0iuH0mJsJvx5vaT6nqxeZqiPf41QemrCnLjgzoaFuL+fHN7WMAeuZVTMo48Ml8tacfJPI9TKQDM+bDijE/b4RlWX6qjSL7U5r34GUK1NcU3dB1RVxV1EvbipUaBcwz56nXrBFrS+6rzKzYs6dawNX5cYFcnlxcN6baRmk+uij3k2pdC4H7YsnEs4E7LQMXF//1ColofpzASaxbl1NtU3CMuMnEAIDnNPZXKV4aj7cr1/cV/MITT72gb0Ehcj5z2X6/ULqg+dTGjm8g0leerq4PBFvPN796oVD+f091tKtbIDipv63yI5ADY/G2gnsdmMP8WGPrVCZtPwaI8iblBsUTke7UcGbrXP+yMO+LArev+34R7xkIV1C1drby/COC70VyByc2vjZU6WYMBoPBcKPwL1M2epONsbRKAAAAAElFTkSuQmCC" alt="<?= translate('cancel') ?>">
            </div>
        </aside>
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
        <script src="<?= url('assets/js/edit.js')?>"></script>
    </body>
</html>
<?php endif; ?>
