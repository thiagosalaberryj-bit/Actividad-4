<?php
declare(strict_types=1);

require_once __DIR__ . '/../conexion.php';

// Acepta solo consultas de sesion por GET.
require_http_method('GET');

// Recupera el usuario actual para indicar si la sesion sigue activa.
start_app_session();
$user = get_logged_user();

if ($user === null) {
    send_json([
        'ok' => true,
        'authenticated' => false
    ]);
    exit;
}

send_json([
    'ok' => true,
    'authenticated' => true,
    'user' => $user
]);
