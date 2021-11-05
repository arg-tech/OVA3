<?php
require_once('mysql_connect.php');
$preVersionNo = null;
$versionNo = null;
$contentID = $_POST['contentID'];

if ($_POST['type'] == "node") {
    //get and set the previous version number and set the current version number
    $q = $DBH->prepare("SELECT * FROM nodes WHERE analysisID=:analysisID AND nodeID=:nodeID ORDER BY versionNo DESC LIMIT 1");
    $q->execute(array(':analysisID' => $_POST['analysisID'], ':nodeID' => $contentID));
    $previousNode = $q->fetch(PDO::FETCH_ASSOC);
    if (!$previousNode) {
        $preVersionNo = null;
        $versionNo = 1;
    } else {
        $preVersionNo = $previousNode['versionNo'];
        $versionNo = $preVersionNo + 1;
    }

    if ($_POST['action'] == 'delete') { //if a delete edit don't add a new version of the node to the table
        $preVersionNo = $previousNode['versionNo']; //previous version is same as current version
        $versionNo = $previousNode['versionNo'];
    } else {
        try {
            $q = $DBH->prepare("INSERT INTO nodes(nodeID, analysisID, versionNo, content) VALUES (:nodeID, :analysisID, :versionNo, :cnt)");
            $q->execute(array(':nodeID' => $contentID, ':analysisID' => $_POST['analysisID'], ':versionNo' => $versionNo, ':cnt' => $_POST['cnt']));
        } catch (Exception $e) {
            $versionNo++;
            $q = $DBH->prepare("INSERT INTO nodes(nodeID, analysisID, versionNo, content) VALUES (:nodeID, :analysisID, :versionNo, :cnt)");
            $q->execute(array(':nodeID' => $contentID, ':analysisID' => $_POST['analysisID'], ':versionNo' => $versionNo, ':cnt' => $_POST['cnt']));
        }
    }
} else if ($_POST['type'] == "text") {
    $sql = "INSERT INTO texts(textID, analysisID, content) VALUES (:id, :analysisID, :cnt)";
    $q = $DBH->prepare($sql);
    $q->execute(array(':id' => $contentID, ':analysisID' => $_POST['analysisID'], ':cnt' => $_POST['cnt']));
} else if ($_POST['type'] == "edge" && $_POST['action'] == "add" && $_POST['undone'] == 0) {
    $sql = "INSERT INTO edges(edgeID, analysisID, content) VALUES (:id, :analysisID, :cnt)";
    $q = $DBH->prepare($sql);
    $q->execute(array(':id' => $contentID, ':analysisID' => $_POST['analysisID'], ':cnt' => $_POST['cnt']));
}

$sql = "INSERT INTO edits(analysisID, sessionid, `type`, `action`, contentID, groupID, undone, versionNo, preVersionNo) VALUES (?,?,?,?,?,?,?,?,?)";
$q = $DBH->prepare($sql);
$q->bindParam(1, $_POST['analysisID']);
$q->bindParam(2, $_POST['sessionid']);
$q->bindParam(3, $_POST['type']);
$q->bindParam(4, $_POST['action']);
$q->bindParam(5, $contentID);
$q->bindParam(6, $_POST['groupID']);
$q->bindParam(7, $_POST['undone']);
$q->bindParam(8, $versionNo);
$q->bindParam(9, $preVersionNo);
$q->execute();
$editid = $DBH->lastInsertId();

echo '{"last":' . $editid . '}';
