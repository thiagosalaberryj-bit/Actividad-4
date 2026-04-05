<?php
// conexion simple con mysqli

// datos de la base
$host = 'localhost';
$user = 'root';
$pass = '';
$db   = 'calculadora_2026';

// crea la conexion
$conn = new mysqli($host, $user, $pass, $db);

// si falla corta con error json
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'error de conexion']);
    exit;
}

// define utf8 para caracteres especiales
$conn->set_charset('utf8mb4');
