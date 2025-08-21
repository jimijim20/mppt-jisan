<?php require 'config.php'; require_login();
$in=json_decode(file_get_contents('php://input'),true); $id=(int)($in['id']??1);
$allowed=['batteryVoltageSetting','batteryType','maxChargeCurrent','absorptionVoltage','absorptionTime','floatVoltage','reBulkVoltageOffset'];
$fields=[]; $vals=[]; foreach($allowed as $k){ if(array_key_exists($k,$in)){ $fields[]="$k = ?"; $vals[]=$in[$k]; } }
if(!$fields){ http_response_code(400); echo json_encode(['error'=>'no_fields']); exit; } $vals[]=$id;
$sql="UPDATE setparams SET ".implode(',',$fields)." WHERE id=?"; $stmt=$pdo->prepare($sql); $stmt->execute($vals); echo json_encode(['ok'=>true]);