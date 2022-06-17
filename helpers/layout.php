<?php
require_once('../config.php');

$nodeSetID = $_GET['id'];
if ($_GET['plus'] == 'true') {
    $url = $DBurl . '/dot/layout/' . $nodeSetID . '?plus=true';
} else {
    $url = $DBurl . '/dot/layout/' . $nodeSetID;
}

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/4.0 (compatible;)");
curl_setopt($ch, CURLOPT_AUTOREFERER, TRUE);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
$dot = curl_exec($ch);
curl_close($ch);

$dot = preg_replace('/\\\\\n/', '', $dot);
$dot = explode('];', $dot);

$n = array();
foreach ($dot as $line) {
    if (preg_match('/^\s*([0-9]+)\s*\[.*\s*label.*\s*pos="(-?[0-9]+\.?[0-9]*),(-?[0-9]+\.?[0-9]*)"/', $line, $m)) {
        $n[] = '"' . $m[1] . '":{"x":"' . $m[2] . '","y":"' . $m[3] . '"}';
    }
}

$return = '{' . implode(',', $n) . '}';
echo $return;
