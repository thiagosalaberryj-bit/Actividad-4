<?php
declare(strict_types=1);

require_once __DIR__ . '/../backend/conexion.php';

start_app_session();
$user = get_logged_user();

if ($user === null) {
	header('Location: ../index.html');
	exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Dashboard de Actividades</title>
	<link rel="stylesheet" href="../css/main.css">
	<link rel="stylesheet" href="../css/dashboard.css">
	<link rel="stylesheet" href="../css/calendario.css">
	<link rel="stylesheet" href="../css/calculadora.css">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">
</head>
<body>
	<div class="dashboard-app">
		<header class="topbar">
			<div class="topbar-brand">
				<p class="eyebrow"><i class="fa-solid fa-layer-group" aria-hidden="true"></i> Panel integrado</p>
				<h1><i class="fa-regular fa-calendar-check" aria-hidden="true"></i> Calendario + Prioridades + Calculadora</h1>
			</div>
			<div class="topbar-actions">
				<span id="welcome-user" class="welcome-user"><i class="fa-regular fa-circle-user" aria-hidden="true"></i> Hola</span>
				<button class="theme-toggle" type="button" data-theme-toggle aria-label="Cambiar tema" title="Cambiar tema">
					<i class="fa-solid fa-moon" aria-hidden="true"></i>
					<span data-theme-label>Tema oscuro</span>
				</button>
				<button id="logout-btn" class="logout-btn" type="button"><i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i> Cerrar sesion</button>
			</div>
		</header>

		<main class="dashboard-grid">
			<section class="card calendar-card animate-in">
				<div class="card-head">
					<h2><i class="fa-regular fa-calendar" aria-hidden="true"></i> Calendario</h2>
					<div class="calendar-actions">
						<button id="open-activity-modal" type="button" class="secondary-btn"><i class="fa-solid fa-square-plus" aria-hidden="true"></i> Nueva actividad</button>
						<button id="today-btn" type="button" class="secondary-btn"><i class="fa-solid fa-calendar-day" aria-hidden="true"></i> Ir a hoy</button>
					</div>
				</div>

				<div class="month-nav">
					<button id="prev-month" class="month-btn" type="button" aria-label="Mes anterior"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>
					<div class="month-texts">
						<p id="calendar-month" class="month-name"></p>
						<p id="calendar-year" class="year-name"></p>
					</div>
					<button id="next-month" class="month-btn" type="button" aria-label="Mes siguiente"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>
				</div>

				<div class="calendar-weekdays">
					<div>Lun</div>
					<div>Mar</div>
					<div>Mie</div>
					<div>Jue</div>
					<div>Vie</div>
					<div>Sab</div>
					<div>Dom</div>
				</div>
				<div id="calendar-dates" class="calendar-dates"></div>
			</section>

			<aside class="card agenda-card animate-in">
				<h2><i class="fa-solid fa-list-check" aria-hidden="true"></i> Mas cercanas</h2>
				<p class="muted-copy">Ordenadas por fecha. Colores por urgencia.</p>
				<div class="urgency-legend">
					<span class="pill urgency-high">Rojo: muy cerca</span>
					<span class="pill urgency-medium">Amarillo: intermedio</span>
					<span class="pill urgency-low">Verde: con tiempo</span>
				</div>
				<ul id="upcoming-list" class="upcoming-list"></ul>
			</aside>

			<section class="card list-card animate-in">
				<div class="card-head list-head">
					<h2 id="selected-day-title"><i class="fa-solid fa-clipboard-list" aria-hidden="true"></i> Actividades del dia</h2>
					<span id="activity-count-visible" class="pill count-pill">0 visibles</span>
				</div>

				<div class="activity-counts" aria-live="polite">
					<span class="pill count-pill">Total: <strong id="activity-count-total">0</strong></span>
					<span class="pill count-pill">Pendientes: <strong id="activity-count-pending">0</strong></span>
					<span class="pill count-pill">Hechas: <strong id="activity-count-done">0</strong></span>
				</div>

				<div class="list-filters">
					<label class="sr-only" for="activity-status-filter">Filtrar estado</label>
					<select id="activity-status-filter">
						<option value="all">Todas</option>
						<option value="pending">Pendientes</option>
						<option value="done">Hechas</option>
					</select>
				</div>

				<ul id="all-activities" class="all-activities"></ul>
			</section>
		</main>

		<div id="activity-modal-overlay" class="activity-modal-overlay" aria-hidden="true"></div>
		<section id="activity-modal" class="activity-modal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="activity-modal-title">
			<div class="activity-modal-head">
				<h2 id="activity-modal-title"><i class="fa-solid fa-square-plus" aria-hidden="true"></i> Nueva actividad</h2>
				<button id="close-activity-modal" type="button" class="secondary-btn"><i class="fa-solid fa-xmark" aria-hidden="true"></i> Cerrar</button>
			</div>
			<p id="activity-message" class="form-message" aria-live="polite"></p>
			<form id="activity-form" class="activity-form">
				<label for="activity-title">Titulo</label>
				<input id="activity-title" name="title" type="text" required maxlength="140" placeholder="Ej: Entregar practica de base de datos">

				<label for="activity-date">Fecha</label>
				<input id="activity-date" name="activity_date" type="date" required>

				<label for="activity-description">Descripcion (opcional)</label>
				<textarea id="activity-description" name="description" maxlength="600" rows="3" placeholder="Detalles utiles para no olvidar nada"></textarea>

				<div class="modal-actions">
					<button class="primary-btn" type="submit"><i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Guardar actividad</button>
					<button id="cancel-activity-modal" class="secondary-btn" type="button"><i class="fa-solid fa-ban" aria-hidden="true"></i> Cancelar</button>
				</div>
			</form>
		</section>

		<button id="open-calculator" class="open-calculator" type="button"><i class="fa-solid fa-calculator" aria-hidden="true"></i> Abrir calculadora</button>

		<div id="drawer-overlay" class="drawer-overlay" aria-hidden="true"></div>
		<aside id="calculator-drawer" class="calculator-drawer" aria-hidden="true">
			<div class="drawer-top">
				<h2><i class="fa-solid fa-calculator" aria-hidden="true"></i> Calculadora</h2>
				<button id="close-calculator" type="button" class="secondary-btn"><i class="fa-solid fa-xmark" aria-hidden="true"></i> Cerrar</button>
			</div>

			<div class="calculator-shell">
				<div class="calc-display">
					<div id="calc-expression" class="calc-expression"></div>
					<input id="calc-screen" type="text" value="0" readonly>
				</div>

				<div class="calc-buttons">
					<button class="calc-btn" data-value="7" type="button">7</button>
					<button class="calc-btn" data-value="8" type="button">8</button>
					<button class="calc-btn" data-value="9" type="button">9</button>
					<button class="calc-btn operator" data-value="/" type="button">÷</button>

					<button class="calc-btn" data-value="4" type="button">4</button>
					<button class="calc-btn" data-value="5" type="button">5</button>
					<button class="calc-btn" data-value="6" type="button">6</button>
					<button class="calc-btn operator" data-value="*" type="button">x</button>

					<button class="calc-btn" data-value="1" type="button">1</button>
					<button class="calc-btn" data-value="2" type="button">2</button>
					<button class="calc-btn" data-value="3" type="button">3</button>
					<button class="calc-btn operator" data-value="-" type="button">-</button>

					<button class="calc-btn" data-value="." type="button">.</button>
					<button class="calc-btn" data-value="0" type="button">0</button>
					<button class="calc-btn clear" data-value="C" type="button">C</button>
					<button class="calc-btn operator" data-value="+" type="button">+</button>

					<button class="calc-btn equal" data-value="=" type="button">=</button>
				</div>
			</div>

			<div class="calc-history-shell">
				<h3><i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i> Historial completo</h3>
				<ul id="calc-history" class="calc-history"></ul>
			</div>
		</aside>
	</div>

	<script>
		window.APP_USER = <?php echo json_encode($user, JSON_UNESCAPED_UNICODE); ?>;
	</script>
	<script src="../js/theme.js" defer></script>
	<script src="../js/calendario.js" defer></script>
	<script src="../js/calculadora.js" defer></script>
</body>
</html>
