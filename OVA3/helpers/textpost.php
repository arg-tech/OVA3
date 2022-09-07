<?php
require_once('../config.php');
require_once('mysql_connect.php');
if(isset($_GET['nsID'])){
    print_r($_POST);

    $sql = "UPDATE dbsave SET text=:txt WHERE nodeSetID=:nsid;";
    $q = $DBH->prepare($sql);
    $q->execute(array(':nsid'=>$_GET['nsID'], ':txt'=>$_POST['txt']));

    $data = "txt=" . $_POST['txt'];
    $url = $TXurl . "/post.php?id=".$_GET['nsID'];

    $ch = curl_init();

    //set the url, number of POST vars, POST data
    curl_setopt($ch,CURLOPT_URL, $url);
    curl_setopt($ch,CURLOPT_POST, 1);
    curl_setopt($ch,CURLOPT_POSTFIELDS, $data);

    //execute post
    $result = curl_exec($ch);

    //close connection
    curl_close($ch);
}
?>
