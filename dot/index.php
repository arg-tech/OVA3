<?php

$target_path = "tmp/";
$froot = $target_path . date("U");
$tmpfile = $froot . '.dottmp';
$fh = fopen($tmpfile, 'w') or die("can't open file");
fwrite($fh, $_POST['data']);
fclose($fh);

$dotfile = $froot . '.dot';
// exec("dot -Tdot -o $dotfile $tmpfile");
exec("/usr/local/bin/dot -Tdot -o $dotfile $tmpfile");

$dot = file_get_contents($dotfile);
$dot = preg_replace('/\\\\\n/', '', $dot);
$dot = explode('];', $dot);

$n = array();
foreach ($dot as $line) {
    if (preg_match('/^\s*([0-9]+)\s*\[.*\s*label.*\s*pos="(-?[0-9]+\.?[0-9]*),(-?[0-9]+\.?[0-9]*)"/', $line, $m)) {
        $n[] = '"' . $m[1] . '":{"x":"' . $m[2] . '","y":"' . $m[3] . '"}';
    }
}

$jsonfile = '{' . implode(',', $n) . '}';
// $tmpfile3 = $froot . '.json';
// $fh3 = fopen($tmpfile3, 'w') or die("can't open file");
// fwrite($fh3, $jsonfile);
// fclose($fh3);
echo $jsonfile;
