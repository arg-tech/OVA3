<?php
require_once('../config.php');

if(isset($_GET['nsID']) && isset($_GET['cID'])){
    if(is_numeric($_GET['nsID']) && is_numeric($_GET['cID'])){
        $nodeSetID = $_GET['nsID'];
        $corpusID = $_GET['cID'];

        $data = "nodeSetID=" . $nodeSetID . "&corpusID=" . $corpusID . "&appID=001002";
        $url = $CPurl . "/del.php";

        $ch = curl_init();

        //set the url, number of POST vars, POST data
        curl_setopt($ch,CURLOPT_URL, $url);
        curl_setopt($ch,CURLOPT_POST, 3);
        curl_setopt($ch,CURLOPT_POSTFIELDS, $data);

        //execute post
        $result = curl_exec($ch);

        //close connection
        curl_close($ch);
    }
}

?>
