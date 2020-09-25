<?php
// Set the database access information as constants.
//DEFINE ('DB_USER', 'root');
DEFINE ('DB_USER', 'Kamila');
DEFINE ('DB_PASSWORD', 'T^jCU{Z2#wM)<;<n8S');
// DEFINE ('DB_PASSWORD', 'Ee7iN7oos8');
//DEFINE ('DB_HOST', 'ova-lamp-mysql');
DEFINE ('DB_HOST', 'localhost');
DEFINE ('DB_NAME', 'OVA3');

try {
    # MySQL with PDO_MYSQL
    $DBH = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME, DB_USER, DB_PASSWORD);
} catch(PDOException $e) {
    echo $e->getMessage();
}
