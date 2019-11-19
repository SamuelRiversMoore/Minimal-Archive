<?php
class Debugger
{
    /**
     * Logs message to file
     * @param  mixed $str
     * @return void
     */
    public static function log($str)
    {
        $now = (new DateTime())->format('Y-m-d\TH:i:s.u');
        $message = Debugger::formatVar($str) . PHP_EOL;
        file_put_contents(DEFAULT_LOGFILE, $now . PHP_EOL . $message . "\n------\n", FILE_APPEND | LOCK_EX);
    }

    /**
     * Json encode input and return it
     * @param  mixed $var
     * @return string|false
     */
    private static function formatVar($var)
    {
        return json_encode($var, JSON_PRETTY_PRINT);
    }
}
