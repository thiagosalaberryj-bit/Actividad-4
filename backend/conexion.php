<?php
declare(strict_types=1);

const DB_HOST = 'localhost';
const DB_USER = 'root';
const DB_PASS = '';
const DB_NAME = 'actividad4_2026';

// Inicia la sesion de la app con un nombre fijo para mantener continuidad.
function start_app_session(): void
{
	if (session_status() !== PHP_SESSION_ACTIVE) {
		session_name('actividad4_session');
		session_start();
	}
}

// Devuelve una respuesta JSON estandarizada con el codigo HTTP recibido.
function send_json(array $payload, int $status = 200): void
{
	http_response_code($status);
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode($payload, JSON_UNESCAPED_UNICODE);
}

// Lee y decodifica el cuerpo JSON de la peticion actual.
function get_request_json(): array
{
	$raw = file_get_contents('php://input');

	if ($raw === false || trim($raw) === '') {
		return [];
	}

	$decoded = json_decode($raw, true);
	return is_array($decoded) ? $decoded : [];
}

// Corta la ejecucion si el endpoint no recibe el metodo HTTP esperado.
function require_http_method(string $method): void
{
	$expectedMethod = strtoupper($method);
	$requestMethod = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? ''));

	if ($requestMethod !== $expectedMethod) {
		send_json(['ok' => false, 'error' => 'Metodo no permitido'], 405);
		exit;
	}
}

// Crea o reutiliza una conexion unica a la base ya existente.
function get_db_connection(): mysqli
{
	static $conn = null;

	if ($conn instanceof mysqli) {
		return $conn;
	}

	mysqli_report(MYSQLI_REPORT_OFF);
	$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

	if ($conn->connect_error) {
		send_json(['ok' => false, 'error' => 'No se pudo conectar a MySQL'], 500);
		exit;
	}

	$conn->set_charset('utf8mb4');
	return $conn;
}

// Indica si existe un usuario autenticado en la sesion actual.
function is_authenticated(): bool
{
	start_app_session();
	return isset($_SESSION['user_id']) && is_numeric($_SESSION['user_id']);
}

// Obliga autenticacion y devuelve el ID del usuario autenticado.
function require_auth(): int
{
	if (!is_authenticated()) {
		send_json(['ok' => false, 'error' => 'Sesion no iniciada'], 401);
		exit;
	}

	return (int) $_SESSION['user_id'];
}

// Obtiene los datos basicos del usuario activo para pintarlos en pantalla.
function get_logged_user(): ?array
{
	if (!is_authenticated()) {
		return null;
	}

	$userId = (int) $_SESSION['user_id'];
	$conn = get_db_connection();
	$stmt = $conn->prepare('SELECT id, name, email FROM users WHERE id = ? LIMIT 1');

	if (!$stmt) {
		return null;
	}

	$stmt->bind_param('i', $userId);

	if (!$stmt->execute()) {
		$stmt->close();
		return null;
	}

	$result = $stmt->get_result();
	$row = $result ? $result->fetch_assoc() : null;
	$stmt->close();

	if (!$row) {
		return null;
	}

	return [
		'id' => (int) $row['id'],
		'name' => (string) $row['name'],
		'email' => (string) $row['email']
	];
}
