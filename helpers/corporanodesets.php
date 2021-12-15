<?php
require_once('../config.php');
header('Content-Type: application/json');

$j = file_get_contents($CPurl . '/' . $_GET['shortname'] . '/nodesets');
echo $j;
