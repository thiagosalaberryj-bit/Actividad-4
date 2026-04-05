<?php
declare(strict_types=1);

require_once __DIR__ . '/../conexion.php';

// Acepta solo eliminaciones por POST.
require_http_method('POST');

// Valida ID y borra solo actividades del usuario autenticado.
$userId = require_auth();
$data = get_request_json();
$activityId = (int) ($data['id'] ?? 0);

if ($activityId <= 0) {
    send_json(['ok' => false, 'error' => 'ID invalido'], 400);
    exit;
}

$conn = get_db_connection();
$stmt = $conn->prepare('DELETE FROM activities WHERE id = ? AND user_id = ?');

if (!$stmt) {
    send_json(['ok' => false, 'error' => 'No se pudo eliminar la actividad'], 500);
    exit;
}

$stmt->bind_param('ii', $activityId, $userId);

if (!$stmt->execute()) {
    $stmt->close();
    send_json(['ok' => false, 'error' => 'No se pudo eliminar la actividad'], 500);
    exit;
}

if ($stmt->affected_rows === 0) {
    $stmt->close();
    send_json(['ok' => false, 'error' => 'Actividad no encontrada'], 404);
    exit;
}

$stmt->close();

send_json(['ok' => true]);
