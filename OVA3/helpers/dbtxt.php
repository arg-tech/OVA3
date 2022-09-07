<?php
//This is for the timestamper/linking DB nodeIDs to OVA text

require_once('mysql_connect.php');

if(isset($_GET['nodeSetID'])){
    $nodeSetID = $_GET['nodeSetID'];

    $sql = "SELECT * FROM dbsave WHERE nodeSetID=:nsid;";
    $q = $DBH->prepare($sql);
    $q->execute(array(':nsid'=>$nodeSetID));


    while($row = $q->fetch()){
	$m = json_decode($row['mappings'], true);
	$map = $m['mappings'];
        $txt = $row['text'];
       
        preg_match_all('~id="node[0-9]+"~s',$txt,$nids);
        foreach($nids[0] as $n){
	    preg_match('~id="node([0-9]+)~', $n, $m);
            $txt = str_replace($n, 'id="'.$map[$m[1]].'"', $txt);
        }
        echo $txt;
    }
}