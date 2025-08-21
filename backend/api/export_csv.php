<?php
require 'config.php';
$start=$_GET['start']??date('Y-m-d 00:00:00');
$end=$_GET['end']??date('Y-m-d 23:59:59');
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="monitors_'.date('Ymd').'.csv"');

function col_exists($pdo, $col){
  try{ $pdo->query("SELECT `$col` FROM monitors LIMIT 1"); return true; }catch(Throwable $e){ return false; }
}
$col = null;
foreach(['created_at','updated_at','ts','time','timestamp','datetime'] as $c){
  if(col_exists($pdo, $c)){ $col = $c; break; }
}

if ($col){
  $stmt=$pdo->prepare("SELECT * FROM monitors WHERE $col BETWEEN ? AND ? ORDER BY $col ASC");
  $stmt->execute([$start,$end]);
} else {
  $stmt=$pdo->prepare("SELECT * FROM monitors ORDER BY id ASC");
  $stmt->execute();
}

$out=fopen('php://output','w'); $head=false;
while($r=$stmt->fetch(PDO::FETCH_ASSOC)){
  if(!$head){ fputcsv($out,array_keys($r)); $head=true; }
  fputcsv($out,array_values($r));
}
fclose($out);
