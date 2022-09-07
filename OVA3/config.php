<?php
    $OVA_DB_USER = getenv("MYSQL_USER");
    $OVA_DB_PASSWORD = getenv("MYSQL_PASSWORD");
    $OVA_DB_HOST = getenv("MYSQL_HOST");
    $OVA_DB_NAME = getenv("MYSQL_DATABASE");

    $DBurl = 'http://www.aifdb.org';
    $SSurl = 'http://www.arg-tech.org/~john/schemesets/list';
    $CPurl = 'http://corpora.aifdb.org';
    $TXurl = 'http://www.arg-tech.org/TXTdb';
    $OVAurl = 'http://ova.arg-tech.org/';

    $dotPath = '';

    $defaultSettings = array(
        "timestamp" => array("addTimestamps" => false, "showTimestamps" => false, "startdatestmp" => "2020/10/15 22:50:00 GMT+0100"), 
        "schemeset"=> array("YA" => "", "RA" => "", "CA" => "", "TA" => "", "MA" => "", "PA" => ""), 
        "analysis"=> array("rIAT" => true, "eAdd" => false, "cq" => false), 
        "display"=> array("black_white" => false, "font_size" => "tm", "panBtns" => true, "inverse" => false) //note: font_size should be set to "ts" for small, "tm" for medium or "tl" for large
    );
?>
