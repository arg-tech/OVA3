<?php
require_once('mysql_connect.php');

$analysisID = $_GET['analysisID'];
$sessionid = $_GET['sessionid'];
$groupID = 0;
$action = '';
$type = '';
$lastID = 1;

//find the groupID and what type of edit the last edit for this user is
$q = $DBH->prepare("SELECT * FROM edits WHERE analysisID=:analysisID AND sessionid=:sessionid AND undone=0 ORDER BY groupID DESC LIMIT 1");
$q->execute(array(':analysisID' => $analysisID, ':sessionid' => $sessionid));
$lastEditGroup = $q->fetch(PDO::FETCH_ASSOC);
if (!$lastEditGroup) {
	$groupID = 0;
} else {
	$groupID = $lastEditGroup['groupID'];
	$action = $lastEditGroup['action'];
	$type = $lastEditGroup['type'];
}

//find all edits with the given groupID for this user
$STH = $DBH->prepare("SELECT * FROM edits WHERE analysisID=? AND sessionid=? AND groupID=? AND undone=0 ORDER by editID DESC;");
$STH->execute([$analysisID, $sessionid, $groupID]);

$JSON = array();
$allEditIDs = array();

if ($action == 'edit' && $type == 'node') {
	while ($row = $STH->fetch()) {
		$q = "SELECT content FROM nodes WHERE nodeID='" . $row['contentID'] . "' AND nodes.analysisID=" . $row['analysisID'] . " AND nodes.versionNo=" . $row['preVersionNo'] . ";";
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
		if ($action == 'delete' || $row['type'] != 'text') {
			if ($row['type'] == 'node') {
				$q = "SELECT content FROM nodes WHERE nodeID='" . $row['contentID'] . "' AND nodes.analysisID=" . $row['analysisID'] . " AND nodes.versionNo=" . $row['versionNo'] . ";";
			} else if ($row['type'] == 'edge') {
				$q = "SELECT content FROM edges WHERE edgeID='" . $row['contentID'] . "' AND edges.analysisID=" . $row['analysisID'] . ";";
			} else if ($row['type'] == 'text') { //find the previous text content
				$q = "SELECT content FROM texts INNER JOIN edits ON textID = contentID AND texts.analysisID=edits.analysisID WHERE texts.analysisID=" . $row['analysisID'] . " AND type='text' AND undone=0 ORDER BY editID DESC LIMIT 1, 1;";
			}

			$sc = $DBH->prepare($q);
			$sc->execute();
			$r = $sc->fetch(PDO::FETCH_ASSOC);
			if (!$r) {
				$content = null;
			} else {
				if ($row['type'] == 'text') {
					$content = json_decode($r['content']);
				} else {
					$content = $r['content'];
				}
			}

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

if ($action == 'delete') { //find the last edit ID for this analysis that hasn't been undone yet
	$q = $DBH->prepare("SELECT editID FROM edits WHERE analysisID=? AND undone=0 ORDER BY editID DESC LIMIT 1");
	$q->execute([$analysisID]);
	$l = $q->fetch(PDO::FETCH_ASSOC);
	if (!$l) {
		$lastID = 1;
	} else {
		$lastID = $l['editID'];
	}
}

//update all edits that are to be undone
foreach ($allEditIDs as $ID) {
	$sql = "UPDATE edits SET undone=1 WHERE editID=" . $ID;
	$q = $DBH->prepare($sql)->execute();
}

$return = '{"edits":[';
$return = $return . implode(',', $JSON);
$return = $return . '], "lastID":' . $lastID . '}';

echo $return;
