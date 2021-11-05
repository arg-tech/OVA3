<?php
require_once('mysql_connect.php');

$analysisID = $_GET['analysisID'];
$lastedit = $_GET['last'];

$STH = $DBH->prepare("SELECT * FROM edits WHERE edits.analysisID=? AND edits.editID > ? ORDER by editID ASC;");
$STH->bindParam(1, $analysisID);
$STH->bindParam(2, $lastedit);
$STH->execute();

$JSON = array();
while ($row = $STH->fetch()) {
	if ($row['type'] == 'node') {
		$q = "SELECT content FROM nodes WHERE nodeID='" . $row['contentID'] . "' AND nodes.analysisID=" . $row['analysisID'] . " AND nodes.versionNo=" . $row['versionNo'] . ";";
	} else {
		$q = "SELECT content FROM " . $row['type'] . "s WHERE " . $row['type'] . "ID='" . $row['contentID'] . "' AND " . $row['type'] . "s.analysisID=" . $row['analysisID'] . ";";
	}
	$sc = $DBH->prepare($q);
	$sc->execute();
	$r = $sc->fetch(PDO::FETCH_ASSOC);
	if (!$r) {
		$content = null;
	} else {
		$content = $r['content'];
	}

	$edit = array();
	$edit['editID'] = $row['editID'];
	$edit['sessionid'] = $row['sessionid'];
	$edit['type'] = $row['type'];
	$edit['action'] = $row['action'];
	$edit['content'] = $content;
	$edit['groupID'] = $row['groupID'];
	$edit['undone'] = $row['undone'];

	$JSON[] = json_encode($edit);
}

$return = '{"edits":[';
$return = $return . implode(',', $JSON);
$return = $return . ']}';

echo $return;
