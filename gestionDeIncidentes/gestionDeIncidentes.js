
// Variable global para almacenar el incidente copiado
let incidenteCopiado = null;

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
                        <div class="copy-btn">
                            <i><img src="gestionDeIncidentes/img/icons8-copiar-50.png"></i>
                        </div>
                        <div class="edit-btn">
                            <i><img src="gestionDeIncidentes/img/icons8-editar-50.png"></i>
                        </div>
                        <div class="delete-btn">
                            <i><img src="gestionDeIncidentes/img/icons8-eliminar-50.png"></i>
                        </div>
                    </div>
                    <strong>${index}. Fecha:</strong> ${incidente.fecha_incidente}  <strong>Despacho:</strong> ${incidente.hora_despacho}<br>
                    <strong>Información:</strong> ${incidente.informacion_incidente}<br>
                    <strong>Unidad:</strong> ${incidente.unidad_amb}<br>
                    <strong>Despachador:</strong>  ${obtenerTextoPorValue("despachador", incidente.despachador)}<br>
                    <strong>Tipo de Caso:</strong> ${obtenerTextoPorValue("tipo_caso", incidente.tipo_caso)}<br>
                </div>
            `;
    });

    const dashboard = document.getElementById('DashBoard');
    dashboard.innerHTML = html;

    // Asignar eventos después de insertar el HTML
    document.querySelectorAll('.copy-btn').forEach((btn, i) => {
        btn.addEventListener('click', () => copiarIncidente(i));
    });

    document.querySelectorAll('.edit-btn').forEach((btn, i) => {
        btn.addEventListener('click', () => editarIncidente(i));
    });

    document.querySelectorAll('.delete-btn').forEach((btn, i) => {
        btn.addEventListener('click', () => eliminarIncidente(i));
    });
}

// Función para copiar un incidente
function copiarIncidente(index) {
    // Obtener la lista de incidentes desde localStorage
    let incidentes = JSON.parse(localStorage.getItem('incidentes')) || [];

    // Verificar si el índice es válido
    if (index >= 0 && index < incidentes.length) {
        // Copiar el incidente seleccionado
        incidenteCopiado = incidentes[index];

        // Guardar en la variable global
        console.log('Incidente copiado:', incidenteCopiado);

        // Obtener la lista de incidentes copiados desde localStorage
        let incidenteCopiadoGlobal = JSON.parse(localStorage.getItem('incidenteCopiadoGlobal')) || [];

        // Agregar el nuevo incidente copiado
        incidenteCopiadoGlobal.push(incidenteCopiado);

        // Guardar la lista actualizada en localStorage
        localStorage.setItem('incidenteCopiadoGlobal', JSON.stringify(incidenteCopiadoGlobal));

        // Mostrar mensaje de éxito
        alert('Incidente copiado correctamente.');
    } else {
        // Mostrar mensaje de error si el índice no es válido
        alert('Error: Índice de incidente no válido.');
    }
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

    $('#tripulante_2').val(incidente.tripulante_2);

    $('#tripulante_3').val(incidente.tripulante_3);

    $('#tripulante_4').val(incidente.tripulante_4);

    $(`input[name="categoria_salida"][value="${incidente.categoria_salida}"]`).prop('checked', true);
    $(`input[name="categoria_manejo"][value="${incidente.categoria_manejo}"]`).prop('checked', true); // categoria_manejo

    // Guardar el índice del incidente que se está editando
    $('#dataForm').data('editIndex', index);
}

// Evento para el botón "Nuevo Incidente"
$('#nuevoIncidente').click(function () {

    if (confirm("Limpiar Formulario? Asegurese de guardar la informacion.")) {
        limpiarFormulario();
        $('#dataForm').removeData('editIndex'); // Limpiar índice de edición
    }
});

// Evento para el botón "Guardar"
$('#dataForm').submit(function (event) {
    event.preventDefault();
    let fecha = new Date().toLocaleDateString('es-CR', { weekday: "long", year: "numeric", month: "short", day: "numeric" });
    const datos = {
        fecha_incidente: fecha,
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

        tripulante_2: $('#tripulante_2').val(),

        tripulante_3: $('#tripulante_3').val(),

        tripulante_4: $('#tripulante_4').val(),

        categoria_salida: $('input[name="categoria_salida"]:checked').val(),
        categoria_manejo: $('input[name="categoria_manejo"]:checked').val()
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
$(document).ready(function () {
    mostrarIncidentes();
});

document.addEventListener('keydown', function (event) {
    // Verificar si el foco no está en un campo de texto
    if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        // Obtener la fecha actual en formato HH:MM
        const now = new Date();
        const horas = String(now.getHours()).padStart(2, '0');
        const minutos = String(now.getMinutes()).padStart(2, '0');
        const horaActual = `${horas}:${minutos}`;

        // Mapear teclas numéricas a los IDs de los campos
        const teclasCampos = {
            '1': 'hora_despacho',
            '2': 'hora_salida',
            '3': 'llegada_allugar',
            '4': 'llegada_alpaciente',
            '5': 'retiro_escena',
            '6': 'llegada_centro_medico',
            '7': 'retiro_centro_medico',
            '8': 'llegada_estacion',
            '9': 'hora_disponible'
        };

        // Obtener la tecla presionada
        const teclaPresionada = event.key;

        // Verificar si la tecla presionada está en el mapeo
        if (teclasCampos.hasOwnProperty(teclaPresionada)) {
            const idCampo = teclasCampos[teclaPresionada];
            const campo = document.getElementById(idCampo);

            // Si el campo existe y está vacío, asignar la hora actual
            if (campo && !campo.value) {
                campo.value = horaActual;

                // Aplicar la clase de resaltado
                campo.classList.add('resaltar-campo');

                // Quitar la clase de resaltado después de 1 segundo
                setTimeout(() => {
                    campo.classList.remove('resaltar-campo');
                }, 1000); // 1000 ms = 1 segundo
            }
        }
    }
});



///// carga texto predefinido en la info del incidente

document.addEventListener('DOMContentLoaded', function () {
    // Obtener referencias al checkbox y al textarea
    const checkbox = document.getElementById('insertarTextoCheckbox');
    const textarea = document.getElementById('informacion_incidente');

    // Texto predeterminado que se insertará
    const textoPredeterminado = `Motivo despacho:
        Lugar:
        Nombre:
        Cédula:
        Fecha nacimiento:      Edad: 
        Carnet: 
        APP:
        TX:
        Alergias:
        FUM: 

        M. Cosulta: 

        PA: 
        Glasgow:
        E. Mental : 
        SPO2 : 
        FC : 
        FR: 
        TEM :`;

    // Escuchar el evento 'change' del checkbox
    checkbox.addEventListener('change', function () {
        if (checkbox.checked) {
            // Si el checkbox está seleccionado, insertar el texto
            textarea.value = textoPredeterminado;
        } else {
            // Si el checkbox está deseleccionado, limpiar el textarea
            textarea.value = '';
        }
    });
});


///// función que reciba el id de un elemento <select> y el value de un <option>, y devuelva el texto cor
function obtenerTextoPorValue(idSelect, value) {
    // Obtener el elemento select por su id
    const selectElement = document.getElementById(idSelect);

    // Verificar si el elemento existe
    if (selectElement) {
        // Buscar el option que coincide con el value
        const option = Array.from(selectElement.options).find(opt => opt.value === value);

        // Si se encuentra el option, devolver su texto
        if (option) {
            return option.text;
        } else {
            return "No se encontró un option con el valor especificado";
        }
    } else {
        return "El elemento select no existe";
    }
}