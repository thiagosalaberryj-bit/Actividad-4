<?php
declare(strict_types=1);

require_once __DIR__ . '/../conexion.php';

// Acepta solo listado por GET.
require_http_method('GET');

// Lista el historial de operaciones del usuario autenticado.
$userId = require_auth();

$conn = get_db_connection();
$stmt = $conn->prepare('SELECT id, expression, result, created_at FROM calculator_operations WHERE user_id = ? ORDER BY id DESC LIMIT 200');

if (!$stmt) {
    send_json(['ok' => false, 'error' => 'No se pudo listar el historial'], 500);
    exit;
}

$stmt->bind_param('i', $userId);

if (!$stmt->execute()) {
    $stmt->close();
    send_json(['ok' => false, 'error' => 'No se pudo listar el historial'], 500);
    exit;
}

$result = $stmt->get_result();
$items = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $items[] = [
            'id' => (int) $row['id'],
            'expression' => (string) $row['expression'],
            'result' => (string) $row['result'],
            'created_at' => (string) $row['created_at']
        ];
    }
}

$stmt->close();

send_json([
    'ok' => true,
    'data' => $items
]);
