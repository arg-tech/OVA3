<?php
require_once('../helpers/mysql_connect.php');

$host = 'www.aifdb.org';
$db = '/';

$target_path = "tmp/";
$tmpfile = $target_path . date("U");
$fh = fopen($tmpfile, 'w') or die("can't open file");
fwrite($fh, $_POST['data']);
fclose($fh);

$ch = curl_init();
curl_setopt($ch, CURLOPT_HEADER, FALSE);
curl_setopt($ch, CURLOPT_VERBOSE, TRUE);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/4.0 (compatible;)");
curl_setopt($ch, CURLOPT_URL, "http://$host$db"."json/");
curl_setopt($ch, CURLOPT_USERPWD,"test:pass"); 
curl_setopt($ch, CURLOPT_POST, true);
$post = array(
    "file"=>"@".realpath($tmpfile)
);
$args['file'] = curl_file_create($tmpfile, 'application/json');
curl_setopt($ch, CURLOPT_POSTFIELDS, $args); 
if( ! $result = curl_exec($ch)) {
    trigger_error(curl_error($ch)); 
    echo "ERROR!";
} 
curl_close($ch);

print_r($result);
$r = json_decode($result, true);
$return = "Imported as nodeset " . $r['nodeSetID'];

$sql = "INSERT INTO dbsave (nodeSetID, mappings) VALUES (:nsid, :maps)";
$q = $DBH->prepare($sql);
$q->execute(array(':nsid'=>$r['nodeSetID'], ':maps'=>$result));

echo $return;
