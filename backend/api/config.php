<?php
$DB_HOST='127.0.0.1'; // jika MySQL bukan 3306: '127.0.0.1:PORT'
$DB_NAME='filbeta_app';
$DB_USER='root';
$DB_PASS='';
$TIMEZONE='Asia/Jakarta';
date_default_timezone_set($TIMEZONE);
header('Content-Type: application/json');
try{
  $pdo=new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",$DB_USER,$DB_PASS,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
}catch(Exception $e){ http_response_code(500); echo json_encode(['error'=>'db_connect_failed','message'=>$e->getMessage()]); exit; }
