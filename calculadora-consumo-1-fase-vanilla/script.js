// ── 1. SELECCIÓN DE ELEMENTOS DEL DOM ────────────────────────
// Igual que antes usamos getElementById, pero ahora los campos
// son "km actual" y "litros" en vez de km-inicio / km-fin / litros.
 
const inputKm     = document.getElementById('km');
const inputLitros = document.getElementById('litros');
const divResultado = document.getElementById('resultado');  // mismo id que el original
const errorMsg     = document.getElementById('error-msg');
 
 
// ── 2. ALMACENAMIENTO: ARRAY DE OBJETOS ──────────────────────
//
// En la versión anterior solo teníamos variables sueltas (kmInicio, kmFin, litros).
// Ahora usamos un Array llamado `cargas` para guardar TODOS los registros del viaje.
//
// Cada elemento del array es un objeto con dos propiedades:
//   { km: Number, litros: Number }
//
// Ejemplo de cómo queda el array con 3 cargas registradas:
//   cargas = [
//     { km: 45000, litros: 0    },   ← carga 0: punto de partida
//     { km: 45320, litros: 62.5 },   ← carga 1
//     { km: 45680, litros: 58.0 },   ← carga 2
//   ]
//
// Ventajas del array:
//   - Podemos agregar registros con .push() sin perder los anteriores
//   - Podemos recorrerlos con .map() para generar filas HTML
//   - Podemos acumular litros con .reduce()
//   - Podemos eliminar uno con .splice(indice, 1)
 
let cargas = [];   // Empieza vacío; se llena con agregarCarga()
 
 
// ── 3. FUNCIÓN: agregarCarga ──────────────────────────────────
// Reemplaza al listener del 'submit' de la versión original.
// Valida los campos y, si están bien, agrega un objeto al array.
// ─────────────────────────────────────────────────────────────
function agregarCarga() {
 
    // Leemos y convertimos los valores (igual que parseFloat del original)
    const km     = parseFloat(inputKm.value);
    const litros = parseFloat(inputLitros.value);
 
    // Ocultamos cualquier error previo
    ocultarError();
 
    // ── Validación 1: campos con valores numéricos válidos
    if (isNaN(km) || isNaN(litros) || km < 0 || litros <= 0) {
        mostrarError('Por favor ingresá valores válidos en ambos campos.');
        return;  // El return detiene la función, igual que en el original
    }
 
    // ── Validación 2: el kilometraje debe ir en orden ascendente
    //    (en la versión original esto era: kmFin > kmInicio)
    if (cargas.length > 0) {
        const ultimoKm = cargas[cargas.length - 1].km;
        if (km <= ultimoKm) {
            mostrarError(`El kilometraje debe ser mayor al anterior (${ultimoKm.toLocaleString('es-AR')} km).`);
            return;
        }
    }
 
    // ── Guardado en el array ──
    // Creamos el objeto con los datos de esta carga y lo empujamos al array
    cargas.push({ km: km, litros: litros });
 
    // Limpiamos los campos para el próximo ingreso
    inputKm.value     = '';
    inputLitros.value = '';
    inputKm.focus();
 
    // Si había un resultado visible, lo ocultamos (el viaje continúa)
    divResultado.classList.add('hidden');
 
    // Actualizamos la tabla visual
    renderizarTabla();
}
 
 
// ── 4. FUNCIÓN: renderizarTabla ───────────────────────────────
// Recorre el array `cargas` y genera una fila <tr> por cada objeto.
// Si el array está vacío, oculta la sección entera.
// ─────────────────────────────────────────────────────────────
function renderizarTabla() {
 
    const seccion = document.getElementById('registros-section');
    const tbody   = document.getElementById('tabla-body');
 
    // Si no hay cargas, ocultamos la sección completa
    if (cargas.length === 0) {
        seccion.classList.add('hidden');
        return;
    }
 
    // Mostramos la sección (quitamos la clase 'hidden' de Tailwind)
    seccion.classList.remove('hidden');
 
    // .map() recorre cada objeto del array y devuelve un string HTML por cada uno.
    // El índice `i` se usa para mostrar el número de fila y para el botón eliminar.
    // .join('') une todos los strings en uno solo sin separadores.
    tbody.innerHTML = cargas.map((carga, i) => `
        <tr class="row-enter">
            <td class="px-4 py-3 text-xs font-bold text-ecoGreen">${String(i + 1).padStart(2, '0')}</td>
            <td class="px-4 py-3 font-medium">${carga.km.toLocaleString('es-AR')} km</td>
            <td class="px-4 py-3 font-medium">${carga.litros.toFixed(1)} L</td>
            <td class="px-4 py-3 text-right">
                <button class="btn-delete" onclick="eliminarCarga(${i})" title="Eliminar">✕</button>
            </td>
        </tr>
    `).join('');
}
 
 
// ── 5. FUNCIÓN: eliminarCarga ─────────────────────────────────
// Elimina un registro del array usando su índice y re-renderiza.
// ─────────────────────────────────────────────────────────────
function eliminarCarga(indice) {
 
    // .splice(indice, 1) elimina exactamente 1 elemento en esa posición
    cargas.splice(indice, 1);
 
    // Ocultamos el resultado si el usuario modifica los registros
    divResultado.classList.add('hidden');
 
    // Volvemos a dibujar la tabla con el array actualizado
    renderizarTabla();
}
 
 
// ── 6. FUNCIÓN: finalizarViaje ────────────────────────────────
// Calcula el consumo L/100km del viaje completo.
//
// Fórmula (igual que el original pero sobre el viaje completo):
//   consumo = (litros totales / distancia total) × 100
//
// Convención estándar de logística:
//   - La carga 0 solo fija el KM de inicio (esos litros ya estaban en el tanque).
//   - Los litros de las cargas 1..N son los que se consumieron en el trayecto.
// ─────────────────────────────────────────────────────────────
function finalizarViaje() {
 
    // Necesitamos al menos 2 registros para tener una distancia
    if (cargas.length < 2) {
        mostrarError('Necesitás al menos 2 registros para calcular el consumo del viaje.');
        return;
    }
 
    // ── Distancia total ──
    // Primera carga → km inicial | Última carga → km final
    const kmInicial = cargas[0].km;
    const kmFinal   = cargas[cargas.length - 1].km;
    const distancia = kmFinal - kmInicial;   // Igual que (kmFin - kmInicio) del original
 
    // ── Litros totales ──
    // .slice(1) descarta la carga 0 (punto de arranque).
    // .reduce() acumula la suma de litros del resto de cargas.
    const litrosTotales = cargas
        .slice(1)
        .reduce((suma, carga) => suma + carga.litros, 0);
 
    // ── Consumo L/100km ──
    // Misma fórmula que el original: (litros / distancia) * 100
    const consumo = (litrosTotales / distancia) * 100;
 
    // ── Mostramos los resultados en el DOM ──
    // Usamos los mismos patrones del original: .toFixed(2) y template literals
    document.getElementById('res-distancia').textContent = distancia.toLocaleString('es-AR');
    document.getElementById('res-litros').textContent    = litrosTotales.toFixed(1);
    document.getElementById('res-consumo').textContent   = consumo.toFixed(2);
    document.getElementById('res-meta').textContent      =
        `Basado en ${cargas.length} registros · ${kmInicial.toLocaleString('es-AR')} → ${kmFinal.toLocaleString('es-AR')} km`;
 
    // Hacemos visible el panel de resultado (quitamos 'hidden')
    divResultado.classList.remove('hidden');
 
    // Scroll suave hacia el resultado
    divResultado.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
 
 
// ── 7. FUNCIÓN: resetearViaje ─────────────────────────────────
// Vacía el array y deja la app lista para un nuevo viaje.
// ─────────────────────────────────────────────────────────────
function resetearViaje() {
 
    cargas = [];   // Vaciamos el array
 
    // Ocultamos secciones
    document.getElementById('registros-section').classList.add('hidden');
    divResultado.classList.add('hidden');
 
    // Limpiamos el tbody por seguridad
    document.getElementById('tabla-body').innerHTML = '';
 
    // Foco al primer campo para empezar de nuevo
    inputKm.focus();
}
 
 
// ── 8. FUNCIONES AUXILIARES ───────────────────────────────────
 
// Muestra el párrafo de error con un mensaje
function mostrarError(mensaje) {
    errorMsg.textContent = mensaje;
    errorMsg.classList.remove('hidden');
}
 
// Oculta el párrafo de error
function ocultarError() {
    errorMsg.classList.add('hidden');
    errorMsg.textContent = '';
}
 