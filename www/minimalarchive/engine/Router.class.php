<?php
class Router
{
    private $rootUrl;
    private $baseFolder;
    private $routes;

    public function __construct($routes = [], $rootUrl = ROOT_URL, $baseFolder = BASE_FOLDER)
    {
        $this->rootUrl = $rootUrl;
        $this->baseFolder = $baseFolder;
        $this->routes = $routes;
        $this->start();
    }

    public function start()
    {
        // Grabs the URI and breaks it apart in case we have querystring stuff
        $request_uri = explode('?', trim($_SERVER['REQUEST_URI'], '/'), 2);
        $base = $request_uri[0];
        if ($this->rootUrl) {
            $tmp = strstr($request_uri[0], $this->rootUrl);
            $base = substr($tmp, strlen($this->rootUrl) + 1);
        }

        $i = -1;
        while (++$i < count($this->routes)) {
            if (preg_match($this->routes[$i]['match'], $base)) {
                if ($this->routes[$i]['script']) {
                    http_response_code(200);
                    require $this->routes[$i]['script'];
                    exit();
                }
            }
        }
        http_response_code(404);
        exit();
    }

    public function addRoute(string $route, string $script, string $name = null)
    {
        $this->routes[] = array(
            'name' => null === $name ? random_bytes('4') : $name,
            'match' => $match,
            'script' => $script
        );
    }

    public function getRouteByName(string $name)
    {
        $i = -1;
        while (++$i < count($this->routes)) {
            if ($this->routes[$i]['name'] === $name) {
                return $this->routes[$i];
            }
        }
        return null;
    }

    public function getRoutes () {
        return $this->routes;
    }
}
