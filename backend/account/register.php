<?php
declare(strict_types=1);

require_once __DIR__ . '/../conexion.php';
require_once __DIR__ . '/../db_insert.php';

// Acepta solo registro por POST.
require_http_method('POST');

// Inicia sesion para guardar el usuario despues del alta.
start_app_session();

// Lee y normaliza los datos enviados por el formulario.
$data = get_request_json();
$name = trim((string) ($data['name'] ?? ''));
$email = strtolower(trim((string) ($data['email'] ?? '')));
$password = (string) ($data['password'] ?? '');

if ($name === '' || strlen($name) > 120) {
    send_json(['ok' => false, 'error' => 'Nombre invalido'], 400);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    send_json(['ok' => false, 'error' => 'Email invalido'], 400);
    exit;
}

if (strlen($password) < 6) {
    send_json(['ok' => false, 'error' => 'La clave debe tener al menos 6 caracteres'], 400);
    exit;
}

// Verifica que no exista otro usuario con el mismo email.
$conn = get_db_connection();
$check = $conn->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');

if (!$check) {
    send_json(['ok' => false, 'error' => 'No se pudo validar el email'], 500);
    exit;
}

$check->bind_param('s', $email);
$check->execute();
$existingResult = $check->get_result();
$existing = $existingResult ? $existingResult->fetch_assoc() : null;
$check->close();

if ($existing) {
    send_json(['ok' => false, 'error' => 'Ese email ya esta registrado'], 409);
    exit;
}

// Inserta el usuario nuevo y obtiene su ID para iniciar sesion.
$passwordHash = password_hash($password, PASSWORD_DEFAULT);
$userId = db_insert_and_get_id(
    $conn,
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    'sss',
    [$name, $email, $passwordHash]
);

if ($userId <= 0) {
    send_json(['ok' => false, 'error' => 'No se pudo guardar el usuario'], 500);
    exit;
}

session_regenerate_id(true);
$_SESSION['user_id'] = $userId;

send_json([
    'ok' => true,
    'user' => [
        'id' => $userId,
        'name' => $name,
        'email' => $email
    ]
], 201);
