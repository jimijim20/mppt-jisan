<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$DB_HOST='127.0.0.1'; $DB_NAME='filbeta_app'; $DB_USER='mpptuser'; $DB_PASS='TemporaryPass123!'; $TIMEZONE='Asia/Jakarta';
date_default_timezone_set($TIMEZONE);
$pdo=new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",$DB_USER,$DB_PASS,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
session_start(); function require_login(){ if(empty($_SESSION['user'])){ http_response_code(401); echo json_encode(['error'=>'unauthorized']); exit; } }
header('Content-Type: application/json');
