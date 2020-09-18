<?php

$target_path = "tmp/";
$froot = $target_path . date("U");
$tmpfile = $froot . '.dottmp';
$fh = fopen($tmpfile, 'w') or die("can't open file");
fwrite($fh, $_POST['data']);
fclose($fh);

$dotfile = $froot . '.dot';
exec("/usr/bin/dot -Tdot -o $dotfile $tmpfile");

$doto = file_get_contents($dotfile);

$n = array();
foreach(preg_split("/((\r?\n)|(\r\n?))/", $doto) as $line){
    if(preg_match('/^\s*([0-9]*)\s*\[label.*pos="([0-9]*),([0-9]*)"/', $line, $m)){
        $n[] = '"' . $m[1] . '":{"x":"' . $m[2] . '","y":"' . $m[3] . '"}';
    }
}

$return = '{';
$return = $return . implode(',', $n);
$return = $return . '}';

echo $return;
