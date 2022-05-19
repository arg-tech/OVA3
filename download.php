<?php
if (empty($_POST['filename']) || empty($_POST['content'])) {
    exit;
}

// Sanitizing the filename:
$filename = preg_replace('/[^a-z0-9\-\_\.]/i', '', $_POST['filename']);

// Outputting headers:
header("Cache-Control: ");
header("Content-type: text/plain");
header('Content-Disposition: attachment; filename="' . $filename . '"');

$json = str_replace(['"{', '}"', '\"', '\\\\', '\/'], ['{', '}', '"', '\\', '/'], json_encode($_POST['content']));
echo $json;
