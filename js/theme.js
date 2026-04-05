const THEME_KEY = 'actividad4_theme';
const THEME_LIGHT = 'light';
const THEME_DARK = 'dark';

// Devuelve true si el valor es un tema valido.
function isValidTheme(theme) {
	return theme === THEME_LIGHT || theme === THEME_DARK;
}

// Detecta la preferencia del sistema cuando no hay tema guardado.
function getSystemTheme() {
	if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
		return THEME_DARK;
	}

	return THEME_LIGHT;
}

// Obtiene el tema inicial desde localStorage o usa el del sistema.
function getInitialTheme() {
	const savedTheme = localStorage.getItem(THEME_KEY);
	return isValidTheme(savedTheme) ? savedTheme : getSystemTheme();
}

// Cambia los textos e iconos de todos los botones de tema.
function updateThemeToggleButtons(theme) {
	const isDarkTheme = theme === THEME_DARK;
	const nextLabel = isDarkTheme ? 'Tema claro' : 'Tema oscuro';
	const nextTitle = isDarkTheme ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
	const iconClass = isDarkTheme ? 'fa-solid fa-sun' : 'fa-solid fa-moon';

	document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
		if (!(button instanceof HTMLButtonElement)) {
			return;
		}

		button.setAttribute('aria-pressed', isDarkTheme ? 'true' : 'false');
		button.setAttribute('title', nextTitle);

		const label = button.querySelector('[data-theme-label]');
		if (label) {
			label.textContent = nextLabel;
		}

		const icon = button.querySelector('i');
		if (icon) {
			icon.className = iconClass;
		}
	});
}

// Aplica el tema en el html raiz para que todo CSS lo use.
function applyTheme(theme) {
	document.documentElement.setAttribute('data-theme', theme);
	updateThemeToggleButtons(theme);
}

// Guarda la preferencia manual para respetarla en visitas futuras.
function saveTheme(theme) {
	localStorage.setItem(THEME_KEY, theme);
}

// Alterna entre tema claro y oscuro cuando se pulsa el boton.
function toggleTheme() {
	const currentTheme = document.documentElement.getAttribute('data-theme') === THEME_DARK
		? THEME_DARK
		: THEME_LIGHT;
	const nextTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;

	applyTheme(nextTheme);
	saveTheme(nextTheme);
}

// Conecta todos los botones de cambio de tema en la pagina actual.
function bindThemeToggles() {
	document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
		button.addEventListener('click', toggleTheme);
	});
}

// Inicializa tema global con persistencia y fallback del sistema.
function initTheme() {
	const initialTheme = getInitialTheme();
	applyTheme(initialTheme);
	bindThemeToggles();
}

initTheme();
