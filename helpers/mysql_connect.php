<?php
define('__ROOT__', dirname(dirname(__FILE__)));
require_once(__ROOT__.'/config.php');

// Set the database access information as constants.
DEFINE ('DB_USER', $OVA_DB_USER);
DEFINE ('DB_PASSWORD', $OVA_DB_PASSWORD);
DEFINE ('DB_HOST', $OVA_DB_HOST);
DEFINE ('DB_NAME', $OVA_DB_NAME);

try {
    # MySQL with PDO_MYSQL
    $DBH = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME, DB_USER, DB_PASSWORD);
    $DBH->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo $e->getMessage();
}
