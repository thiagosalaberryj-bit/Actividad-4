<?php
declare(strict_types=1);

require_once __DIR__ . '/conexion.php';

// Ejecuta un INSERT preparado y devuelve el ID generado o 0 si falla.
function db_insert_and_get_id(mysqli $conn, string $sql, string $types, array $values): int
{
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        return 0;
    }

    if ($types !== '' && $values !== []) {
        $bindParams = [$types];

        foreach ($values as $index => $value) {
            $values[$index] = $value;
            $bindParams[] = &$values[$index];
        }

        if (!call_user_func_array([$stmt, 'bind_param'], $bindParams)) {
            $stmt->close();
            return 0;
        }
    }

    if (!$stmt->execute()) {
        $stmt->close();
        return 0;
    }

    $insertId = (int) $conn->insert_id;
    $stmt->close();

    return $insertId;
}
