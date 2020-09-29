<?php
// Set the database access information as constants.
//DEFINE ('DB_USER', 'root');
//DEFINE ('DB_USER', 'ova_user');//
//DEFINE ('DB_PASSWORD', 'Ee7iN7oos8');//
//DEFINE ('DB_HOST', 'ova-lamp-mysql');
//DEFINE ('DB_HOST', 'descartes.arg.tech');//
//DEFINE ('DB_NAME', 'ova_db');//

DEFINE ('DB_USER', 'root');
DEFINE ('DB_PASSWORD', '');
DEFINE ('DB_HOST', '');
DEFINE ('DB_NAME', '');

try {
    # MySQL with PDO_MYSQL
    $DBH = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME, DB_USER, DB_PASSWORD);
} catch(PDOException $e) {
    echo $e->getMessage();
}
