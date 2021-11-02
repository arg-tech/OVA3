<?php
// Set the database access information as constants.
//DEFINE ('DB_USER', 'root');
DEFINE ('DB_USER', 'ova3_user');
DEFINE ('DB_PASSWORD', 'ovapa55');
DEFINE ('DB_HOST', '127.0.0.1');
DEFINE ('DB_NAME', 'ova3');

try {
    # MySQL with PDO_MYSQL
    $DBH = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME, DB_USER, DB_PASSWORD);
} catch(PDOException $e) {
    echo $e->getMessage();
}
