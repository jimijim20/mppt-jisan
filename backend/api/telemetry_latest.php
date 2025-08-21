<?php
require 'config.php';

function col_exists($pdo, $col){
  try{ $pdo->query("SELECT `$col` FROM monitors LIMIT 1"); return true; }catch(Throwable $e){ return false; }
}

$col = null;
foreach(['created_at','updated_at','ts','time','timestamp','datetime'] as $c){
  if(col_exists($pdo, $c)){ $col = $c; break; }
}

if ($col){
  $sql = "SELECT UNIX_TIMESTAMP($col)*1000 AS ts_ms,
    solarVoltage, solarCurrent, batteryVoltage, batteryCurrent,
    power, todayYield, lifetimeYield, batteryState, wifistatus
  FROM monitors ORDER BY $col DESC LIMIT 1";
} else {
  // Tidak ada kolom waktu; kirim ts_ms=null agar UI menganggap stale
  $sql = "SELECT NULL AS ts_ms,
    solarVoltage, solarCurrent, batteryVoltage, batteryCurrent,
    power, todayYield, lifetimeYield, batteryState, wifistatus
  FROM monitors ORDER BY id DESC LIMIT 1";
}

$row = $pdo->query($sql)->fetch(PDO::FETCH_ASSOC);
echo json_encode($row ? $row : new stdClass());
