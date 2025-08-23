<?php
require_once __DIR__ . "/../config.php";

$start = $_GET['start'] ?? null;
$end   = $_GET['end'] ?? null;
$limit = (int) min(max((int)($_GET['limit'] ?? 5000), 1), 20000);
$offset= (int) max((int)($_GET['offset'] ?? 0), 0);

if (!$start || !$end) {
  http_response_code(400);
  echo json_encode(['error'=>'bad_request','message'=>'start & end diperlukan (YYYY-MM-DD HH:MM:SS)']);
  exit;
}

function col_exists($pdo, $col){
  try { $pdo->query("SELECT `$col` FROM monitors LIMIT 1"); return true; }
  catch (Throwable $e) { return false; }
}

$col = null;
foreach (['created_at','updated_at','ts','time','timestamp','datetime'] as $c) {
  if (col_exists($pdo, $c)) { $col = "`$c`"; break; } // backtick untuk aman
}

if ($col) {
  // HANYA bind parameter untuk tanggal; limit/offset di-inject setelah di-cast integer
  $sql = "SELECT $col AS ts, solarVoltage, solarCurrent, batteryVoltage, batteryCurrent,
                 power, todayYield, lifetimeYield, batteryState, wifistatus
          FROM monitors
          WHERE $col BETWEEN ? AND ?
          ORDER BY $col ASC
          LIMIT $limit OFFSET $offset";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([$start, $end]);
} else {
  // Tanpa kolom waktu, fallback: urut id saja (limit/offset tetap di-inject sebagai int)
  $sql = "SELECT NOW() AS ts, solarVoltage, solarCurrent, batteryVoltage, batteryCurrent,
                 power, todayYield, lifetimeYield, batteryState, wifistatus
          FROM monitors
          ORDER BY id ASC
          LIMIT $limit OFFSET $offset";
  $stmt = $pdo->query($sql);
}

$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode(['rows' => $rows]);
