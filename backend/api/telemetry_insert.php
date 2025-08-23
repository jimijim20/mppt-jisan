<?php
require_once __DIR__ . "/../config.php";

$in = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$cols=['solarVoltage','solarCurrent','batteryVoltage','batteryCurrent','wifistatus','batteryState','power','todayYield','lifetimeYield'];
$vals=[]; $qs=[]; foreach($cols as $c){ $vals[]=$in[$c]??null; $qs[]='?'; }
$sql="INSERT INTO monitors(".implode(',',$cols).") VALUES(".implode(',',$qs).")";
$pdo->prepare($sql)->execute($vals);
echo json_encode(['ok'=>true]);
