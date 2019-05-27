<?php
if (!defined('minimalarchive') || !is_installed() || !isset($_POST['csrf_token']) || !isset($_POST['action']) || !isset($_SESSION['id'])) {
    http_response_code(401);
    exit();
}
if (!validate_session($_SESSION['id'], 'id')) {
    invalidate_session($_SESSION['id'], 'id');
    http_response_code(401);
    exit();
}

switch ($_POST['action']) {
    case 'upload':
        upload($_FILES);
        break;
    case 'save':
        save(json_decode($_POST['data'], true));
        break;
    default:
        # code...
        break;
}

function upload(array $files = [], $folder = DEFAULT_IMAGEFOLDER)
{
    try {
        $data = array();
        foreach ($files as $file) {
            $filename = save_file($file, $file['name'], $folder);
            $data[] = array(
                'name' => $filename,
                'type' => $file['type'],
                'extension' => pathinfo($file['name'], PATHINFO_EXTENSION)
            );
        }
        json_response('ok', 200, $data);
        return;
    } catch (Exception $e) {
        json_response($e->getMessage(), 400);
        return;
    }
}

function save(array $data = null)
{
    if (!$data || !count($data)) {
        json_response('Bad query', 400);
        return;
    }
    try {
        $meta = textFileToArray(DEFAULT_METAFILE);
        $result = array();
        foreach ($data as $key => $value) {
            if (array_key_exists($key, $meta)) {
                $meta[$key] = trim($value);
                $result[$key] = $meta[$key];
            }
        }

        update_file($meta);
        if (array_key_exists('images', $data)) {
            $result['images'] = delete_all_files_except($data['images']);
            $result['images'] = update_filenames($data['images']);
        }
        json_response('ok', 200, $result);
        return;
    } catch (Exception $e) {
        json_response($e->getMessage(), 500);
    }
}

function delete_all_files_except(array $data = null)
{
    try {
        $meta = textFileToArray(DEFAULT_METAFILE);
        $imagesdir = is_array($meta) && array_key_exists('imagesfolder', $meta) ? $meta['imagesfolder'] : null;
        $images = getImagesInFolder($imagesdir);
        if (!$data || !count($data)) {
            return array();
        }
        if (!$imagesdir) {
            throw new Exception("no_image_folder", 1);
            return;
        }
        $result = array();
        foreach ($images as $image) {
            if (!array_key_exists_in_array_of_arrays($image, 'filename', $data)) {
                @unlink(ROOT_FOLDER . DS . $imagesdir . DS . $image);
            } else {
                $result[] = array('src' => url($imagesdir . DS . $image), 'filename' => $image);
            }
        }
        return $result;
    } catch (Exception $e) {
        throw new Exception($e->getMessage(), $e->getCode());
    }
}

function update_filenames(array $images = null)
{
    try {
        $meta = textFileToArray(DEFAULT_METAFILE);
        $imagesdir = array_key_exists('imagesfolder', $meta) ? $meta['imagesfolder'] : null;
        $existingImages = getImagesInFolder($imagesdir);
        if (!$images || !count($images)) {
            return array();
        }
        if (!$imagesdir) {
            throw new Exception("no_image_folder", 1);
            return;
        }
        $result = array();
        foreach ($images as $image) {
            if (array_key_exists('filename', $image) && array_key_exists('newfilename', $image)) {
                if (in_array($image['filename'], $existingImages)) {
                    $filename = update_filename(ROOT_FOLDER . DS . $imagesdir . DS . $image['filename'], $image['newfilename']);
                    $result[] = array(
                        'src' => url($imagesdir . DS . pathinfo($filename, PATHINFO_FILENAME) . '.' . pathinfo($filename, PATHINFO_EXTENSION)),
                        'filename' => pathinfo($filename, PATHINFO_FILENAME)
                    );
                }
            }
        }
        return $result;
    } catch (Exception $e) {
        throw new Exception($e->getMessage(), $e->getCode());
    }
}
