<?php
// responde en json
header('Content-Type: application/json');

// carga la conexion mysqli
require_once __DIR__ . '/conexion.php';

// solo acepta metodo get
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'metodo no permitido']);
    exit;
}

// trae las ultimas 5 operaciones
$sql = 'SELECT id, operando1, operando2, operador, resultado FROM operaciones ORDER BY id DESC LIMIT 5';
$res = $conn->query($sql);

// arma un array para devolver al frontend
$items = [];
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $items[] = $row;
    }
}

// devuelve el listado
echo json_encode(['ok' => true, 'data' => $items]);

$conn->close();
