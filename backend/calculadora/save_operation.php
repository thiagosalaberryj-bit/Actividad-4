<?php
declare(strict_types=1);

require_once __DIR__ . '/../conexion.php';
require_once __DIR__ . '/../db_insert.php';

// Acepta solo operaciones guardadas por POST.
require_http_method('POST');

// Obliga sesion activa y valida los datos de la operacion.
$userId = require_auth();
$data = get_request_json();

$expression = trim((string) ($data['expression'] ?? ''));
$result = trim((string) ($data['result'] ?? ''));

if ($expression === '' || strlen($expression) > 255) {
    send_json(['ok' => false, 'error' => 'Expresion invalida'], 400);
    exit;
}

if ($result === '' || strlen($result) > 80) {
    send_json(['ok' => false, 'error' => 'Resultado invalido'], 400);
    exit;
}

// Inserta la operacion en el historial del usuario actual.
$conn = get_db_connection();
$operationId = db_insert_and_get_id(
    $conn,
    'INSERT INTO calculator_operations (user_id, expression, result) VALUES (?, ?, ?)',
    'iss',
    [$userId, $expression, $result]
);

if ($operationId <= 0) {
    send_json(['ok' => false, 'error' => 'No se pudo guardar la operacion'], 500);
    exit;
}

send_json([
    'ok' => true,
    'id' => $operationId
], 201);
