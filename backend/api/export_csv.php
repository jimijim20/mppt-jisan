<?php require 'config.php'; require_login();
$start=$_GET['start']??date('Y-m-d 00:00:00'); $end=$_GET['end']??date('Y-m-d 23:59:59');
header('Content-Type: text/csv'); header('Content-Disposition: attachment; filename="monitors_'.date('Ymd').'.csv"');
$stmt=$pdo->prepare("SELECT * FROM monitors WHERE created_at BETWEEN ? AND ? ORDER BY created_at ASC"); $stmt->execute([$start,$end]);
$out=fopen('php://output','w'); $head=false; while($r=$stmt->fetch(PDO::FETCH_ASSOC)){ if(!$head){ fputcsv($out,array_keys($r)); $head=true;} fputcsv($out,array_values($r)); } fclose($out);