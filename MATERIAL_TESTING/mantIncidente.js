// Configuración inicial
const CONFIG = {
  VERSION: '1.0.0',
  STORAGE_KEY: 'incidentes',
  BACKUP_KEY: 'incidentes_backup',
  CONFIG_KEY: 'incidentes_config',
  DEFAULT_INCIDENT_TEXT: `Motivo despacho:
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
  TRIPULANTES: [
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
  TIPOS_CASO: [
    { id: "1", nombre: "Emergencia médica" },
    { id: "2", nombre: "Accidente de tránsito" },
    { id: "3", nombre: "Trauma" },
    { id: "4", nombre: "Parto" },
    { id: "5", nombre: "Enfermedad súbita" }
  ],
  DESPACHADORES: [
    { id: "1", nombre: "Juan Pérez" },
    { id: "2", nombre: "María Rodríguez" },
    { id: "3", nombre: "Carlos Sánchez" }
  ]
};

// Datos de ejemplo iniciales
const EXAMPLE_INCIDENTES = [
  {
    id: "inc001",
    createdAt: "2023-05-15T08:30:00Z",
    updatedAt: "2023-05-15T08:30:00Z",
    informacion_incidente: "Motivo despacho: Dolor precordial\nLugar: Urbanización Las Flores\nNombre: Roberto Méndez\nCédula: 1-2345-6789",
    unidad_amb: "AMB-01",
    despachador: "1",
    tipo_caso: "1",
    tripulantes: {
      tripulante_1: "1793",
      tripulante_2: "1799",
      tripulante_3: "1800",
      tripulante_4: ""
    },
    tiempos: {
      hora_despacho: "08:30",
      hora_salida: "08:35",
      llegada_allugar: "08:45",
      llegada_alpaciente: "08:47",
      retiro_escena: "09:15",
      llegada_centro_medico: "09:25",
      retiro_centro_medico: "",
      llegada_estacion: "09:40",
      hora_disponible: "09:45"
    },
    jornada: "diurna",
    categoria_salida: "1",
    categoria_manejo: "1",
    oculto: false,
    deleted: false
  },
  {
    id: "inc002",
    createdAt: "2023-05-16T14:15:00Z",
    updatedAt: "2023-05-16T14:15:00Z",
    informacion_incidente: "Motivo despacho: Accidente de tránsito\nLugar: Intersección Calle 5 y Avenida 10\n2 víctimas, 1 leve y 1 moderado",
    unidad_amb: "AMB-02",
    despachador: "2",
    tipo_caso: "2",
    tripulantes: {
      tripulante_1: "1801",
      tripulante_2: "1802",
      tripulante_3: "1803",
      tripulante_4: ""
    },
    tiempos: {
      hora_despacho: "14:15",
      hora_salida: "14:18",
      llegada_allugar: "14:25",
      llegada_alpaciente: "14:27",
      retiro_escena: "15:00",
      llegada_centro_medico: "15:15",
      retiro_centro_medico: "",
      llegada_estacion: "15:30",
      hora_disponible: "15:35"
    },
    jornada: "diurna",
    categoria_salida: "1",
    categoria_manejo: "1",
    oculto: false,
    deleted: false
  }
];

// Estado global de la aplicación
const AppState = {
  currentIncidente: null,
  editIndex: null,
  filters: {
    showHidden: false,
    searchTerm: '',
    dateRange: {
      from: null,
      to: null
    }
  }
};

// Inicialización de la aplicación
$(document).ready(function() {
  initSelectOptions();
  loadInitialData();
  loadConfiguration();
  renderIncidentes();
  setupEventListeners();
  setupUI();
});

// ======================
// FUNCIONES PRINCIPALES
// ======================

function initSelectOptions() {
  // Tripulantes
  $('.tripulante-select').each(function() {
    CONFIG.TRIPULANTES.forEach(tripulante => {
      $(this).append(new Option(tripulante.nombre, tripulante.id));
    });
  });
  
  // Despachadores
  CONFIG.DESPACHADORES.forEach(despachador => {
    $('#despachador').append(new Option(despachador.nombre, despachador.id));
  });
  
  // Tipos de caso
  CONFIG.TIPOS_CASO.forEach(tipo => {
    $('#tipo_caso').append(new Option(tipo.nombre, tipo.id));
  });
}

function loadInitialData() {
  // Cargar datos solo si no existen
  if (!localStorage.getItem(CONFIG.STORAGE_KEY)) {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(EXAMPLE_INCIDENTES));
  }
}

function loadConfiguration() {
  const savedConfig = localStorage.getItem(CONFIG.CONFIG_KEY);
  if (savedConfig) {
    Object.assign(CONFIG, JSON.parse(savedConfig));
  }
  $('#textoIncidenteConfig').val(CONFIG.DEFAULT_INCIDENT_TEXT);
}

function saveConfiguration() {
  CONFIG.DEFAULT_INCIDENT_TEXT = $('#textoIncidenteConfig').val();
  localStorage.setItem(CONFIG.CONFIG_KEY, JSON.stringify(CONFIG));
  showAlert('Configuración guardada', 'success');
}

function setupUI() {
  // Inicializar datepickers
  $('.datepicker').datepicker({
    format: 'dd/mm/yyyy',
    language: 'es'
  });

  // Tooltips
  $('[data-toggle="tooltip"]').tooltip();
}

// ======================
// GESTIÓN DE INCIDENTES (CORREGIDO)
// ======================

function getIncidentes() {
  try {
    const data = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY));
    if (!Array.isArray(data)) return [];
    return data.map(incidente => ({
      ...incidente,
      id: incidente.id || generateId()
    }));
  } catch (e) {
    console.error("Error al leer incidentes del almacenamiento:", e);
    return [];
  }
}

function saveIncidentes(incidentes) {
  localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(incidentes));
}

function createIncidente(data) {
  const incidentes = getIncidentes();
  const newIncidente = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...data,
    oculto: false,
    deleted: false
  };
  incidentes.push(newIncidente);
  saveIncidentes(incidentes);
  return newIncidente;
}

function updateIncidente(id, data) {
  const incidentes = getIncidentes();
  const index = incidentes.findIndex(i => i.id === id);
  
  if (index !== -1) {
    incidentes[index] = {
      ...incidentes[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    saveIncidentes(incidentes);
    return incidentes[index];
  }
  return null;
}

function deleteIncidente(id, permanent = false) {
  const incidentes = getIncidentes();
  
  if (permanent) {
    const newIncidentes = incidentes.filter(i => i.id !== id);
    saveIncidentes(newIncidentes);
  } else {
    const index = incidentes.findIndex(i => i.id === id);
    if (index !== -1) {
      incidentes[index].deleted = true;
      incidentes[index].oculto = true;
      saveIncidentes(incidentes);
    }
  }
}

function restoreIncidente(id) {
  const incidentes = getIncidentes();
  const index = incidentes.findIndex(i => i.id === id);
  
  if (index !== -1) {
    incidentes[index].deleted = false;
    incidentes[index].oculto = false;
    saveIncidentes(incidentes);
    return incidentes[index];
  }
  return null;
}

function toggleVisibility(id, visible) {
  const incidentes = getIncidentes();
  const index = incidentes.findIndex(i => i.id === id);
  
  if (index !== -1) {
    incidentes[index].oculto = !visible;
    saveIncidentes(incidentes);
    return incidentes[index];
  }
  return null;
}

function generateId() {
  return 'inc' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
}

// ======================
// RENDERIZADO (CORREGIDO)
// ======================

function renderIncidentes() {
  const incidentes = getIncidentes();
  const filtered = filterIncidentes(incidentes);
  
  // Ordenar por fecha (más reciente primero)
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const html = filtered.map(incidente => renderIncidenteCard(incidente)).join('');
  $('#DashBoard').html(html || '<div class="alert alert-info">No hay incidentes para mostrar</div>');
  
  // Actualizar contadores
  updateCounters(incidentes, filtered);
}

function renderIncidenteCard(incidente) {
  const isHidden = incidente.oculto || incidente.deleted;
  const hiddenClass = isHidden ? 'hidden-incidente' : '';
  const deletedClass = incidente.deleted ? 'deleted-incidente' : '';
  
  // Manejo seguro del ID
  const shortId = incidente.id ? `#${incidente.id.slice(-4)}` : '#N/A';
  
  return `
    <div class="postit ${hiddenClass} ${deletedClass}" data-id="${incidente.id}">
      <div class="actions">
        <button class="btn btn-sm btn-outline-secondary copy-btn" data-toggle="tooltip" title="Copiar">
          <i class="fas fa-copy"></i>
        </button>
        <button class="btn btn-sm btn-outline-primary edit-btn" data-toggle="tooltip" title="Editar">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-outline-warning toggle-visibility-btn" data-toggle="tooltip" title="${incidente.oculto ? 'Mostrar' : 'Ocultar'}">
          <i class="fas ${incidente.oculto ? 'fa-eye' : 'fa-eye-slash'}"></i>
        </button>
        ${incidente.deleted ? `
          <button class="btn btn-sm btn-outline-success restore-btn" data-toggle="tooltip" title="Restaurar">
            <i class="fas fa-trash-restore"></i>
          </button>
        ` : `
          <button class="btn btn-sm btn-outline-danger delete-btn" data-toggle="tooltip" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        `}
      </div>
      
      <div class="incidente-header">
        <span class="badge badge-info">${shortId}</span>
        <small class="text-muted">${formatDate(incidente.createdAt)}</small>
      </div>
      
      <div class="incidente-content">
        <p><strong>Información:</strong> ${incidente.informacion_incidente}</p>
        <p><strong>Unidad:</strong> ${incidente.unidad_amb}</p>
        <p><strong>Despachador:</strong> ${getOptionText('despachador', incidente.despachador)}</p>
        <p><strong>Tipo de Caso:</strong> ${getOptionText('tipo_caso', incidente.tipo_caso)}</p>
      </div>
      
      ${incidente.deleted ? `
        <div class="incidente-footer text-danger">
          <i class="fas fa-trash"></i> Eliminado
        </div>
      ` : ''}
    </div>
  `;
}

function updateCounters(incidentes, filtered) {
  $('#totalIncidentes').text(incidentes.length);
  $('#visibleIncidentes').text(filtered.length);
  $('#hiddenIncidentes').text(incidentes.filter(i => i.oculto && !i.deleted).length);
  $('#deletedIncidentes').text(incidentes.filter(i => i.deleted).length);
}

// ======================
// FUNCIONES AUXILIARES
// ======================

function formatDate(dateString) {
  if (!dateString) return 'Fecha no disponible';
  
  try {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-CR', options);
  } catch (e) {
    return 'Fecha inválida';
  }
}

function getOptionTextFromConfig(configArray, value) {
  const item = configArray.find(opt => opt.id === value);
  return item ? item.nombre : 'No especificado';
}



$('#despachador').empty();



function showAlert(message, type) {
  const alert = $(`
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  `);
  
  $('#alertsContainer').append(alert);
  setTimeout(() => alert.alert('close'), 3000);
}

// ======================
// MANEJO DE EVENTOS
// ======================

function setupEventListeners() {
  // Formulario
  $('#incidenteForm').submit(handleFormSubmit);
  $('#nuevoIncidente').click(resetForm);
  
  // Configuración
  $('#saveConfigBtn').click(saveConfiguration);
  
  // Backup
  $('#createBackupBtn').click(createBackup);
  $('#restoreBackupBtn').click(restoreBackup);
  $('#exportBtn').click(exportToJSON);
  $('#importBtn').change(importFromJSON);
  
  // Filtros
  $('#searchInput').keyup(applyFilters);
  $('#showHiddenCheckbox').change(applyFilters);
  $('#dateFrom, #dateTo').change(applyFilters);
  $('#resetFiltersBtn').click(resetFilters);
  
  // Delegación de eventos para las tarjetas
  $('#DashBoard').on('click', '.copy-btn', handleCopy);
  $('#DashBoard').on('click', '.edit-btn', handleEdit);
  $('#DashBoard').on('click', '.toggle-visibility-btn', handleToggleVisibility);
  $('#DashBoard').on('click', '.delete-btn', handleDelete);
  $('#DashBoard').on('click', '.restore-btn', handleRestore);
  
  // Atajos de teclado
  $(document).keydown(handleKeyShortcuts);
}

// Resto de las funciones (handleFormSubmit, handleCopy, etc.) se mantienen igual que en el código anterior
// Solo asegúrate de que todas usen el ID correctamente y manejen casos donde los datos puedan ser undefined

// ======================
// FUNCIONES DEL FORMULARIO
// ======================

function getFormData() {
  return {
    informacion_incidente: $('#informacion_incidente').val(),
    unidad_amb: $('#unidad_amb').val(),
    despachador: $('#despachador').val(),
    tipo_caso: $('#tipo_caso').val(),
    tripulantes: {
      tripulante_1: $('#tripulante_1').val(),
      tripulante_2: $('#tripulante_2').val(),
      tripulante_3: $('#tripulante_3').val(),
      tripulante_4: $('#tripulante_4').val()
    },
    tiempos: {
      hora_despacho: $('#hora_despacho').val(),
      hora_salida: $('#hora_salida').val(),
      llegada_allugar: $('#llegada_allugar').val(),
      llegada_alpaciente: $('#llegada_alpaciente').val(),
      retiro_escena: $('#retiro_escena').val(),
      llegada_centro_medico: $('#llegada_centro_medico').val(),
      retiro_centro_medico: $('#retiro_centro_medico').val(),
      llegada_estacion: $('#llegada_estacion').val(),
      hora_disponible: $('#hora_disponible').val()
    },
    jornada: $('input[name="jornada"]:checked').val(),
    categoria_salida: $('input[name="categoria_salida"]:checked').val(),
    categoria_manejo: $('input[name="categoria_manejo"]:checked').val()
  };
}

function fillForm(incidente) {
  $('#informacion_incidente').val(incidente.informacion_incidente || '');
  $('#unidad_amb').val(incidente.unidad_amb || '');
  $('#despachador').val(incidente.despachador || '');
  $('#tipo_caso').val(incidente.tipo_caso || '');
  
  // Tripulantes
  $('#tripulante_1').val(incidente.tripulantes?.tripulante_1 || '');
  $('#tripulante_2').val(incidente.tripulantes?.tripulante_2 || '');
  $('#tripulante_3').val(incidente.tripulantes?.tripulante_3 || '');
  $('#tripulante_4').val(incidente.tripulantes?.tripulante_4 || '');
  
  // Tiempos
  $('#hora_despacho').val(incidente.tiempos?.hora_despacho || '');
  $('#hora_salida').val(incidente.tiempos?.hora_salida || '');
  $('#llegada_allugar').val(incidente.tiempos?.llegada_allugar || '');
  $('#llegada_alpaciente').val(incidente.tiempos?.llegada_alpaciente || '');
  $('#retiro_escena').val(incidente.tiempos?.retiro_escena || '');
  $('#llegada_centro_medico').val(incidente.tiempos?.llegada_centro_medico || '');
  $('#retiro_centro_medico').val(incidente.tiempos?.retiro_centro_medico || '');
  $('#llegada_estacion').val(incidente.tiempos?.llegada_estacion || '');
  $('#hora_disponible').val(incidente.tiempos?.hora_disponible || '');
  
  // Radio buttons
  $(`input[name="jornada"][value="${incidente.jornada || 'diurna'}"]`).prop('checked', true);
  $(`input[name="categoria_salida"][value="${incidente.categoria_salida || '1'}"]`).prop('checked', true);
  $(`input[name="categoria_manejo"][value="${incidente.categoria_manejo || '1'}"]`).prop('checked', true);
}