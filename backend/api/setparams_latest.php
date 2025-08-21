<?php require 'config.php';
$id=(int)($_GET['id']??1); $stmt=$pdo->prepare("SELECT * FROM setparams WHERE id=? LIMIT 1"); $stmt->execute([$id]); $row=$stmt->fetch(PDO::FETCH_ASSOC);
header('Content-Type: application/json'); echo json_encode($row?:new stdClass());