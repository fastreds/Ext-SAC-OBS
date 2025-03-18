 // Función para limpiar el formulario
 function limpiarFormulario() {
    $('#dataForm')[0].reset();
}

// Función para guardar o actualizar en localStorage
function guardarIncidente(datos, index = null) {
    let incidentes = JSON.parse(localStorage.getItem('incidentes')) || [];
    if (index !== null) {
        // Actualizar incidente existente
        incidentes[index] = datos;
    } else {
        // Agregar nuevo incidente
        incidentes.push(datos);
    }
    localStorage.setItem('incidentes', JSON.stringify(incidentes));
    mostrarIncidentes();
}

// Función para mostrar incidentes en el DashBoard
function mostrarIncidentes() {
    let incidentes = JSON.parse(localStorage.getItem('incidentes')) || [];
    let html = '';

    incidentes.forEach((incidente, index) => {
        html += `
            <div class="postit" data-index="${index}">
                <div class="actions">
                    <div class="edit-btn">
                        <i><img src="gestionDeIncidentes/img/icons8-editar-50.png"></i>
                    </div>
                    <div class="delete-btn">
                        <i><img src="gestionDeIncidentes/img/icons8-eliminar-50.png"></i>
                    </div>
                </div>
                <strong>Hora Despacho:</strong> ${incidente.hora_despacho}<br>
                <strong>Información:</strong> ${incidente.informacion_incidente}<br>
                <strong>Unidad:</strong> ${incidente.unidad_amb}<br>
                <strong>Despachador:</strong> ${incidente.despachador}<br>
                <strong>Tipo de Caso:</strong> ${incidente.tipo_caso}<br>
            </div>
        `;
    });

    const dashboard = document.getElementById('DashBoard');
    dashboard.innerHTML = html;

    // Asignar eventos después de insertar el HTML
    document.querySelectorAll('.edit-btn').forEach((btn, i) => {
        btn.addEventListener('click', () => editarIncidente(i));
    });

    document.querySelectorAll('.delete-btn').forEach((btn, i) => {
        btn.addEventListener('click', () => eliminarIncidente(i));
    });
}
// Función para eliminar un incidente
function eliminarIncidente(index) {
    if (confirm('¿Estás seguro de eliminar este incidente?')) {
        let incidentes = JSON.parse(localStorage.getItem('incidentes')) || [];
        incidentes.splice(index, 1);
        localStorage.setItem('incidentes', JSON.stringify(incidentes));
        mostrarIncidentes();
    }
}

// Función para editar un incidente
function editarIncidente(index) {
    let incidentes = JSON.parse(localStorage.getItem('incidentes')) || [];
    let incidente = incidentes[index];

    // Cargar datos en el formulario
    $('#informacion_incidente').val(incidente.informacion_incidente);
    $('#unidad_amb').val(incidente.unidad_amb);
    $('#despachador').val(incidente.despachador);
    $('#tipo_caso').val(incidente.tipo_caso);
    $('#hora_despacho').val(incidente.hora_despacho);
    $('#hora_salida').val(incidente.hora_salida);
    $('#llegada_allugar').val(incidente.llegada_allugar);
    $('#llegada_alpaciente').val(incidente.llegada_alpaciente);
    $('#retiro_escena').val(incidente.retiro_escena);
    $('#llegada_centro_medico').val(incidente.llegada_centro_medico);
    $('#retiro_centro_medico').val(incidente.retiro_centro_medico);
    $('#llegada_estacion').val(incidente.llegada_estacion);
    $('#hora_disponible').val(incidente.hora_disponible);
    $(`input[name="jornada"][value="${incidente.jornada}"]`).prop('checked', true);
    $('#tripulante_1').val(incidente.tripulante_1);
    $('#nivel_trip_1').val(incidente.nivel_trip_1);
    $('#tripulante_2').val(incidente.tripulante_2);
    $('#nivel_trip_2').val(incidente.nivel_trip_2);
    $('#tripulante_3').val(incidente.tripulante_3);
    $('#nivel_trip_3').val(incidente.nivel_trip_3);
    $('#tripulante_4').val(incidente.tripulante_4);
    $('#nivel_trip_4').val(incidente.nivel_trip_4);
    $(`input[name="categoria_salida"][value="${incidente.categoria_salida}"]`).prop('checked', true);

    // Guardar el índice del incidente que se está editando
    $('#dataForm').data('editIndex', index);
}

// Evento para el botón "Nuevo Incidente"
$('#nuevoIncidente').click(function() {
    limpiarFormulario();
    $('#dataForm').removeData('editIndex'); // Limpiar índice de edición
});

// Evento para el botón "Guardar"
$('#dataForm').submit(function(event) {
    event.preventDefault();
    const datos = {
        informacion_incidente: $('#informacion_incidente').val(),
        unidad_amb: $('#unidad_amb').val(),
        despachador: $('#despachador').val(),
        tipo_caso: $('#tipo_caso').val(),
        hora_despacho: $('#hora_despacho').val(),
        hora_salida: $('#hora_salida').val(),
        llegada_allugar: $('#llegada_allugar').val(),
        llegada_alpaciente: $('#llegada_alpaciente').val(),
        retiro_escena: $('#retiro_escena').val(),
        llegada_centro_medico: $('#llegada_centro_medico').val(),
        retiro_centro_medico: $('#retiro_centro_medico').val(),
        llegada_estacion: $('#llegada_estacion').val(),
        hora_disponible: $('#hora_disponible').val(),
        jornada: $('input[name="jornada"]:checked').val(),
        tripulante_1: $('#tripulante_1').val(),
        nivel_trip_1: $('#nivel_trip_1').val(),
        tripulante_2: $('#tripulante_2').val(),
        nivel_trip_2: $('#nivel_trip_2').val(),
        tripulante_3: $('#tripulante_3').val(),
        nivel_trip_3: $('#nivel_trip_3').val(),
        tripulante_4: $('#tripulante_4').val(),
        nivel_trip_4: $('#nivel_trip_4').val(),
        categoria_salida: $('input[name="categoria_salida"]:checked').val()
    };

    // Verificar si se está editando un incidente
    const editIndex = $('#dataForm').data('editIndex');
    if (editIndex !== undefined) {
        guardarIncidente(datos, editIndex); // Actualizar incidente existente
    } else {
        guardarIncidente(datos); // Guardar nuevo incidente
    }

    limpiarFormulario();
    $('#dataForm').removeData('editIndex'); // Limpiar índice de edición
});

// Mostrar incidentes al cargar la página
$(document).ready(function() {
    mostrarIncidentes();
});