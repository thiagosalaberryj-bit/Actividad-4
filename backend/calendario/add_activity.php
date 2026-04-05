<?php
declare(strict_types=1);

require_once __DIR__ . '/../conexion.php';
require_once __DIR__ . '/../db_insert.php';

// Acepta solo creacion de actividades por POST.
require_http_method('POST');

// Valida sesion activa y toma el contenido enviado.
$userId = require_auth();
$data = get_request_json();

$title = trim((string) ($data['title'] ?? ''));
$description = trim((string) ($data['description'] ?? ''));
$activityDate = trim((string) ($data['activity_date'] ?? ''));

if ($title === '' || strlen($title) > 140) {
    send_json(['ok' => false, 'error' => 'Titulo invalido'], 400);
    exit;
}

if (strlen($description) > 600) {
    send_json(['ok' => false, 'error' => 'Descripcion demasiado larga'], 400);
    exit;
}

$dateObject = DateTime::createFromFormat('Y-m-d', $activityDate);
if (!$dateObject || $dateObject->format('Y-m-d') !== $activityDate) {
    send_json(['ok' => false, 'error' => 'Fecha invalida'], 400);
    exit;
}

// Inserta la actividad vinculada al usuario autenticado.
$conn = get_db_connection();
$activityId = db_insert_and_get_id(
    $conn,
    'INSERT INTO activities (user_id, title, description, activity_date) VALUES (?, ?, ?, ?)',
    'isss',
    [$userId, $title, $description, $activityDate]
);

if ($activityId <= 0) {
    send_json(['ok' => false, 'error' => 'No se pudo guardar la actividad'], 500);
    exit;
}

send_json([
    'ok' => true,
    'id' => $activityId
], 201);
