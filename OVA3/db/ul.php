<?php
if (isset($_GET['ns'])) {
    $target_path = "./";
    $tmpfile = $target_path . $_GET['ns'];
    $fh = fopen($tmpfile, 'w') or die("can't open file");

    $json = str_replace(['"{', '}"', '\"', '\\\\', '\/'], ['{', '}', '"', '\\', '/'], json_encode($_POST['data']));
    fwrite($fh, $json);
    fclose($fh);
}
