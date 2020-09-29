<?php
    require_once('mysql_connect.php');

	$akey = $_GET['akey'];
	$lastedit = $_GET['last'];

	$STH = $DBH->prepare("SELECT * FROM edits WHERE edits.akey=? AND edits.editID > ? ORDER by editID ASC;");
    $STH->bindParam(1, $akey);
    $STH->bindParam(2, $lastedit);
	$STH->execute();

	$JSON = array();
	while($row = $STH->fetch()){

		$q = "SELECT content FROM " .$row['type'] . "s WHERE uid=" .$row['uid'] . ";";

		$sc = $DBH->prepare($q);
		$sc->execute();

		$r = $sc->fetch();
		$content = $r['content'];

		$edit = array();
		$edit['editID'] = $row['editID'];
		$edit['type'] = $row['type'];
		$edit['action'] = $row['action'];
		$edit['content'] = $content;
        $edit['sessionid'] = $row['sessionid'];
		$JSON[] = json_encode($edit);
    }

    $return = '{"edits":[';
    $return = $return . implode(',', $JSON);
    $return = $return . ']}';

    echo $return;
