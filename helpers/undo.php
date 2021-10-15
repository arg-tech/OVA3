<?php
require_once('mysql_connect.php');

$analysisID = $_GET['analysisID'];
$sessionid = $_GET['sessionid'];
$groupID = 1;
$action = '';
$type = '';

//find the groupID and what type of edit the last edit was
$q = $DBH->prepare("SELECT * FROM edits WHERE analysisID=:analysisID AND sessionid=:sessionid AND undone=0 ORDER BY groupID DESC LIMIT 1");
$q->execute(array(':analysisID' => $analysisID, ':sessionid' => $sessionid));
$lastEditGroup = $q->fetch(PDO::FETCH_ASSOC);
if (!$lastEditGroup) {
	$groupID = 1;
} else {
	$groupID = $lastEditGroup['groupID'];
	$action = $lastEditGroup['action'];
	$type = $lastEditGroup['type'];
}

//find all edits with the given groupID
$STH = $DBH->prepare("SELECT * FROM edits WHERE analysisID=? AND sessionid=? AND groupID=? ORDER by editID DESC;");
$STH->execute([$analysisID, $sessionid, $groupID]);

$JSON = array();
$allEditIDs = array();

if ($action == 'edit' && $type == 'node') {
	while ($row = $STH->fetch()) {
		$q = "SELECT content FROM nodes WHERE nodeID=" . $row['contentID'] . " AND nodes.analysisID=" . $row['analysisID'] . " AND nodes.versionNo=" . $row['preVersionNo'] . ";";
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
		$edit['type'] = $row['type'];
		$edit['action'] = $row['action'];
		$edit['content'] = $content;
		$edit['versionNo'] = $row['preVersionNo'];

		$JSON[] = json_encode($edit);
		$allEditIDs[] = $row['editID'];
	}
} else {
	while ($row = $STH->fetch()) {
		if ($row['type'] != 'text') {
			if ($row['type'] == 'node') {
				$q = "SELECT content FROM nodes WHERE nodeID=" . $row['contentID'] . " AND nodes.analysisID=" . $row['analysisID'] . " AND nodes.versionNo=" . $row['versionNo'] . ";";
			} else if ($row['type'] == 'edge') {
				$q = "SELECT content FROM edges WHERE edgeID=" . $row['contentID'] . " AND edges.analysisID=" . $row['analysisID'] . ";";
			}
			$sc = $DBH->prepare($q);
			$sc->execute();
			$r = $sc->fetch(PDO::FETCH_ASSOC);
			$content = $r['content'];

			$edit = array();
			$edit['editID'] = $row['editID'];
			$edit['type'] = $row['type'];
			$edit['action'] = $row['action'];
			$edit['content'] = $content;

			$JSON[] = json_encode($edit);
		}
		$allEditIDs[] = $row['editID'];
	}
}

//update all edits that are to be undone
foreach ($allEditIDs as $ID) {
	$sql = "UPDATE edits SET undone=1 WHERE editID=" . $ID;
	$q = $DBH->prepare($sql)->execute();
}

$return = '{"edits":[';
$return = $return . implode(',', $JSON);
$return = $return . ']}';

echo $return;
