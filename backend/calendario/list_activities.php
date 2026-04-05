<?php
declare(strict_types=1);

require_once __DIR__ . '/../conexion.php';

// Acepta solo consultas de actividades por GET.
require_http_method('GET');

// Recupera y ordena las actividades del usuario autenticado.
$userId = require_auth();

$conn = get_db_connection();
$sql = 'SELECT id, title, description, activity_date, is_done, created_at, DATEDIFF(activity_date, CURDATE()) AS days_remaining
        FROM activities
        WHERE user_id = ?
        ORDER BY activity_date ASC, id ASC';
$stmt = $conn->prepare($sql);

if (!$stmt) {
    send_json(['ok' => false, 'error' => 'No se pudieron listar actividades'], 500);
    exit;
}

$stmt->bind_param('i', $userId);

if (!$stmt->execute()) {
    $stmt->close();
    send_json(['ok' => false, 'error' => 'No se pudieron listar actividades'], 500);
    exit;
}

$result = $stmt->get_result();
$items = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $items[] = [
            'id' => (int) $row['id'],
            'title' => (string) $row['title'],
            'description' => (string) $row['description'],
            'activity_date' => (string) $row['activity_date'],
            'is_done' => (int) $row['is_done'] === 1,
            'days_remaining' => isset($row['days_remaining']) ? (int) $row['days_remaining'] : null,
            'created_at' => (string) $row['created_at']
        ];
    }
}

$stmt->close();

send_json([
    'ok' => true,
    'data' => $items
]);
