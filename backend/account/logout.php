<?php
declare(strict_types=1);

require_once __DIR__ . '/../conexion.php';

// Acepta solo cierre de sesion por POST.
require_http_method('POST');

// Limpia la sesion y elimina la cookie para cerrar acceso local.
start_app_session();

$_SESSION = [];

if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params['path'],
        $params['domain'],
        (bool) $params['secure'],
        (bool) $params['httponly']
    );
}

session_destroy();

send_json(['ok' => true]);
