<?php
    require_once('../config.php');
    header('Content-Type: application/json');

    $nodeSetID=$_GET['id'];
    if($_GET['plus'] == 'true'){
        $dot = file_get_contents($DBurl . '/dot/layout/' . $nodeSetID . '?plus=true');
    }else{
        $dot = file_get_contents($DBurl . '/dot/layout/' . $nodeSetID);
    }

    $dot = preg_replace('/\\\\\n/', '', $dot);

    //echo $dot;

    $n = array();
    foreach(preg_split("/((\r?\n)|(\r\n?))/", $dot) as $line){
        if(preg_match('/^\s*([0-9]*)\s*\[label.*pos="([0-9]*),([0-9]*)"/', $line, $m)){
            $n[] = '"' . $m[1] . '":{"x":"' . $m[2] . '","y":"' . $m[3] . '"}';
        }
    }

    $return = '{';
    $return = $return . implode(',', $n);
    $return = $return . '}';

    echo $return;
?>
