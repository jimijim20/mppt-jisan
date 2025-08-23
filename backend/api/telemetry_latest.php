<?php
require_once __DIR__ . "/../config.php";

// Cek kolom waktu yang tersedia di tabel monitors
function col_exists($pdo, $col){
  try { $pdo->query("SELECT `$col` FROM monitors LIMIT 1"); return true; }
  catch (Throwable $e) { return false; }
}

$timeCol = null;
foreach (['created_at','updated_at','ts','time','timestamp','datetime'] as $c) {
  if (col_exists($pdo, $c)) { $timeCol = $c; break; }
}

if ($timeCol) {
  // Kembalikan ts_ms = UNIX_TIMESTAMP(...) * 1000 (NUMBER), agar frontend bisa hitung umur data
  $sql = "SELECT UNIX_TIMESTAMP(`$timeCol`)*1000 AS ts_ms,
                 solarVoltage, solarCurrent, batteryVoltage, batteryCurrent,
                 power, todayYield, lifetimeYield, batteryState, wifistatus
          FROM monitors
          ORDER BY `$timeCol` DESC
          LIMIT 1";
  $row = $pdo->query($sql)->fetch(PDO::FETCH_ASSOC);
} else {
  // Tidak ada kolom waktu → tandai sebagai stale: ts_ms=NULL
  $sql = "SELECT NULL AS ts_ms,
                 solarVoltage, solarCurrent, batteryVoltage, batteryCurrent,
                 power, todayYield, lifetimeYield, batteryState, wifistatus
          FROM monitors
          ORDER BY id DESC
          LIMIT 1";
  $row = $pdo->query($sql)->fetch(PDO::FETCH_ASSOC);
}

header('Content-Type: application/json');
echo json_encode($row ?: new stdClass());
