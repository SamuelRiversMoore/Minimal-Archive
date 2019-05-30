<?php
class Debugger
{
    public function __construct()
    {
    }

    public function log($str)
    {
        $now = (new DateTime())->format('Y-m-d\TH:i:s.u');
        $message = $this->formatVar($str) . PHP_EOL;
        file_put_contents(DEFAULT_LOGFILE, $now . PHP_EOL . $message . "\n------\n", FILE_APPEND | LOCK_EX);
    }

    private function formatVar($var)
    {
        return json_encode($var, JSON_PRETTY_PRINT);
    }
}
