// Variable global para almacenar el incidente copiado
let incidenteCopiado = null;

// Configuración por defecto
const DEFAULT_CONFIG = {
  tripulantes: [
    { id: "1793", nombre: "SERGIO GONZÁLEZ PÉREZ" },
    { id: "1799", nombre: "REBECA JIMÉNEZ JIMÉNEZ" },
    { id: "1800", nombre: "Allan Jiménez Alpízar" },
    { id: "1801", nombre: "PAMELA SANABRIA MOYA" },
    { id: "1802", nombre: "MÓNICA SANDOVAL SOLANO" },
    { id: "1803", nombre: "SAÚL AGUILAR MORALES" },
    { id: "1805", nombre: "ISABEL VALVERDE BOGANTES" },
    { id: "1807", nombre: "SEDALÍ SOLÍS AGÜERO" },
    { id: "1808", nombre: "MARÍA AMELIA VEGA ACOSTA" },
    { id: "1810", nombre: "BRYAN SALAS MENDOZA" },
    { id: "1812", nombre: "MARCOS ORTEGA ARAYA" },
    { id: "1814", nombre: "JIMMY SEGURA MAZARIEGO" },
    { id: "1976", nombre: "EDUARDO VILLALOBOS MENDEZ" },
    { id: "1977", nombre: "RANDALL COTO QUESADA" }
  ],
          textoIncidente: `Motivo despacho:
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
        TEMP :`,
                formDefaults: {
                  unidad_amb: "",
                  despachador: "",
                  tipo_caso: "",
                  jornada: "diurna",
                  tripulante_1: "",
                  tripulante_2: "",
                  tripulante_3: "",
                  tripulante_4: "",
                  categoria_salida: "A1",
                  categoria_manejo: "A1"
                }
};

// Inicialización
$(document).ready(function () {
  inicializarTripulantes();
  mostrarIncidentes();
  setupEventListeners();
  cargarConfiguracion();
  cargarFormDefaults(); // Cargar valores por defecto del formulario
});

// Función para inicializar los selectores de tripulantes
function inicializarTripulantes() {
  const selectElements = document.querySelectorAll(".tripulante-select");

  selectElements.forEach(select => {
    DEFAULT_CONFIG.tripulantes.forEach(tripulante => {
      let option = document.createElement("option");
      option.value = tripulante.id;
      option.textContent = tripulante.nombre;
      select.appendChild(option);
    });
  });
}

// Función para configurar los event listeners
function setupEventListeners() {
  // Evento para el botón "Nuevo Incidente"
  $('#nuevoIncidente').click(function () {
    if (confirm("Limpiar Formulario? Asegurese de guardar la informacion.")) {
      limpiarFormulario();
      $('#dataForm').removeData('editIndex');
    }
  });

  // Evento para el botón "Guardar Configuración"
  $('#guardarConfig').click(guardarConfiguracion);

  // Evento para el botón "Definir Form"
  $('#definirForm').click(guardarFormDefaults);

  // Evento para el botón "Cargar Defaults"
  $('#cargarDefaults').click(cargarFormDefaults);

  // Evento para el formulario
  $('#dataForm').submit(guardarFormulario);

  // Evento para el checkbox de texto predeterminado
  $('#insertarTextoCheckbox').change(function () {
    $('#informacion_incidente').val(this.checked ? DEFAULT_CONFIG.textoIncidente : '');
  });

  // Evento para teclas numéricas
  document.addEventListener('keydown', manejarTeclasNumericas);
}

// Función para cargar los valores por defecto del formulario
function cargarFormDefaults() {
  const defaults = JSON.parse(localStorage.getItem('formDefaults')) || DEFAULT_CONFIG.formDefaults;

  $('#unidad_amb').val(defaults.unidad_amb);
  $('#despachador').val(defaults.despachador);
  $('#tipo_caso').val(defaults.tipo_caso);
  $(`input[name="jornada"][value="${defaults.jornada}"]`).prop('checked', true);
  $('#tripulante_1').val(defaults.tripulante_1);
  $('#tripulante_2').val(defaults.tripulante_2);
  $('#tripulante_3').val(defaults.tripulante_3);
  $('#tripulante_4').val(defaults.tripulante_4);
  $(`input[name="categoria_salida"][value="${defaults.categoria_salida}"]`).prop('checked', true);
  $(`input[name="categoria_manejo"][value="${defaults.categoria_manejo}"]`).prop('checked', true);

   // alert('Valores por defecto del formulario cargados');
}

// Función para guardar los valores por defecto del formulario
function guardarFormDefaults() {
  const defaults = {
    unidad_amb: $('#unidad_amb').val(),
    despachador: $('#despachador').val(),
    tipo_caso: $('#tipo_caso').val(),
    jornada: $('input[name="jornada"]:checked').val(),
    tripulante_1: $('#tripulante_1').val(),
    tripulante_2: $('#tripulante_2').val(),
    tripulante_3: $('#tripulante_3').val(),
    tripulante_4: $('#tripulante_4').val(),
    categoria_salida: $('input[name="categoria_salida"]:checked').val(),
    categoria_manejo: $('input[name="categoria_manejo"]:checked').val()
  };

  localStorage.setItem('formDefaults', JSON.stringify(defaults));
  alert('Valores por defecto del formulario guardados');
}

// Resto del código permanece igual...
function manejarTeclasNumericas(event) {
  if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
    const horaActual = obtenerHoraActual();
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

    if (teclasCampos[event.key]) {
      const campo = document.getElementById(teclasCampos[event.key]);
      if (campo && !campo.value) {
        campo.value = horaActual;
        resaltarCampo(campo);
      }
    }
  }
}

function obtenerHoraActual() {
  const now = new Date();
  const horas = String(now.getHours()).padStart(2, '0');
  const minutos = String(now.getMinutes()).padStart(2, '0');
  return `${horas}:${minutos}`;
}

function resaltarCampo(campo) {
  campo.classList.add('resaltar-campo');
  setTimeout(() => campo.classList.remove('resaltar-campo'), 1000);
}

// Función para limpiar el formulario
function limpiarFormulario() {
  $('#dataForm')[0].reset();
}

// Función para guardar el formulario
function guardarFormulario(event) {
  event.preventDefault();

  const datos = obtenerDatosFormulario();
  const editIndex = $('#dataForm').data('editIndex');

  if (editIndex !== undefined) {
    guardarIncidente(datos, editIndex);
  } else {
    guardarIncidente(datos);
  }

  limpiarFormulario();
  $('#dataForm').removeData('editIndex');
}

function obtenerDatosFormulario() {
  let fecha = new Date().toLocaleDateString('es-CR', {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  return {
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
    categoria_manejo: $('input[name="categoria_manejo"]:checked').val(),
    oculto: false // Estado inicial del incidente (visible)
  };
}

// Función para guardar/actualizar incidentes
function guardarIncidente(datos, index = null) {
  let incidentes = JSON.parse(localStorage.getItem('incidentes')) || [];

  if (index !== null) {
    incidentes[index] = datos;
  } else {
    incidentes.push(datos);
  }

  localStorage.setItem('incidentes', JSON.stringify(incidentes));
  mostrarIncidentes();
}

// Función para mostrar incidentes
function mostrarIncidentes() {
  let incidentes = JSON.parse(localStorage.getItem('incidentes')) || [];
  let html = '';

  // Mostrar en orden inverso (último primero) pero mantener IDs originales
  incidentes
    .map((incidente, index) => ({ ...incidente, originalIndex: index }))
    .reverse()
    .forEach((incidente, displayIndex) => {
      if (incidente.oculto) return; // Saltar incidentes ocultos

      html += `
        <div class="postit" data-index="${incidente.originalIndex}">
          <div class="actions">

             <img src="gestionDeIncidentes/img/icons8-copiar-50.png" class="copy-btn" title="Copiar incidente" >
       
        <img src="gestionDeIncidentes/img/icons8-editar-50.png" class="edit-btn" title="Editar incidente">
          
         
             <img src="gestionDeIncidentes/img/icons8-ocultar-30.png" class="hide-btn" title="Ocultar incidente">
          
             <img src="gestionDeIncidentes/img/icons8-eliminar-50.png" class="delete-btn" title="Eliminar incidente">
        
          </div>
          <strong>${incidente.originalIndex}. Fecha:</strong> ${incidente.fecha_incidente}  
          <strong>Despacho:</strong> ${incidente.hora_despacho}<br>
          <strong>Información:</strong> ${incidente.informacion_incidente}<br>
          <strong>Unidad:</strong> ${incidente.unidad_amb}<br>
          <strong>Despachador:</strong> ${obtenerTextoPorValue("despachador", incidente.despachador)}<br>
          <strong>Tipo de Caso:</strong> ${obtenerTextoPorValue("tipo_caso", incidente.tipo_caso)}<br>
        </div>
      `;
    });

  document.getElementById('DashBoard').innerHTML = html;
  asignarEventosIncidentes();
}

// Función para asignar eventos a los botones de incidentes
function asignarEventosIncidentes() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => copiarIncidente(
      parseInt(btn.closest('.postit').dataset.index)
    ));
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => editarIncidente(
      parseInt(btn.closest('.postit').dataset.index)
    ));
  });

  document.querySelectorAll('.hide-btn').forEach(btn => {
    btn.addEventListener('click', () => ocultarIncidente(
      parseInt(btn.closest('.postit').dataset.index)
    ));
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => eliminarIncidente(
      parseInt(btn.closest('.postit').dataset.index)
    ));
  });
}

// Función para copiar un incidente
function copiarIncidente(index) {
  let incidentes = JSON.parse(localStorage.getItem('incidentes')) || [];

  if (index >= 0 && index < incidentes.length) {
    incidenteCopiado = incidentes[index];

    // Guardar en localStorage
    let incidenteCopiadoGlobal = JSON.parse(localStorage.getItem('incidenteCopiadoGlobal')) || [];
    incidenteCopiadoGlobal.push(incidenteCopiado);
    localStorage.setItem('incidenteCopiadoGlobal', JSON.stringify(incidenteCopiadoGlobal));

    // Guardar en chrome.storage
    chrome.storage.local.get("AAE_EXT_SAC", (result) => {
      const AAE_EXT_SAC = result.AAE_EXT_SAC || { GestionIncidentes: { infoIncidente: [] } };
      AAE_EXT_SAC.GestionIncidentes.infoIncidente = [];
      AAE_EXT_SAC.GestionIncidentes.infoIncidente.push(incidenteCopiado);
      chrome.storage.local.set({ AAE_EXT_SAC });
    });
  } else {
    alert('Error: Índice de incidente no válido.');
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
  $(`input[name="categoria_manejo"][value="${incidente.categoria_manejo}"]`).prop('checked', true);

  $('#dataForm').data('editIndex', index);
}

// Función para ocultar un incidente
function ocultarIncidente(index) {
  let incidentes = JSON.parse(localStorage.getItem('incidentes')) || [];
  if (confirm('¿Estás seguro de ocultar este incidente?')) {
    if (index >= 0 && index < incidentes.length) {
      incidentes[index].oculto = true;
      localStorage.setItem('incidentes', JSON.stringify(incidentes));
      mostrarIncidentes();
    }
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

// Función para obtener el texto de un option por su value
function obtenerTextoPorValue(idSelect, value) {
  const selectElement = document.getElementById(idSelect);
  if (selectElement) {
    const option = Array.from(selectElement.options).find(opt => opt.value === value);
    return option ? option.text : "Valor no encontrado";
  }
  return "Select no encontrado";
}

// Configuración por defecto
function guardarConfiguracion() {
  const nuevaConfig = {
    textoIncidente: $('#textoIncidenteConfig').val() || DEFAULT_CONFIG.textoIncidente,
    tripulantes: DEFAULT_CONFIG.tripulantes // Por ahora mantenemos los mismos
  };

  localStorage.setItem('configuracion', JSON.stringify(nuevaConfig));
  alert('Configuración guardada correctamente');
}

function cargarConfiguracion() {
  const configGuardada = JSON.parse(localStorage.getItem('configuracion'));
  if (configGuardada) {
    DEFAULT_CONFIG.textoIncidente = configGuardada.textoIncidente;
    $('#textoIncidenteConfig').val(configGuardada.textoIncidente);
  }
}