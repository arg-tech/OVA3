<?php
// Set the database access information as constants.
DEFINE ('DB_USER', 'root');
DEFINE ('DB_PASSWORD', 'root');
DEFINE ('DB_HOST', 'localhost');
DEFINE ('DB_NAME', 'ova3');

try {
    # MySQL with PDO_MYSQL
    $DBH = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME, DB_USER, DB_PASSWORD);
} catch(PDOException $e) {
    echo $e->getMessage();
}
