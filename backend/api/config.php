<?php
$DB_HOST='127.0.0.1'; $DB_NAME='filbeta_app'; $DB_USER='root'; $DB_PASS=''; $TIMEZONE='Asia/Jakarta';
date_default_timezone_set($TIMEZONE);
$pdo=new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",$DB_USER,$DB_PASS,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
session_start(); function require_login(){ if(empty($_SESSION['user'])){ http_response_code(401); echo json_encode(['error'=>'unauthorized']); exit; } }
header('Content-Type: application/json');