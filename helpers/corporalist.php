<?php
    require_once('../config.php');
    header('Content-Type: application/json');

    $j = file_get_contents($CPurl . '/list.php');
    echo $j;
?>
