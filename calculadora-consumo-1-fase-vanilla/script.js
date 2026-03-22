// 1. Seleccionamos los elementos del DOM y los guardamos en constantes
// Usamos getElementById para vincular el HTML con nuestro código JS
const formulario = document.getElementById('calc-form');
const inputKmInicio = document.getElementById('km-inicio');
const inputKmFin = document.getElementById('km-fin');
const inputLitros = document.getElementById('litros');
const divResultado = document.getElementById('resultado');

formulario.addEventListener('submit', function(event){
    event.preventDefault();
    const kmInicio = parseFloat(inputKmInicio.value);
    const kmFin = parseFloat(inputKmFin.value);
    const litros = parseFloat(inputLitros.value);

    const distancia = kmFin - kmInicio;

    if (distancia <= 0) {
        // Si la distancia es 0 o negativa, mostramos un error y salimos de la función
        divResultado.innerHTML = '<p style="color: red;">Error: Los Km finales deben ser mayores a los iniciales.</p>';
        return; // El return vacío detiene la ejecución aquí
    }

    // Usamos la fórmula para obtener el consumo promedio cada 100 kilómetros
    const consumo = (litros / distancia) * 100;

    // 8. Formateamos el resultado para que solo tenga 2 decimales usando .toFixed(2)
    const resultadoFormateado = consumo.toFixed(2);

    divResultado.innerHTML = `
        <div class="success-message">
            <p>Distancia recorrida: <strong>${distancia} km</strong></p>
            <p>Consumo promedio: <strong>${resultadoFormateado} L/100km</strong></p>
        </div>
    `;

    //formulario.reset(); 
});