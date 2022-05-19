<?php
require_once('mysql_connect.php');
$preVersionNo = null;
$versionNo = null;
$cnt = json_decode($_POST['cnt']);

if ($_POST['type'] == "node") {
    //query to check if a previous version of the node exists in the db
    $qNode = $DBH->prepare("SELECT * FROM nodes WHERE analysisID=:analysisID AND nodeID=:nodeID ORDER BY versionNo DESC LIMIT 1");
    $qNode->bindParam('nodeID', $contentID);
    $qNode->bindParam('analysisID', $_POST['analysisID']);

    //query to insert the node into the nodes table
    $query = $DBH->prepare("INSERT INTO nodes(nodeID, analysisID, versionNo, content) VALUES (:nodeID, :analysisID, :versionNo, :cnt)");
    $query->bindParam('nodeID', $contentID);
    $query->bindParam('analysisID', $_POST['analysisID']);
    $query->bindParam('versionNo', $versionNo);
    $query->bindParam('cnt', $content);
} else if ($_POST['type'] == "edge") {
    //query to insert the edge into the edges table
    $query = $DBH->prepare("INSERT INTO edges(edgeID, analysisID, content) VALUES (:id, :analysisID, :cnt)");
    $query->bindParam('id', $contentID);
    $query->bindParam('analysisID', $_POST['analysisID']);
    $query->bindParam('cnt', $content);
}

//query to insert the edit into the edits table
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
    if ($_POST['type'] == "node") {
        //set the previous and current version numbers
        $qNode->execute();
        $previousNode = $qNode->fetch(PDO::FETCH_ASSOC);
        if (!$previousNode) { //if there isn't a previous version
            $preVersionNo = 1;
            $versionNo = 1;
        } else {
            $preVersionNo = $previousNode['versionNo'];
            $versionNo = $preVersionNo + 1;
        }

        $content = str_replace(['"{', '}"', '\"'], ['{', '}', '"'], json_encode($cnt[$i][1])); //in case it contains special characters
        try {
            $query->execute();
        } catch (Exception $e) {
            $versionNo++;
            $query->execute();
        }
    } else {
        $content = $cnt[$i][1];
        $query->execute();
    }
    $q->execute();
}
$editid = $DBH->lastInsertId();

echo '{"last":' . $editid . '}';
