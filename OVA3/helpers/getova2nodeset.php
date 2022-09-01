<?php
    require_once('../config.php');
    header('Content-Type: application/json');

    $nodeSetID=$_GET['id'];
    $j = file_get_contents($OVAurl . '/db/' . $nodeSetID);
    echo $j;
?>
