<?php
declare(strict_types=1);

require_once __DIR__ . '/../conexion.php';

// Acepta solo login por POST.
require_http_method('POST');

// Inicia sesion y normaliza las credenciales recibidas.
start_app_session();

$data = get_request_json();
$email = strtolower(trim((string) ($data['email'] ?? '')));
$password = (string) ($data['password'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
    send_json(['ok' => false, 'error' => 'Credenciales invalidas'], 400);
    exit;
}

// Busca al usuario y valida la clave hash almacenada.
$conn = get_db_connection();
$stmt = $conn->prepare('SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1');

if (!$stmt) {
    send_json(['ok' => false, 'error' => 'No se pudo validar el acceso'], 500);
    exit;
}

$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result ? $result->fetch_assoc() : null;
$stmt->close();

if (!$user || !password_verify($password, (string) $user['password_hash'])) {
    send_json(['ok' => false, 'error' => 'Email o clave incorrectos'], 401);
    exit;
}

// Regenera la sesion para evitar fixation y responde datos base.
session_regenerate_id(true);
$_SESSION['user_id'] = (int) $user['id'];

send_json([
    'ok' => true,
    'user' => [
        'id' => (int) $user['id'],
        'name' => (string) $user['name'],
        'email' => (string) $user['email']
    ]
]);
