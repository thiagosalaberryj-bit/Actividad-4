const authEndpoints = {
	login: 'backend/account/login.php',
	register: 'backend/account/register.php',
	session: 'backend/account/session.php'
};

const loginTab = document.getElementById('tab-login');
const registerTab = document.getElementById('tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authMessage = document.getElementById('auth-message');

// Muestra mensajes de estado o error para login y registro.
function setAuthMessage(text, isError = false) {
	if (!authMessage) {
		return;
	}

	authMessage.textContent = text;
	authMessage.classList.toggle('error', isError);
}

// Alterna entre formulario de login y formulario de registro.
function activateTab(mode) {
	const loginActive = mode === 'login';

	loginTab?.classList.toggle('is-active', loginActive);
	registerTab?.classList.toggle('is-active', !loginActive);

	loginTab?.setAttribute('aria-selected', loginActive ? 'true' : 'false');
	registerTab?.setAttribute('aria-selected', loginActive ? 'false' : 'true');

	loginForm?.classList.toggle('is-hidden', !loginActive);
	registerForm?.classList.toggle('is-hidden', loginActive);

	setAuthMessage('');
}

// Ejecuta fetch JSON con manejo uniforme de errores del backend.
async function requestJson(url, options = {}) {
	const response = await fetch(url, {
		credentials: 'same-origin',
		...options
	});

	const payload = await response.json().catch(() => ({ ok: false, error: 'Respuesta invalida del servidor' }));

	if (!response.ok || !payload.ok) {
		throw new Error(payload.error || 'No se pudo completar la accion');
	}

	return payload;
}

// Verifica si ya hay sesion activa para ir directo al dashboard.
async function checkSession() {
	try {
		const payload = await requestJson(authEndpoints.session, { method: 'GET' });
		if (payload.authenticated) {
			window.location.href = 'frontend/dashboard.php';
		}
	} catch (_error) {
		// Si falla la consulta, se permite seguir en el login.
	}
}

// Envia credenciales de acceso y redirige si son correctas.
async function onLoginSubmit(event) {
	event.preventDefault();

	const emailInput = document.getElementById('login-email');
	const passwordInput = document.getElementById('login-password');

	const email = emailInput?.value.trim() || '';
	const password = passwordInput?.value || '';

	if (!email || !password) {
		setAuthMessage('Completá email y clave para ingresar.', true);
		return;
	}

	try {
		setAuthMessage('Ingresando...');
		await requestJson(authEndpoints.login, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password })
		});

		setAuthMessage('Acceso correcto. Redirigiendo...');
		window.location.href = 'frontend/dashboard.php';
	} catch (error) {
		setAuthMessage(error.message, true);
	}
}

// Crea una cuenta nueva y redirige al dashboard tras el alta.
async function onRegisterSubmit(event) {
	event.preventDefault();

	const nameInput = document.getElementById('register-name');
	const emailInput = document.getElementById('register-email');
	const passwordInput = document.getElementById('register-password');
	const confirmInput = document.getElementById('register-password-confirm');

	const name = nameInput?.value.trim() || '';
	const email = emailInput?.value.trim() || '';
	const password = passwordInput?.value || '';
	const passwordConfirm = confirmInput?.value || '';

	if (!name || !email || !password || !passwordConfirm) {
		setAuthMessage('Completa todos los campos para registrarte.', true);
		return;
	}

	if (password !== passwordConfirm) {
		setAuthMessage('Las claves no coinciden.', true);
		return;
	}

	try {
		setAuthMessage('Creando usuario...');
		await requestJson(authEndpoints.register, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, email, password })
		});

		setAuthMessage('Registro correcto. Entrando al dashboard...');
		window.location.href = 'frontend/dashboard.php';
	} catch (error) {
		setAuthMessage(error.message, true);
	}
}

loginTab?.addEventListener('click', () => activateTab('login'));
registerTab?.addEventListener('click', () => activateTab('register'));
loginForm?.addEventListener('submit', onLoginSubmit);
registerForm?.addEventListener('submit', onRegisterSubmit);

activateTab('login');
checkSession();
