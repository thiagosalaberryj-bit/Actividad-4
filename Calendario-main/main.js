const elementoMes = document.getElementById("month");
const elementoAnio = document.getElementById("year");
const botonAnterior = document.getElementById("prev-month");
const botonSiguiente = document.getElementById("next-month");
const elementoCalendario = document.querySelector(".calendar");
const filaSemana = document.querySelector(".calendar-week");

const nombresMeses = [
	"Enero",
	"Febrero",
	"Marzo",
	"Abril",
	"Mayo",
	"Junio",
	"Julio",
	"Agosto",
	"Septiembre",
	"Octubre",
	"Noviembre",
	"Diciembre"
];

const fechaHoy = new Date();
const fechaVista = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth(), 1);

// Feriados nacionales de Argentina (fijos por mes y dia): MM-DD
const FERIADOS_AR_FIJOS = [
	"01-01", // Año Nuevo
	"04-02", // Dia del Veterano y de los Caidos en la Guerra de Malvinas
	"05-01", // Dia del Trabajador
	"05-25", // Revolucion de Mayo
	"06-20", // Paso a la Inmortalidad del General Manuel Belgrano
	"07-09", // Dia de la Independencia
	"12-08", // Inmaculada Concepcion de Maria
	"12-25" // Navidad
];

// Feriados movibles o especiales por anio: YYYY-MM-DD
const FERIADOS_AR_POR_ANIO = [
	"2026-02-16", // Carnaval
	"2026-02-17", // Carnaval
	"2026-04-03", // Viernes Santo
	"2026-06-15", // Paso a la Inmortalidad de Guemes (trasladado)
	"2026-08-17", // Paso a la Inmortalidad de San Martin
	"2026-10-12", // Dia del Respeto a la Diversidad Cultural
	"2026-11-23" // Dia de la Soberania Nacional (trasladado)
];

function obtenerContenedorFechas() {
	let contenedor = document.querySelector(".calendar-dates");

	if (!contenedor) {
		contenedor = document.createElement("div");
		contenedor.className = "calendar-dates";
		elementoCalendario.appendChild(contenedor);
	}

	return contenedor;
}

function asegurarBotonHoy() {
	let boton = document.getElementById("go-today");

	if (!boton) {
		boton = document.createElement("button");
		boton.id = "go-today";
		boton.className = "calendar__today-btn";
		boton.type = "button";
		boton.textContent = "Hoy";
		elementoCalendario.insertBefore(boton, filaSemana);
	}

	return boton;
}

function esHoy(dia, mes, anio) {
	return (
		dia === fechaHoy.getDate() &&
		mes === fechaHoy.getMonth() &&
		anio === fechaHoy.getFullYear()
	);
}

function esFeriadoArgentina(dia, mes, anio) {
	const mm = String(mes + 1).padStart(2, "0");
	const dd = String(dia).padStart(2, "0");
	const claveFija = `${mm}-${dd}`;
	const claveCompleta = `${anio}-${mm}-${dd}`;

	return FERIADOS_AR_FIJOS.includes(claveFija) || FERIADOS_AR_POR_ANIO.includes(claveCompleta);
}

function crearCeldaFecha(dia, mes, anio) {
	const celdaFecha = document.createElement("div");
	celdaFecha.className = "calendar__item calendar__date";
	celdaFecha.textContent = dia;

	if (esHoy(dia, mes, anio)) {
		celdaFecha.classList.add("calendar__date--today");
	}

	if (esFeriadoArgentina(dia, mes, anio)) {
		celdaFecha.classList.add("calendar__date--holiday");
		celdaFecha.title = "Feriado en Argentina";
	}

	return celdaFecha;
}

function renderizarCalendario() {
	const mes = fechaVista.getMonth();
	const anio = fechaVista.getFullYear();
	const indicePrimerDia = (new Date(anio, mes, 1).getDay() + 6) % 7;
	const diasEnMes = new Date(anio, mes + 1, 0).getDate();

	elementoMes.textContent = nombresMeses[mes];
	elementoAnio.textContent = String(anio);

	const contenedorFechas = obtenerContenedorFechas();
	contenedorFechas.innerHTML = "";

	for (let i = 0; i < indicePrimerDia; i += 1) {
		const celdaVacia = document.createElement("div");
		celdaVacia.className = "calendar__item calendar__date calendar__date--empty";
		contenedorFechas.appendChild(celdaVacia);
	}

	for (let dia = 1; dia <= diasEnMes; dia += 1) {
		contenedorFechas.appendChild(crearCeldaFecha(dia, mes, anio));
	}
}

botonAnterior.addEventListener("click", () => {
	fechaVista.setMonth(fechaVista.getMonth() - 1);
	renderizarCalendario();
});

botonSiguiente.addEventListener("click", () => {
	fechaVista.setMonth(fechaVista.getMonth() + 1);
	renderizarCalendario();
});

const botonHoy = asegurarBotonHoy();
botonHoy.addEventListener("click", () => {
	fechaVista.setFullYear(fechaHoy.getFullYear(), fechaHoy.getMonth(), 1);
	renderizarCalendario();
});

renderizarCalendario();
