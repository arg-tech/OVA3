<?php

$target_path = "tmp/";
$froot = $target_path . date("U");
$tmpfile = $froot . '.dottmp';
$fh = fopen($tmpfile, 'w') or die("can't open file");
fwrite($fh, $_POST['data']);
fclose($fh);

$dotfile = $froot . '.dot';
$jsonfile = $froot;

exec("/usr/local/bin/dot -Tdot -o $dotfile $tmpfile");
exec("/usr/local/bin/dot -Tplain -o $jsonfile $tmpfile");
//dot -Txdot_json -ogrpaph.json graph.dot


$return = file_get_contents($jsonfile);

// $n = array();
// foreach(preg_split("/((\r?\n)|(\r\n?))/", $doto) as $line){
//     if(preg_match('/^\s*([0-9]*)\s*\[label.*pos="([0-9]*),([0-9]*)"/', $line, $m)){
//         $n[] = '"' . $m[1] . '":{"x":"' . $m[2] . '","y":"' . $m[3] . '"}';
//       //"id" : {"x": "xval",
//       //      "y": "yval"
//      //       }
//     }
// }

// $return = '{';
// $return = $return . implode(',', $n);
// $return = $return . '}';

echo $return;
?>
