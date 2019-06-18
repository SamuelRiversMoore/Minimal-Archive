<?php
class Api
{
    const ERROR_NO_IMAGE_FOLDER = 'no_image_folder';

    private $imageFolder;
    private $metaFile;
    private $rootFolder;

    public function __construct(
        string $imageFolder = DEFAULT_IMAGEFOLDER,
        string $metaFile = DEFAULT_METAFILE,
        string $rootFolder = ROOT_FOLDER
    ) {
        $this->imageFolder = $imageFolder;
        $this->metaFile = $metaFile;
        $this->rootFolder = $rootFolder;
    }

    public function upload(array $files = [])
    {
        try {
            $meta = textFileToArray($this->metaFile);
            $imagesdir = $this->imageFolder;
            if (!$imagesdir) {
                throw new Exception(self::ERROR_NO_IMAGE_FOLDER, 1);
            }
            $data = array();
            foreach ($files as $file) {
                $filename = save_file($file, $file['name'], $this->imageFolder);
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

    public function save(array $data = null)
    {
        if (!$data || !count($data)) {
            json_response('Bad query', 400);
            return;
        }
        try {
            $meta = textFileToArray($this->metaFile);
            $result = array();
            foreach ($data as $key => $value) {
                if ($key !== 'images' && !is_array($value)) {
                    if (array_key_exists($key, $meta)) {
                        $meta[$key] = trim($value);
                        $result[$key] = $meta[$key];
                    } else { // adding new entries
                        $meta[$key] = trim($value);
                        $result[$key] = $meta[$key];
                    }
                }
            }
            array_to_file($meta);
            if (array_key_exists('images', $data)) {
                $result['images'] = $this->delete_all_files_except($data['images']);
                $result['images'] = $this->update_filenames($data['images']);
            }
            json_response('ok', 200, $result);
            return;
        } catch (Exception $e) {
            json_response($e->getMessage(), 500);
        }
    }

    private function delete_all_files_except(array $data = null)
    {
        try {
            $meta = textFileToArray($this->metaFile);
            if (!$data || !count($data)) {
                return array();
            }
            if (!$this->imageFolder) {
                throw new Exception(self::ERROR_NO_IMAGE_FOLDER, 1);
                return;
            }
            $images = getImagesInFolder($this->imageFolder);
            $result = array();
            foreach ($images as $image) {
                if (!array_key_exists_in_array_of_arrays($image, 'filename', $data)) {
                    @unlink($this->imageFolder . DS . $image);
                } else {
                    $result[] = array('src' => url(str_replace(ROOT_FOLDER, '', $this->imageFolder) . DS . $image), 'filename' => $image);
                }
            }
            return $result;
        } catch (Exception $e) {
            throw new Exception($e->getMessage(), $e->getCode());
        }
    }

    private function update_filenames(array $images = null)
    {
        try {
            $meta = textFileToArray($this->metaFile);
            if (!$images || !count($images)) {
                return array();
            }
            if (!$this->imageFolder) {
                throw new Exception(self::ERROR_NO_IMAGE_FOLDER, 1);
                return;
            }
            $existingImages = getImagesInFolder($this->imageFolder);
            $result = array();
            foreach ($images as $image) {
                if (array_key_exists('filename', $image) && array_key_exists('newfilename', $image)) {
                    if (in_array($image['filename'], $existingImages)) {
                        $filename = update_filename($this->imageFolder . DS . $image['filename'], $image['newfilename']);
                        $result[] = array(
                            'src' => url(str_replace(ROOT_FOLDER, '', $this->imageFolder) . DS . pathinfo($filename, PATHINFO_FILENAME) . '.' . pathinfo($filename, PATHINFO_EXTENSION)),
                            'filename' => pathinfo($filename, PATHINFO_FILENAME) . '.' . pathinfo($filename, PATHINFO_EXTENSION)
                        );
                    }
                }
            }
            return $result;
        } catch (Exception $e) {
            throw new Exception($e->getMessage(), $e->getCode());
        }
    }
}
