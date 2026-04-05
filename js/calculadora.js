const calculatorEndpoints = {
	save: '../backend/calculadora/save_operation.php',
	list: '../backend/calculadora/list_operations.php'
};

const calcElements = {
	drawer: document.getElementById('calculator-drawer'),
	overlay: document.getElementById('drawer-overlay'),
	openButton: document.getElementById('open-calculator'),
	closeButton: document.getElementById('close-calculator'),
	expression: document.getElementById('calc-expression'),
	screen: document.getElementById('calc-screen'),
	history: document.getElementById('calc-history')
};

const calcState = {
	currentValue: '0',
	storedValue: null,
	operator: null,
	waitingForNext: false
};

const operatorSymbols = {
	'+': '+',
	'-': '-',
	'*': 'x',
	'/': '÷'
};

const validOperators = ['+', '-', '*', '/'];

// Actualiza el visor principal con el valor actual.
function setCalcScreen(value) {
	if (calcElements.screen) {
		calcElements.screen.value = String(value);
	}
}

// Actualiza la linea de expresion mostrada arriba del resultado.
function setCalcExpression(value) {
	if (calcElements.expression) {
		calcElements.expression.textContent = value;
	}
}

// Redondea y limpia resultados numericos para mostrarlos prolijos.
function formatResult(value) {
	if (!Number.isFinite(value)) {
		return 'Error';
	}

	return String(parseFloat(value.toPrecision(12)));
}

// Reinicia todo el estado interno de la calculadora.
function resetCalculator() {
	calcState.currentValue = '0';
	calcState.storedValue = null;
	calcState.operator = null;
	calcState.waitingForNext = false;
	setCalcExpression('');
	setCalcScreen('0');
}

// Resuelve una operacion binaria segun el operador recibido.
function calculate(a, b, operator) {
	if (operator === '+') {
		return a + b;
	}

	if (operator === '-') {
		return a - b;
	}

	if (operator === '*') {
		return a * b;
	}

	if (operator === '/') {
		if (b === 0) {
			return null;
		}
		return a / b;
	}

	return b;
}

// Agrega un digito al numero actual respetando el flujo de entrada.
function onDigit(value) {
	if (calcState.waitingForNext) {
		calcState.currentValue = value;
		calcState.waitingForNext = false;
	} else {
		calcState.currentValue = calcState.currentValue === '0' ? value : calcState.currentValue + value;
	}

	setCalcScreen(calcState.currentValue);
}

// Agrega un decimal solo cuando es valido hacerlo.
function onDecimal() {
	if (calcState.waitingForNext) {
		calcState.currentValue = '0.';
		calcState.waitingForNext = false;
		setCalcScreen(calcState.currentValue);
		return;
	}

	if (!calcState.currentValue.includes('.')) {
		calcState.currentValue += '.';
		setCalcScreen(calcState.currentValue);
	}
}

// Gestiona operadores y encadena calculos intermedios.
function onOperator(operator) {
	const current = parseFloat(calcState.currentValue);

	if (calcState.operator && !calcState.waitingForNext && calcState.storedValue !== null) {
		const result = calculate(calcState.storedValue, current, calcState.operator);
		if (result === null) {
			setCalcExpression('Division por cero');
			setCalcScreen('Error');
			calcState.currentValue = '0';
			calcState.storedValue = null;
			calcState.operator = null;
			calcState.waitingForNext = false;
			return;
		}

		const formatted = formatResult(result);
		calcState.currentValue = formatted;
		calcState.storedValue = parseFloat(formatted);
		setCalcScreen(formatted);
	} else {
		calcState.storedValue = current;
	}

	calcState.operator = operator;
	calcState.waitingForNext = true;
	setCalcExpression(`${calcState.storedValue} ${operatorSymbols[operator]}`);
}

// Guarda una operacion finalizada en el backend.
async function saveOperation(expressionText, resultText) {
	const response = await fetch(calculatorEndpoints.save, {
		method: 'POST',
		credentials: 'same-origin',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			expression: expressionText,
			result: resultText
		})
	});

	const payload = await response.json().catch(() => ({ ok: false }));
	if (!response.ok || !payload.ok) {
		throw new Error(payload.error || 'No se pudo guardar la operacion');
	}
}

// Formatea fecha y hora del historial para mostrarla legible.
function formatDateTime(value) {
	const parsed = new Date(String(value).replace(' ', 'T'));
	if (Number.isNaN(parsed.getTime())) {
		return '';
	}

	return parsed.toLocaleString('es-AR', {
		day: '2-digit',
		month: '2-digit',
		year: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	});
}

// Renderiza la lista de historial de operaciones.
function renderHistory(items) {
	if (!calcElements.history) {
		return;
	}

	if (!items || items.length === 0) {
		calcElements.history.innerHTML = '<li class="empty-state">Todavia no hay operaciones.</li>';
		return;
	}

	calcElements.history.innerHTML = items
		.map((item) => `
			<li class="calc-history-item">
				<p class="calc-history-expression">${escapeHtml(item.expression)} = ${escapeHtml(item.result)}</p>
				<p class="calc-history-meta">${formatDateTime(item.created_at)}</p>
			</li>
		`)
		.join('');
}

// Carga historial de operaciones del backend.
async function loadHistory() {
	const response = await fetch(calculatorEndpoints.list, {
		method: 'GET',
		credentials: 'same-origin'
	});

	const payload = await response.json().catch(() => ({ ok: false, data: [] }));
	if (!response.ok || !payload.ok) {
		throw new Error(payload.error || 'No se pudo cargar el historial');
	}

	renderHistory(payload.data);
}

// Ejecuta el calculo final cuando se presiona igual.
async function onEquals() {
	if (!calcState.operator || calcState.waitingForNext || calcState.storedValue === null) {
		return;
	}

	const left = calcState.storedValue;
	const right = parseFloat(calcState.currentValue);
	const operator = calcState.operator;
	const result = calculate(left, right, operator);

	if (result === null) {
		setCalcExpression('Division por cero');
		setCalcScreen('Error');
		calcState.currentValue = '0';
		calcState.storedValue = null;
		calcState.operator = null;
		calcState.waitingForNext = false;
		return;
	}

	const formattedResult = formatResult(result);
	const expressionText = `${left} ${operatorSymbols[operator]} ${right}`;

	setCalcExpression(`${expressionText} = ${formattedResult}`);
	setCalcScreen(formattedResult);

	calcState.currentValue = formattedResult;
	calcState.storedValue = null;
	calcState.operator = null;
	calcState.waitingForNext = false;

	try {
		await saveOperation(expressionText, formattedResult);
		await loadHistory();
	} catch (_error) {
		// No interrumpe el uso de la calculadora si falla el guardado.
	}
}

// Centraliza la entrada de botones/teclas de calculadora.
function handleCalculatorInput(value) {
	if (value === 'C') {
		resetCalculator();
		return;
	}

	if (value === '=') {
		onEquals();
		return;
	}

	if (value === '.') {
		onDecimal();
		return;
	}

	if (/^\d$/.test(value)) {
		onDigit(value);
		return;
	}

	if (validOperators.includes(value)) {
		onOperator(value);
	}
}

// Abre el panel lateral y refresca el historial.
function openDrawer() {
	calcElements.drawer?.classList.add('open');
	calcElements.overlay?.classList.add('active');
	calcElements.drawer?.setAttribute('aria-hidden', 'false');
	calcElements.overlay?.setAttribute('aria-hidden', 'false');
	loadHistory().catch(() => {
		renderHistory([]);
	});
}

// Cierra el panel lateral de calculadora.
function closeDrawer() {
	calcElements.drawer?.classList.remove('open');
	calcElements.overlay?.classList.remove('active');
	calcElements.drawer?.setAttribute('aria-hidden', 'true');
	calcElements.overlay?.setAttribute('aria-hidden', 'true');
}

// Escapa HTML para pintar historial de forma segura.
function escapeHtml(value) {
	return String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

// Vincula eventos de mouse y teclado para operar la calculadora.
function bindCalculatorEvents() {
	document.querySelectorAll('.calc-btn').forEach((button) => {
		button.addEventListener('click', () => {
			handleCalculatorInput(button.dataset.value || '');
		});
	});

	calcElements.openButton?.addEventListener('click', openDrawer);
	calcElements.closeButton?.addEventListener('click', closeDrawer);
	calcElements.overlay?.addEventListener('click', closeDrawer);

	document.addEventListener('keydown', (event) => {
		const drawerOpen = calcElements.drawer?.classList.contains('open');
		if (!drawerOpen) {
			return;
		}

		if (event.key === 'Escape') {
			closeDrawer();
			return;
		}

		if (event.key === 'Enter') {
			event.preventDefault();
			handleCalculatorInput('=');
			return;
		}

		if (event.key === 'Backspace') {
			event.preventDefault();

			if (calcState.waitingForNext) {
				return;
			}

			calcState.currentValue =
				calcState.currentValue.length > 1
					? calcState.currentValue.slice(0, -1)
					: '0';
			setCalcScreen(calcState.currentValue);
			return;
		}

		handleCalculatorInput(event.key);
	});
}

resetCalculator();
bindCalculatorEvents();
loadHistory().catch(() => {
	renderHistory([]);
});
