<?php
require_once __DIR__ . "/../config.php";

require_login();

$start=$_GET['start']??date('Y-m-d 00:00:00'); $end=$_GET['end']??date('Y-m-d 23:59:59');
$limit=min(max((int)($_GET['limit']??500),1),5000); $offset=max((int)($_GET['offset']??0),0);
$sql="SELECT created_at AS ts, solarVoltage AS solar_voltage, solarCurrent AS solar_current, batteryVoltage AS battery_voltage, batteryCurrent AS battery_current, power, todayYield AS total_yield, lifetimeYield AS lifetime_yield, batteryState AS battery_state, wifistatus AS wifi_status FROM monitors WHERE created_at BETWEEN ? AND ? ORDER BY created_at ASC LIMIT ? OFFSET ?";
$stmt=$pdo->prepare($sql); $stmt->execute([$start,$end,$limit,$offset]); $rows=$stmt->fetchAll(PDO::FETCH_ASSOC); echo json_encode(['rows'=>$rows]);
