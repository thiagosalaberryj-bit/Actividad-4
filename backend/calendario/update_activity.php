<?php
declare(strict_types=1);

require_once __DIR__ . '/../conexion.php';

// Acepta solo cambios de estado por POST.
require_http_method('POST');

// Valida ID y estado booleano antes de actualizar.
$userId = require_auth();
$data = get_request_json();

$activityId = (int) ($data['id'] ?? 0);
$isDoneRaw = $data['is_done'] ?? null;
$isDone = filter_var($isDoneRaw, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

if ($activityId <= 0 || $isDone === null) {
    send_json(['ok' => false, 'error' => 'Datos invalidos'], 400);
    exit;
}

// Actualiza el estado de completada respetando pertenencia del usuario.
$doneInt = $isDone ? 1 : 0;
$conn = get_db_connection();
$stmt = $conn->prepare('UPDATE activities SET is_done = ? WHERE id = ? AND user_id = ?');

if (!$stmt) {
    send_json(['ok' => false, 'error' => 'No se pudo actualizar la actividad'], 500);
    exit;
}

$stmt->bind_param('iii', $doneInt, $activityId, $userId);

if (!$stmt->execute()) {
    $stmt->close();
    send_json(['ok' => false, 'error' => 'No se pudo actualizar la actividad'], 500);
    exit;
}

$affected = $stmt->affected_rows;
$stmt->close();

if ($affected === 0) {
	// Si no hubo filas afectadas, confirma si la actividad existe o no.
    $check = $conn->prepare('SELECT id FROM activities WHERE id = ? AND user_id = ? LIMIT 1');
    if (!$check) {
        send_json(['ok' => false, 'error' => 'No se pudo verificar la actividad'], 500);
        exit;
    }

    $check->bind_param('ii', $activityId, $userId);
    $check->execute();
    $checkResult = $check->get_result();
    $exists = $checkResult ? $checkResult->fetch_assoc() : null;
    $check->close();

    if (!$exists) {
        send_json(['ok' => false, 'error' => 'Actividad no encontrada'], 404);
        exit;
    }
}

send_json(['ok' => true]);
