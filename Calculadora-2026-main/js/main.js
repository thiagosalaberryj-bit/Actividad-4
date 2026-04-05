// estado de la calculadora 
let pantalla = '0';
let operador = null;
let primerNumero = null;
let esperandoSegundo = false;

// endpoints php
const URL_GUARDAR = 'backend/guardar_operacion.php';
const URL_ULTIMAS = 'backend/ultimas_operaciones.php';

// elementos de la interfaz 
const display = document.getElementById('display');
const expresion = document.getElementById('display-expression');
const historyList = document.getElementById('history-list');

// helpers basicos 
const operadores = ['+', '-', '*', '/'];
const simbolos = { '+': '+', '-': '−', '*': '×', '/': '÷' };

// pinta en pantalla principal
function mostrar(valor) {
    display.value = String(valor);
}

// corrige decimales largos
function formatear(numero) {
    if (!isFinite(numero)) return 'Error';
    return String(parseFloat(numero.toPrecision(12)));
}

// vuelve al estado inicial
function resetear() {
    pantalla = '0';
    operador = null;
    primerNumero = null;
    esperandoSegundo = false;
    expresion.textContent = '';
    mostrar('0');
}

function errorDivision() {
    mostrar('Error');
    expresion.textContent = 'division por cero';
    pantalla = '0';
    operador = null;
    primerNumero = null;
    esperandoSegundo = false;
}

// hace el calculo segun operador
function calcular(a, b, op) {
    if (op === '+') return a + b;
    if (op === '-') return a - b;
    if (op === '*') return a * b;
    if (op === '/') return b === 0 ? null : a / b;
    return b;
}

// muestra el historial en el panel lateral
function renderHistorial(items) {
    if (!historyList) return;

    if (!items || items.length === 0) {
        historyList.innerHTML = '<li class="history-empty">sin operaciones</li>';
        return;
    }

    historyList.innerHTML = items
        .map((item) => {
            const op = simbolos[item.operador] || item.operador;
            return `<li class="history-item">${item.operando1} ${op} ${item.operando2} = ${item.resultado}</li>`;
        })
        .join('');
}

// pide al backend las ultimas 5 operaciones
function cargarHistorial() {
    if (!historyList) return;

    fetch(URL_ULTIMAS)
        .then((res) => res.json())
        .then((data) => {
            if (!data.ok) return renderHistorial([]);
            renderHistorial(data.data);
        })
        .catch(() => {
            historyList.innerHTML = '<li class="history-empty">no se pudo cargar</li>';
        });
}

// guarda una operacion en backend
function guardarOperacion(a, b, op, resultado) {
    return fetch(URL_GUARDAR, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            operando1: a,
            operando2: b,
            operador: op,
            resultado
        })
    })
        .then((res) => res.json())
        .then(() => cargarHistorial())
        .catch(() => {});
}

// entrada de numeros 
function agregarNumero(valor) {
    if (esperandoSegundo) {
        pantalla = valor;
        esperandoSegundo = false;
    } else {
        pantalla = pantalla === '0' ? valor : pantalla + valor;
    }
    mostrar(pantalla);
}

function agregarPunto() {
    if (esperandoSegundo) {
        pantalla = '0.';
        esperandoSegundo = false;
        mostrar(pantalla);
        return;
    }
    if (!pantalla.includes('.')) {
        pantalla += '.';
        mostrar(pantalla);
    }
}

// elegir operador y soportar operaciones encadenadas 
function setOperador(op) {
    const actual = parseFloat(pantalla);

    if (operador && !esperandoSegundo) {
        const parcial = calcular(primerNumero, actual, operador);
        if (parcial === null) {
            errorDivision();
            return;
        }
        pantalla = formatear(parcial);
        primerNumero = parseFloat(pantalla);
        mostrar(pantalla);
    } else {
        primerNumero = actual;
    }

    operador = op;
    esperandoSegundo = true;
    expresion.textContent = `${primerNumero} ${simbolos[op]}`;
}

// resolver resultado 
function resolver() {
    if (!operador || esperandoSegundo) return;

    const a = primerNumero;
    const b = parseFloat(pantalla);
    const opActual = operador;
    const resultado = calcular(a, b, opActual);

    if (resultado === null) {
        errorDivision();
        return;
    }

    const texto = formatear(resultado);
    expresion.textContent = `${a} ${simbolos[opActual]} ${b} = ${texto}`;
    pantalla = texto;
    mostrar(pantalla);

    // solo se guarda al presionar igual
    guardarOperacion(a, b, opActual, parseFloat(texto));

    operador = null;
    primerNumero = null;
    esperandoSegundo = false;
}

// borrar ultimo digito 
function backspace() {
    if (esperandoSegundo) return;
    pantalla = pantalla.length > 1 ? pantalla.slice(0, -1) : '0';
    mostrar(pantalla);
}

// punto de entrada para botones y teclado 
function manejarEntrada(valor) {
    if (!valor) return;

    if (valor === 'C') return resetear();
    if (valor === '=') return resolver();
    if (valor === '.') return agregarPunto();
    if (valor === 'Backspace') return backspace();
    if (operadores.includes(valor)) return setOperador(valor);
    if (/^\d$/.test(valor)) return agregarNumero(valor);
}

// eventos de botones 
document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', () => manejarEntrada(btn.dataset.value));
});

// eventos de teclado 
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') return manejarEntrada('=');
    if (e.key === 'Escape') return manejarEntrada('C');
    manejarEntrada(e.key);
});

// estado inicial 
mostrar(pantalla);
cargarHistorial();
