// =============================================
// CONSTANTES Y VARIABLES GLOBALES
// =============================================

// Lista de botones del popup
const runButton1 = document.getElementById("run-script1");
const runButton2 = document.getElementById("run-script2");
const runButton3 = document.getElementById("run-script3");
const runButton4 = document.getElementById("run-script4");
const runButton5 = document.getElementById("run-script5");
const runButton6 = document.getElementById("run-Modulab1");
const runButton7 = document.getElementById("run-controlAusentes");
const btnvaloraciones = document.getElementById("run-valoraciones");
const SonidoBtn = document.getElementById("SonidoBtn");
const ReiniciarPreferenciasBtn = document.getElementById("ReiniciarPreferenciasBtn");
const infoModulab = document.getElementById("infoModulab");

// Botones para gestión de incidentes
const btnCopyInfoIncidentes = document.getElementById("btnCopyInfoIncidentes");
const btnAbrirIncidenttes = document.getElementById("btnAbrirIncidenttes");

// Elementos para instrucciones/indicaciones
const instructionSelect = document.getElementById("instructionSelect");
const TextoDeIndicaciones = document.getElementById("selectedInstructions");

// Mostrar información de versión de la extensión
const versionSpace = document.getElementById('VersionSpace');
const manifestData = chrome.runtime.getManifest();
versionSpace.textContent = `${manifestData.name} - Versión: ${manifestData.version}`;

// =============================================
// FUNCIONES PRINCIPALES
// =============================================

/**
 * Verifica si la URL actual está permitida según las host_permissions del manifest
 * y muestra/oculta el contenido correspondiente.
 */
function checkAllowedUrl() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    const activeUrl = activeTab.url;
    const allowedUrls = manifestData.host_permissions;
    
    // Comprobar si la URL activa coincide con alguna URL permitida usando regex
    const isAllowed = allowedUrls.some(url => {
      const regex = new RegExp(url.replace('*', '.*'));
      return regex.test(activeUrl);
    });

    // Mostrar contenido apropiado según permisos
    document.getElementById('popup-content').style.display = isAllowed ? 'block' : 'none';
    document.getElementById('error-message').style.display = isAllowed ? 'none' : 'block';
  });
}

/**
 * Alterna el estado visual de un botón y opcionalmente lo establece a un estado específico.
 * @param {HTMLElement} button - Elemento del botón
 * @param {boolean|null} setState - Estado a establecer (opcional)
 * @returns {boolean} Nuevo estado del botón
 */
function toggleButton(button, setState = null) {
  const isActive = setState !== null ? setState : !button.classList.contains("active");
  button.classList.toggle("active", isActive);
  return isActive;
}

/**
 * Establece el estado inicial de un botón desde chrome.storage.local
 * @param {HTMLElement} button - Elemento del botón
 * @param {string} path - Ruta en el almacenamiento
 * @param {string} field - Campo específico
 */
function setInitialState(button, path, field) {
  chrome.storage.local.get("AAE_EXT_SAC", (result) => {
    const state = result.AAE_EXT_SAC?.[path]?.[field] || false;
    toggleButton(button, state);
  });
}

/**
 * Alterna el estado de un botón, guarda el estado y ejecuta una acción
 * @param {HTMLElement} button - Elemento del botón
 * @param {string} action - Acción a ejecutar
 * @param {string} path - Ruta en el almacenamiento
 * @param {string} field - Campo específico
 */
function toggleAndExecute(button, action, path, field) {
  chrome.storage.local.get("AAE_EXT_SAC", (result) => {
    let estructuraActual = result.AAE_EXT_SAC || {};
    estructuraActual[path] = estructuraActual[path] || {};
    estructuraActual[path][field] = toggleButton(button);
    
    chrome.storage.local.set({ AAE_EXT_SAC: estructuraActual }, () => {
      sendMessage(action);
    });
  });
}

/**
 * Obtiene las instrucciones seleccionadas del menú desplegable y el campo de texto
 * @returns {string} Texto combinado de las instrucciones
 */
function getSelectedInstructions() {
  let text = " ";
  for (const option of instructionSelect.options) {
    if (option.selected) text += option.value;
  }
  text += TextoDeIndicaciones.value;
  return text;
}

// =============================================
// FUNCIONES DE COMUNICACIÓN
// =============================================

/**
 * Envía un mensaje a la pestaña activa
 * @param {string} action - Acción a ejecutar
 */
function sendMessage(action) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action });
  });
}

/**
 * Envía un mensaje con argumentos a la pestaña activa
 * @param {string} action - Acción a ejecutar
 * @param {any} args - Argumentos para la acción
 */
function sendMessageWithArgs(action, args) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action, args });
  });
}

/**
 * Consulta datos almacenados en chrome.storage.local
 * @param {string} action - Acción/clave principal
 * @param {string} path - Ruta/clave secundaria
 * @returns {Promise} Promesa que resuelve con los datos consultados
 */
function ConsultaArreglo(action, path) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("AAE_EXT_SAC", (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }

      const estructuraActual = result.AAE_EXT_SAC;

      if (estructuraActual?.[action]?.[path] && Array.isArray(estructuraActual[action][path])) {
        resolve(estructuraActual[action][path][0]);
      } else {
        reject("La estructura no contiene los datos esperados.");
      }
    });
  });
}

// =============================================
// CONFIGURACIÓN INICIAL Y EVENT LISTENERS
// =============================================

// Establecer estados iniciales de los botones
setInitialState(runButton1, 'agenda', 'activo');
setInitialState(runButton7, 'BuscarAusentes', 'activo');
setInitialState(SonidoBtn, 'sonidoAlerta', 'activo');
setInitialState(btnvaloraciones, 'Valoraciones', 'activo');

// Verificar URL permitida al cargar
checkAllowedUrl();

// Asignar event listeners a los botones
runButton1.addEventListener("click", () => toggleAndExecute(runButton1, "popupCicloDeAgenda", 'agenda', 'activo'));
btnvaloraciones.addEventListener("click", () => toggleAndExecute(btnvaloraciones, "valoracionesAlertRefresh", 'Valoraciones', 'activo'));

runButton2.addEventListener("click", () => {
  const text = getSelectedInstructions();
  sendMessageWithArgs("agregarBotonATabla", ["Recepcion", text]);
});

runButton3.addEventListener("click", () => {
  const text = getSelectedInstructions();
  sendMessageWithArgs("agregarBotonATabla", ["Medicamento", text]);
});

runButton4.addEventListener("click", () => sendMessageWithArgs("agregarBotonATabla", ["Correo", TextoDeIndicaciones.value]));
runButton5.addEventListener("click", () => sendMessageWithArgs("agregarBotonATabla", ["Archivo", ""]));

// Botón Modulab - Extrae datos de identificación
runButton6.addEventListener("click", async () => {
  try {
    sendMessageWithArgs("extractIdentificationData", "modulab");
    const nuevoTexto = await ConsultaArreglo("ExtracDatos", "infoCliente");
    infoModulab.textContent = nuevoTexto['firstSurname'];
  } catch (error) {
    console.error("Error al consultar el arreglo:", error);
  }
});

runButton7.addEventListener("click", () => toggleAndExecute(runButton7, "BuscaAusentes", 'BuscarAusentes', 'activo'));
SonidoBtn.addEventListener("click", () => toggleAndExecute(SonidoBtn, "SonidoAgenda", 'sonidoAlerta', 'activo'));

// Botón para reiniciar preferencias
ReiniciarPreferenciasBtn.addEventListener("click", () => {
  chrome.storage.local.remove("AAE_EXT_SAC", () => location.reload());
});

// Botón para abrir gestión de incidentes
btnAbrirIncidenttes.addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("gestionDeIncidentes.html") });
});


// Botón copiar incidentes
 
  btnCopyInfoIncidentes.addEventListener("click", () => sendMessageWithArgs("llenarFormularioAtencionMedica", [""]));

