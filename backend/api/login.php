<?php
require_once __DIR__ . "/../config.php";

$in=json_decode(file_get_contents('php://input'),true);
if(($in['username']??'')==='admin' && ($in['password']??'')==='admin'){
  $_SESSION['user']=['name'=>'admin']; echo json_encode(['ok'=>true]);
}else{ http_response_code(401); echo json_encode(['error'=>'invalid']); }
