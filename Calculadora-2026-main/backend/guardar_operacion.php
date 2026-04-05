<?php

// responde en json
header('Content-Type: application/json');

// carga la conexion mysqli
require_once __DIR__ . '/conexion.php';

// solo acepta metodo post
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'metodo no permitido']);
    exit;
}

// lee el json que manda javascript
$input = json_decode(file_get_contents('php://input'), true);

// toma y limpia los datos
$operando1 = isset($input['operando1']) ? (float)$input['operando1'] : null;
$operando2 = isset($input['operando2']) ? (float)$input['operando2'] : null;
$operador  = isset($input['operador']) ? trim($input['operador']) : null;
$resultado = isset($input['resultado']) ? (float)$input['resultado'] : null;

// valida que todo venga correcto
if ($operando1 === null || $operando2 === null || $resultado === null || !in_array($operador, ['+', '-', '*', '/'], true)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'datos invalidos']);
    exit;
}

// inserta la operacion en la tabla
$sql = 'INSERT INTO operaciones (operando1, operando2, operador, resultado) VALUES (?, ?, ?, ?)';
$stmt = $conn->prepare($sql);
$stmt->bind_param('ddsd', $operando1, $operando2, $operador, $resultado);

// responde si se guardo o no
if ($stmt->execute()) {
    echo json_encode(['ok' => true, 'id' => $conn->insert_id]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'no se pudo guardar']);
}

$stmt->close();
$conn->close();
