const calendarEndpoints = {
	list: '../backend/calendario/list_activities.php',
	add: '../backend/calendario/add_activity.php',
	update: '../backend/calendario/update_activity.php',
	remove: '../backend/calendario/delete_activity.php',
	logout: '../backend/account/logout.php'
};

const monthNames = [
	'Enero',
	'Febrero',
	'Marzo',
	'Abril',
	'Mayo',
	'Junio',
	'Julio',
	'Agosto',
	'Septiembre',
	'Octubre',
	'Noviembre',
	'Diciembre'
];

const state = {
	viewDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
	activities: [],
	selectedDate: '',
	filters: {
		status: 'all'
	}
};

const el = {
	welcomeUser: document.getElementById('welcome-user'),
	logoutBtn: document.getElementById('logout-btn'),
	activityModal: document.getElementById('activity-modal'),
	activityModalOverlay: document.getElementById('activity-modal-overlay'),
	openActivityModalBtn: document.getElementById('open-activity-modal'),
	closeActivityModalBtn: document.getElementById('close-activity-modal'),
	cancelActivityModalBtn: document.getElementById('cancel-activity-modal'),
	selectedDayTitle: document.getElementById('selected-day-title'),
	monthLabel: document.getElementById('calendar-month'),
	yearLabel: document.getElementById('calendar-year'),
	prevMonthBtn: document.getElementById('prev-month'),
	nextMonthBtn: document.getElementById('next-month'),
	todayBtn: document.getElementById('today-btn'),
	calendarDates: document.getElementById('calendar-dates'),
	upcomingList: document.getElementById('upcoming-list'),
	allActivities: document.getElementById('all-activities'),
	activityForm: document.getElementById('activity-form'),
	activityTitle: document.getElementById('activity-title'),
	activityDate: document.getElementById('activity-date'),
	activityDescription: document.getElementById('activity-description'),
	activityMessage: document.getElementById('activity-message'),
	activityStatusFilter: document.getElementById('activity-status-filter'),
	activityCountTotal: document.getElementById('activity-count-total'),
	activityCountPending: document.getElementById('activity-count-pending'),
	activityCountDone: document.getElementById('activity-count-done'),
	activityCountVisible: document.getElementById('activity-count-visible')
};

// Muestra mensajes breves del formulario de actividades.
function setFormMessage(text, isError = false) {
	if (!el.activityMessage) {
		return;
	}

	el.activityMessage.textContent = text;
	el.activityMessage.classList.toggle('error', isError);
}

// Realiza peticiones JSON y normaliza errores del backend.
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

// Convierte una fecha JS al formato ISO para el backend.
function toIsoDate(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

// Convierte string ISO a objeto Date para calculos locales.
function parseIsoDate(isoDate) {
	const [year, month, day] = isoDate.split('-').map(Number);
	return new Date(year, (month || 1) - 1, day || 1);
}

function formatDate(isoDate) {
	const date = parseIsoDate(isoDate);
	return date.toLocaleDateString('es-AR', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	});
}

function daysUntil(isoDate) {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const target = parseIsoDate(isoDate);
	const msInDay = 1000 * 60 * 60 * 24;
	return Math.round((target.getTime() - today.getTime()) / msInDay);
}

function urgencyClass(days) {
	if (days <= 2) {
		return 'urgency-high';
	}

	if (days <= 5) {
		return 'urgency-medium';
	}

	return 'urgency-low';
}

function urgencyText(days) {
	if (days < 0) {
		return `Atrasada por ${Math.abs(days)} dia(s)`;
	}

	if (days === 0) {
		return 'Vence hoy';
	}

	if (days === 1) {
		return 'Falta 1 dia';
	}

	return `Faltan ${days} dias`;
}

// Renderiza la grilla del calendario con los dias del mes activo.
function renderCalendar() {
	if (!el.calendarDates || !el.monthLabel || !el.yearLabel) {
		return;
	}

	const month = state.viewDate.getMonth();
	const year = state.viewDate.getFullYear();
	const selectedDate = state.selectedDate;
	const todayIso = toIsoDate(new Date());
	const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	const countByDate = {};
	for (const activity of state.activities) {
		if (activity.is_done) {
			continue;
		}

		countByDate[activity.activity_date] = (countByDate[activity.activity_date] || 0) + 1;
	}

	el.monthLabel.textContent = monthNames[month];
	el.yearLabel.textContent = String(year);
	el.calendarDates.innerHTML = '';

	for (let i = 0; i < firstDayIndex; i += 1) {
		const emptyCell = document.createElement('div');
		emptyCell.className = 'calendar-date empty';
		el.calendarDates.appendChild(emptyCell);
	}

	for (let day = 1; day <= daysInMonth; day += 1) {
		const cellDate = toIsoDate(new Date(year, month, day));
		const cell = document.createElement('button');
		cell.type = 'button';
		cell.className = 'calendar-date';
		cell.dataset.date = cellDate;

		if (cellDate === todayIso) {
			cell.classList.add('today');
		}

		if (cellDate === selectedDate) {
			cell.classList.add('selected');
		}

		const eventCount = countByDate[cellDate] || 0;
		if (eventCount > 0) {
			cell.classList.add('has-events');
		}

		const number = document.createElement('span');
		number.className = 'date-number';
		number.textContent = String(day);
		cell.appendChild(number);

		if (eventCount > 0) {
			const badge = document.createElement('span');
			badge.className = 'date-count';
			badge.textContent = String(eventCount);
			cell.appendChild(badge);
		}

		el.calendarDates.appendChild(cell);
	}
}

// Construye la lista corta de actividades pendientes mas cercanas.
function renderUpcomingList() {
	if (!el.upcomingList) {
		return;
	}

	const items = state.activities
		.filter((activity) => !activity.is_done)
		.map((activity) => ({
			...activity,
			days: daysUntil(activity.activity_date)
		}))
		.sort((a, b) => a.days - b.days)
		.slice(0, 5);

	if (items.length === 0) {
		el.upcomingList.innerHTML = '<li class="empty-state">No hay actividades pendientes.</li>';
		return;
	}

	el.upcomingList.innerHTML = items
		.map((activity) => {
			const urgency = urgencyClass(activity.days);
			return `
				<li class="upcoming-item ${urgency}">
					<div class="upcoming-top">
						<p class="upcoming-title">${escapeHtml(activity.title)}</p>
						<span class="pill ${urgency}">${urgencyText(activity.days)}</span>
					</div>
					<p class="upcoming-meta">${formatDate(activity.activity_date)}</p>
				</li>
			`;
		})
		.join('');
}

// Construye la lista completa de actividades con acciones por item.
function renderAllActivities() {
	if (!el.allActivities) {
		return;
	}

	const selectedDate = state.selectedDate || toIsoDate(new Date());

	const items = [...state.activities].sort((a, b) => {
		if (a.activity_date === b.activity_date) {
			return a.id - b.id;
		}

		return a.activity_date.localeCompare(b.activity_date);
	});

	const dayItems = items.filter((activity) => activity.activity_date === selectedDate);
	const filteredItems = dayItems.filter((activity) => {
		const statusMatch =
			state.filters.status === 'all'
				? true
				: state.filters.status === 'done'
					? activity.is_done
					: !activity.is_done;

		return statusMatch;
	});

	renderActivityCounters(dayItems, filteredItems.length);
	updateSelectedDayTitle(selectedDate);

	if (filteredItems.length === 0) {
		el.allActivities.innerHTML = `<li class="empty-state">No hay actividades para ${formatDate(selectedDate)} con el filtro aplicado.</li>`;
		return;
	}

	el.allActivities.innerHTML = filteredItems
		.map((activity) => {
			const activityDays = daysUntil(activity.activity_date);
			const itemClass = activity.is_done ? 'activity-item done' : 'activity-item';
			const descriptionMarkup = activity.description
				? `<p class="activity-description">${escapeHtml(activity.description)}</p>`
				: '';

			return `
				<li class="${itemClass}">
					<div class="activity-main">
						<div>
							<p class="activity-title">${escapeHtml(activity.title)}</p>
							<p class="activity-meta">${formatDate(activity.activity_date)} - ${urgencyText(activityDays)}</p>
						</div>
						<div class="activity-actions">
							<label class="toggle-label">
								<input class="activity-check" type="checkbox" data-id="${activity.id}" ${activity.is_done ? 'checked' : ''}>
								<i class="fa-solid fa-circle-check" aria-hidden="true"></i> Hecha
							</label>
							<button class="delete-btn" type="button" data-id="${activity.id}"><i class="fa-regular fa-trash-can" aria-hidden="true"></i> Eliminar</button>
						</div>
					</div>
					${descriptionMarkup}
				</li>
			`;
		})
		.join('');
}

// Actualiza el titulo del listado con la fecha actualmente seleccionada.
function updateSelectedDayTitle(selectedDate) {
	if (!el.selectedDayTitle) {
		return;
	}

	el.selectedDayTitle.innerHTML = `<i class="fa-solid fa-clipboard-list" aria-hidden="true"></i> Actividades del ${formatDate(selectedDate)}`;
}

// Actualiza contadores generales y visibles del listado.
function renderActivityCounters(items, visibleCount) {
	const total = items.length;
	const done = items.filter((activity) => activity.is_done).length;
	const pending = total - done;

	if (el.activityCountTotal) {
		el.activityCountTotal.textContent = String(total);
	}

	if (el.activityCountPending) {
		el.activityCountPending.textContent = String(pending);
	}

	if (el.activityCountDone) {
		el.activityCountDone.textContent = String(done);
	}

	if (el.activityCountVisible) {
		el.activityCountVisible.textContent = `${visibleCount} visibles`;
	}
}

// Re-renderiza todas las secciones visuales del dashboard.
function renderAll() {
	renderCalendar();
	renderUpcomingList();
	renderAllActivities();
}

// Carga actividades desde backend y actualiza la interfaz.
async function loadActivities() {
	const payload = await requestJson(calendarEndpoints.list, { method: 'GET' });
	state.activities = Array.isArray(payload.data) ? payload.data : [];
	renderAll();
}

// Crea una actividad nueva con los datos del formulario.
async function createActivity(event) {
	event.preventDefault();

	if (!el.activityTitle || !el.activityDate || !el.activityDescription) {
		return;
	}

	const title = el.activityTitle.value.trim();
	const activityDate = el.activityDate.value;
	const description = el.activityDescription.value.trim();

	if (!title || !activityDate) {
		setFormMessage('Completa titulo y fecha.', true);
		return;
	}

	try {
		setFormMessage('Guardando actividad...');
		await requestJson(calendarEndpoints.add, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				title,
				activity_date: activityDate,
				description
			})
		});

		el.activityTitle.value = '';
		el.activityDescription.value = '';
		setFormMessage('Actividad guardada correctamente.');
		await loadActivities();
		closeActivityModal();
	} catch (error) {
		setFormMessage(error.message, true);
	}
}

// Cambia el estado de una actividad entre hecha y pendiente.
async function toggleActivity(activityId, isDone) {
	await requestJson(calendarEndpoints.update, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ id: Number(activityId), is_done: isDone })
	});
}

// Elimina una actividad puntual del usuario autenticado.
async function deleteActivity(activityId) {
	await requestJson(calendarEndpoints.remove, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ id: Number(activityId) })
	});
}

// Escapa HTML para renderizar texto sin riesgos de inyeccion.
function escapeHtml(value) {
	return String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

// Abre modal de nueva actividad con la fecha seleccionada.
function openActivityModal(selectedDate) {
	if (!el.activityDate || !el.activityTitle) {
		return;
	}

	const targetDate = selectedDate || state.selectedDate || toIsoDate(new Date());
	el.activityDate.value = targetDate;
	setFormMessage(`Nueva actividad para ${formatDate(targetDate)}.`);
	el.activityModal?.classList.add('active');
	el.activityModalOverlay?.classList.add('active');
	el.activityModal?.setAttribute('aria-hidden', 'false');
	el.activityModalOverlay?.setAttribute('aria-hidden', 'false');
	document.body.classList.add('modal-open');

	el.activityTitle.focus();
}

// Cambia el dia seleccionado y vuelve a pintar calendario y listado.
function setSelectedDate(dateIso) {
	state.selectedDate = dateIso;

	if (el.activityDate) {
		el.activityDate.value = dateIso;
	}

	renderCalendar();
	renderAllActivities();
}

// Cierra modal de actividad y limpia mensajes temporales.
function closeActivityModal() {
	el.activityModal?.classList.remove('active');
	el.activityModalOverlay?.classList.remove('active');
	el.activityModal?.setAttribute('aria-hidden', 'true');
	el.activityModalOverlay?.setAttribute('aria-hidden', 'true');
	document.body.classList.remove('modal-open');
	setFormMessage('');
}

// Vincula navegacion del calendario y seleccion de fechas.
function bindCalendarNavigation() {
	el.prevMonthBtn?.addEventListener('click', () => {
		state.viewDate.setMonth(state.viewDate.getMonth() - 1);
		renderCalendar();
	});

	el.nextMonthBtn?.addEventListener('click', () => {
		state.viewDate.setMonth(state.viewDate.getMonth() + 1);
		renderCalendar();
	});

	el.todayBtn?.addEventListener('click', () => {
		const now = new Date();
		state.viewDate = new Date(now.getFullYear(), now.getMonth(), 1);
		setSelectedDate(toIsoDate(now));
	});

	el.calendarDates?.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof HTMLElement)) {
			return;
		}

		const dayButton = target.closest('.calendar-date');
		if (!(dayButton instanceof HTMLButtonElement)) {
			return;
		}

		const selectedDate = dayButton.dataset.date;
		if (!selectedDate) {
			return;
		}

		setSelectedDate(selectedDate);
	});
}

// Vincula cierre del modal y atajos de teclado.
function bindActivityModalActions() {
	el.openActivityModalBtn?.addEventListener('click', () => {
		openActivityModal(state.selectedDate || toIsoDate(new Date()));
	});

	el.closeActivityModalBtn?.addEventListener('click', closeActivityModal);
	el.cancelActivityModalBtn?.addEventListener('click', closeActivityModal);
	el.activityModalOverlay?.addEventListener('click', closeActivityModal);

	document.addEventListener('keydown', (event) => {
		const isOpen = el.activityModal?.classList.contains('active');
		if (!isOpen) {
			return;
		}

		if (event.key === 'Escape') {
			closeActivityModal();
		}
	});
}

// Vincula filtro por estado del listado diario.
function bindActivityFilters() {
	el.activityStatusFilter?.addEventListener('change', () => {
		state.filters.status = el.activityStatusFilter?.value || 'all';
		renderAllActivities();
	});
}

// Vincula acciones de check y borrado en la lista completa.
function bindActivityListActions() {
	el.allActivities?.addEventListener('change', async (event) => {
		const target = event.target;
		if (!(target instanceof HTMLInputElement) || !target.classList.contains('activity-check')) {
			return;
		}

		const activityId = target.dataset.id;
		if (!activityId) {
			return;
		}

		target.disabled = true;
		try {
			await toggleActivity(activityId, target.checked);
			await loadActivities();
		} catch (error) {
			setFormMessage(error.message, true);
			target.checked = !target.checked;
		} finally {
			target.disabled = false;
		}
	});

	el.allActivities?.addEventListener('click', async (event) => {
		const target = event.target;
		if (!(target instanceof HTMLElement)) {
			return;
		}

		const deleteButton = target.closest('.delete-btn');
		if (!(deleteButton instanceof HTMLButtonElement)) {
			return;
		}

		const activityId = deleteButton.dataset.id;
		if (!activityId) {
			return;
		}

		deleteButton.disabled = true;
		try {
			await deleteActivity(activityId);
			await loadActivities();
			setFormMessage('Actividad eliminada.');
		} catch (error) {
			setFormMessage(error.message, true);
		} finally {
			deleteButton.disabled = false;
		}
	});
}

// Cierra sesion y redirige al inicio.
function bindLogout() {
	el.logoutBtn?.addEventListener('click', async () => {
		try {
			await requestJson(calendarEndpoints.logout, { method: 'POST' });
		} catch (_error) {
			// Si falla, igual se redirige para cerrar flujo local.
		}

		window.location.href = '../index.html';
	});
}

// Inicializa dashboard, saludo de usuario y carga de datos.
async function initDashboard() {
	if (el.welcomeUser) {
		const userName = window.APP_USER && window.APP_USER.name
			? escapeHtml(window.APP_USER.name)
			: 'usuario';
		el.welcomeUser.innerHTML = `<i class="fa-regular fa-circle-user" aria-hidden="true"></i> Hola, ${userName}`;
	}

	if (el.activityDate && !el.activityDate.value) {
		el.activityDate.value = toIsoDate(new Date());
	}

	state.selectedDate = toIsoDate(new Date());

	bindCalendarNavigation();
	bindActivityListActions();
	bindActivityModalActions();
	bindActivityFilters();
	bindLogout();
	el.activityForm?.addEventListener('submit', createActivity);

	try {
		await loadActivities();
		setSelectedDate(state.selectedDate);
	} catch (error) {
		setFormMessage(error.message, true);
	}
}

initDashboard();
