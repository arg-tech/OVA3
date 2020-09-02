<?php
    require_once('../config.php');
    $nodeSetID=$_GET['id'];
    $txt = file_get_contents($TXurl . '/nodeset/' . $nodeSetID);

    if(strlen($txt) < 5){
        $txt = "Enter your text here...";
    }

    echo $txt;
?>
