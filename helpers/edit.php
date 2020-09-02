<?php
    require_once('mysql_connect.php');

    if($_POST['type'] == "node"){
	    $sql = "INSERT INTO nodes (content) VALUES (:cnt)";
    }elseif($_POST['type'] == "edge"){
	    $sql = "INSERT INTO edges (content) VALUES (:cnt)";
    }elseif($_POST['type'] == "text"){
	    $sql = "INSERT INTO texts (content) VALUES (:cnt)";
    }
	$q = $DBH->prepare($sql);
	$q->execute(array(':cnt'=>$_POST['cnt']));
	$uid = $DBH->lastInsertId();

    $sql = "INSERT INTO edits (type, action, uid, akey, sessionid) VALUES (:type, :action, :uid, :akey, :sessionid)";
	$q = $DBH->prepare($sql);
	$q->execute(array(':type'=>$_POST['type'], ':action'=>$_POST['action'], ':uid'=>$uid, ':akey'=>$_POST['akey'], ':sessionid'=>$_POST['sessionid']));
    $editid = $DBH->lastInsertId();

    echo '{"last":'.$editid.'}';
