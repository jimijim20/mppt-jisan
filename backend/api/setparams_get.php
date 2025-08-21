<?php
require 'config.php';
$id=(int)($_GET['id']??1);
$stmt=$pdo->prepare('SELECT id,batteryVoltageSetting,batteryType,maxChargeCurrent,absorptionVoltage,absorptionTime,floatVoltage,reBulkVoltageOffset FROM setparams WHERE id=? LIMIT 1');
$stmt->execute([$id]);
$row=$stmt->fetch(PDO::FETCH_ASSOC);
echo json_encode(['row'=>$row]);
