<?php
require_once('mysql_connect.php');
$preVersionNo = null;
$versionNo = null;
$cnt = json_decode($_POST['cnt']);

if ($_POST['type'] == "node") {
    $preVersionNo = 1;
    $versionNo = 1;

    $query = $DBH->prepare("INSERT INTO nodes(nodeID, analysisID, versionNo, content) VALUES (:nodeID, :analysisID, :versionNo, :cnt)");
    $query->bindParam('nodeID', $contentID);
    $query->bindParam('analysisID', $_POST['analysisID']);
    $query->bindParam('versionNo', $versionNo);
    $query->bindParam('cnt', $content);
} else if ($_POST['type'] == "edge") {
    $query = $DBH->prepare("INSERT INTO edges(edgeID, analysisID, content) VALUES (:id, :analysisID, :cnt)");
    $query->bindParam('id', $contentID);
    $query->bindParam('analysisID', $_POST['analysisID']);
    $query->bindParam('cnt', $content);
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

$l = count($cnt);
for ($i = 0; $i < $l; $i++) {
    $contentID = $cnt[$i][0];
    $content = $cnt[$i][1];
    try {
        $query->execute();
    } catch (Exception $e) {
        $versionNo++;
        $query->execute();
    }
    $q->execute();
}
$editid = $DBH->lastInsertId();

echo '{"last":' . $editid . '}';
