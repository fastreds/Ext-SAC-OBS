// =============================================
// CONSTANTES Y VARIABLES GLOBALES
// =============================================

// Lista de botones del popup
const runButton1 = document.getElementById("run-script1");
const runButton2 = document.getElementById("run-script2");
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

// Mostrar información de versión de la extensión
const versionSpace = document.getElementById('VersionSpace');
const manifestData = chrome.runtime.getManifest();
versionSpace.textContent = `${manifestData.name} - Versión: ${manifestData.version}`;

// Elementos para actualización y soporte
const btnGithub = document.getElementById("btn-github");
const updateStatus = document.getElementById("update-status");
const updateInstructions = document.getElementById("update-instructions");
const btnCheckUpdates = document.getElementById("btn-check-updates");
const linkExtensions = document.getElementById("link-extensions");
const linkGuide = document.getElementById("link-guide");
const linkGuideAlert = document.getElementById("link-guide-alert");

// Elementos para habilitación dinámica de dominios
const btnEnableSite = document.getElementById("btn-enable-site");
const currentDomainSpan = document.getElementById("current-domain-span");

// Elementos para el actualizador automatico (Native Messaging, Windows)
const btnActualizarAuto = document.getElementById("btn-actualizar-auto");
const updateSettings = document.getElementById("update-settings");
const extensionIdSpan = document.getElementById("extension-id");
const btnCopyId = document.getElementById("btn-copy-id");
const installPathInput = document.getElementById("install-path");
const btnSavePath = document.getElementById("btn-save-path");
const pathSavedOk = document.getElementById("path-saved-ok");
const linkConfig = document.getElementById("link-config");

const INSTALL_PATH_KEY = "AAE_EXT_SAC_INSTALL_PATH";
const ZIP_URL = "https://github.com/fastreds/Ext-SAC-OBS/archive/refs/heads/main.zip";

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
    if (!activeTab || !activeTab.url) return;
    const activeUrl = activeTab.url;
    
    // Verificar si es una página web válida
    const isWebPage = activeUrl.startsWith("http://") || activeUrl.startsWith("https://");
    if (!isWebPage) {
      document.getElementById('popup-content').style.display = 'none';
      document.getElementById('error-message').style.display = 'block';
      if (btnEnableSite) btnEnableSite.style.display = 'none';
      if (currentDomainSpan) currentDomainSpan.textContent = "este tipo de página";
      return;
    }

    const allowedUrls = manifestData.host_permissions || [];
    
    // Comprobar si la URL activa coincide con alguna URL permitida en el manifest
    const isAllowedByManifest = allowedUrls.some(url => {
      const regex = new RegExp(url.replace('*', '.*'));
      return regex.test(activeUrl);
    });

    if (isAllowedByManifest) {
      document.getElementById('popup-content').style.display = 'block';
      document.getElementById('error-message').style.display = 'none';
      return;
    }

    // Si no está en el manifest, verificar si tiene permisos dinámicos concedidos
    try {
      const urlObj = new URL(activeUrl);
      const originPattern = `${urlObj.protocol}//${urlObj.host}/*`;
      
      chrome.permissions.contains({ origins: [originPattern] }, (hasPermission) => {
        if (hasPermission) {
          document.getElementById('popup-content').style.display = 'block';
          document.getElementById('error-message').style.display = 'none';
        } else {
          document.getElementById('popup-content').style.display = 'none';
          document.getElementById('error-message').style.display = 'block';
          if (btnEnableSite) btnEnableSite.style.display = 'block';
          if (currentDomainSpan) currentDomainSpan.textContent = urlObj.host;
        }
      });
    } catch (e) {
      document.getElementById('popup-content').style.display = 'none';
      document.getElementById('error-message').style.display = 'block';
      if (btnEnableSite) btnEnableSite.style.display = 'none';
    }
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
  sendMessageWithArgs("agregarBotonATabla", ["Recepcion", ""]);
});

runButton4.addEventListener("click", () => sendMessageWithArgs("agregarBotonATabla", ["Correo", ""]));
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

// =============================================
// LÓGICA DE ACTUALIZACIÓN DESDE GITHUB
// =============================================

// Abre el enlace del repositorio
if (btnGithub) {
  btnGithub.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: "https://github.com/fastreds/Ext-SAC-OBS" });
  });
}

// Abre la pestaña de extensiones de Chrome
if (linkExtensions) {
  linkExtensions.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: "chrome://extensions/" });
  });
}

// Abre la guía de actualización
const openGuide = (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: chrome.runtime.getURL("actualizacion.html") });
};

if (linkGuide) {
  linkGuide.addEventListener("click", openGuide);
}
if (linkGuideAlert) {
  linkGuideAlert.addEventListener("click", openGuide);
}

// =============================================
// CONFIGURACIÓN DEL ACTUALIZADOR AUTOMÁTICO (Native Messaging, Windows)
// =============================================

// Mostrar el ID de la extensión (requerido para instalar el host)
if (extensionIdSpan) {
  extensionIdSpan.textContent = chrome.runtime.id;
}

// Copiar el ID al portapapeles
if (btnCopyId) {
  btnCopyId.addEventListener("click", (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(chrome.runtime.id).then(() => {
      btnCopyId.textContent = "¡Copiado!";
      setTimeout(() => { btnCopyId.textContent = "Copiar"; }, 1500);
    }).catch(() => {});
  });
}

// Cargar la ruta de instalación guardada
if (installPathInput) {
  chrome.storage.local.get(INSTALL_PATH_KEY, (r) => {
    if (r[INSTALL_PATH_KEY]) installPathInput.value = r[INSTALL_PATH_KEY];
  });
}

// Guardar la ruta de instalación
if (btnSavePath) {
  btnSavePath.addEventListener("click", () => {
    const val = installPathInput.value.trim();
    if (!val) return;
    chrome.storage.local.set({ [INSTALL_PATH_KEY]: val }, () => {
      pathSavedOk.style.display = "block";
      setTimeout(() => { pathSavedOk.style.display = "none"; }, 2000);
      refreshAutoUpdateButton();
    });
  });
}

// Mostrar/ocultar la configuración del actualizador
if (linkConfig) {
  linkConfig.addEventListener("click", (e) => {
    e.preventDefault();
    updateSettings.style.display = (updateSettings.style.display === "none") ? "block" : "none";
  });
}

// Iniciar la actualización automática (1 clic)
if (btnActualizarAuto) {
  btnActualizarAuto.addEventListener("click", () => {
    chrome.storage.local.get(INSTALL_PATH_KEY, (r) => {
      const path = r[INSTALL_PATH_KEY];
      if (!path) {
        updateSettings.style.display = "block";
        if (updateStatus) updateStatus.textContent = "Configura la ruta de instalación para actualizar.";
        return;
      }
      btnActualizarAuto.disabled = true;
      btnActualizarAuto.textContent = "Actualizando...";
      chrome.runtime.sendMessage({ action: "startUpdate", path: path, url: ZIP_URL });
    });
  });
}

// Recibir progreso/resultado desde el service worker
chrome.runtime.onMessage.addListener((msg) => {
  if (!msg || !msg.action) return;
  if (msg.action === "updateProgress") {
    if (updateStatus) {
      updateStatus.style.color = "#888";
      updateStatus.textContent = msg.message;
    }
  } else if (msg.action === "updateResult" && !msg.ok) {
    if (btnActualizarAuto) {
      btnActualizarAuto.disabled = false;
      btnActualizarAuto.textContent = "⚙ Actualizar automáticamente";
    }
    if (updateStatus) {
      updateStatus.style.color = "#d9534f";
      updateStatus.textContent = "Error: " + msg.message;
    }
  }
});

// Muestra el boton de actualizacion automatica solo si hay version nueva y ruta configurada
function refreshAutoUpdateButton() {
  chrome.storage.local.get(INSTALL_PATH_KEY, (r) => {
    const hayRuta = !!r[INSTALL_PATH_KEY];
    if (btnActualizarAuto) {
      btnActualizarAuto.style.display = (window.__hayActualizacion && hayRuta) ? "block" : "none";
    }
  });
}

// Controlador para habilitar la extensión en un nuevo dominio en caliente
if (btnEnableSite) {
  btnEnableSite.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab || !activeTab.url) return;
      const activeUrl = activeTab.url;
      try {
        const urlObj = new URL(activeUrl);
        const originPattern = `${urlObj.protocol}//${urlObj.host}/*`;

        chrome.permissions.request({ origins: [originPattern] }, (granted) => {
          if (chrome.runtime.lastError) {
            alert("Error al solicitar permisos: " + chrome.runtime.lastError.message);
            return;
          }
          
          if (granted) {
            // Registrar dinámicamente los content scripts
            const scriptId = "dyn-script-" + urlObj.host.replace(/[^a-zA-Z0-9]/g, "-");
            const register = () => {
              chrome.scripting.registerContentScripts([{
                id: scriptId,
                matches: [originPattern],
                js: [
                  "injection.js",
                  "ControlDeAusentes.js",
                  "RefrescarAgenda.js",
                  "ExtraccionDatos.js",
                  "Etiquetas.js",
                  "valoraciones.js"
                ],
                runAt: "document_idle"
              }], () => {
                if (chrome.runtime.lastError) {
                  alert("Error al registrar scripts dinámicos: " + chrome.runtime.lastError.message);
                }
                // Recargar pestaña y cerrar el popup
                chrome.tabs.reload(activeTab.id);
                window.close();
              });
            };

            // Intentar desregistrar primero por si ya existe
            chrome.scripting.getRegisteredContentScripts({ ids: [scriptId] }, (existing) => {
              if (chrome.runtime.lastError) {
                alert("Error al consultar scripts registrados: " + chrome.runtime.lastError.message);
                register();
                return;
              }
              if (existing && existing.length > 0) {
                chrome.scripting.unregisterContentScripts({ ids: [scriptId] }, () => {
                  if (chrome.runtime.lastError) {
                    console.error("Error al desregistrar:", chrome.runtime.lastError.message);
                  }
                  register();
                });
              } else {
                register();
              }
            });
          } else {
            alert("Permiso rechazado por el usuario.");
          }
        });
      } catch (err) {
        alert("Error crítico de ejecución: " + err.message);
      }
    });
  });
}

/**
 * Compara dos versiones semánticas (ej. "7.2.1" vs "7.2.2")
 * Retorna true si la última versión es mayor que la actual.
 */
function isNewerVersion(current, latest) {
  const currParts = current.split('.').map(Number);
  const lateParts = latest.split('.').map(Number);
  for (let i = 0; i < Math.max(currParts.length, lateParts.length); i++) {
    const curr = currParts[i] || 0;
    const late = lateParts[i] || 0;
    if (late > curr) return true;
    if (late < curr) return false;
  }
  return false;
}

/**
 * Verifica si hay actualizaciones disponibles en el repositorio de GitHub
 * utilizando almacenamiento en caché para no saturar con peticiones.
 */
function checkForUpdates(force = false) {
  const currentVersion = manifestData.version;
  const CACHE_KEY = "AAE_EXT_SAC_UPDATE_CACHE";
  const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hora de caché

  if (updateStatus) {
    updateStatus.style.color = "#888";
    updateStatus.textContent = force ? "Buscando actualizaciones..." : "Comprobando actualizaciones...";
  }

  chrome.storage.local.get(CACHE_KEY, (result) => {
    const now = Date.now();
    const cache = result[CACHE_KEY];

    if (!force && cache && (now - cache.timestamp < CACHE_DURATION_MS)) {
      console.log("Usando versión en caché de GitHub:", cache.latestVersion);
      showUpdateUI(currentVersion, cache.latestVersion);
      return;
    }

    // Consultar GitHub (omite caché si force=true)
    fetch("https://raw.githubusercontent.com/fastreds/Ext-SAC-OBS/main/manifest.json")
      .then(response => {
        if (!response.ok) throw new Error("Error en respuesta de red");
        return response.json();
      })
      .then(remoteManifest => {
        const latestVersion = remoteManifest.version;
        // Guardar en caché
        const cacheData = {
          latestVersion: latestVersion,
          timestamp: now
        };
        chrome.storage.local.set({ [CACHE_KEY]: cacheData }, () => {
          showUpdateUI(currentVersion, latestVersion);
        });
      })
      .catch(error => {
        console.error("Error al consultar actualizaciones:", error);
        // En búsqueda manual, no ocultar el error tras la caché
        if (force) {
          if (updateStatus) {
            updateStatus.style.color = "#d9534f";
            updateStatus.textContent = "No se pudo verificar (revisa tu conexión).";
          }
          return;
        }
        // Si falla, mostramos el caché anterior si existe, o un mensaje de error genérico
        if (cache) {
          showUpdateUI(currentVersion, cache.latestVersion);
        } else {
          if (updateStatus) {
            updateStatus.style.color = "#d9534f";
            updateStatus.textContent = "No se pudo verificar la versión.";
          }
        }
      });
  });
}

// Botón discreto de búsqueda manual (omite la caché)
if (btnCheckUpdates) {
  btnCheckUpdates.addEventListener("click", () => {
    checkForUpdates(true);
  });
}

/**
 * Actualiza la UI según el resultado de la comparación de versiones
 */
function showUpdateUI(current, latest) {
  if (!updateStatus || !updateInstructions) return;

  if (isNewerVersion(current, latest)) {
    window.__hayActualizacion = true;
    updateStatus.innerHTML = `⚠️ Nueva versión disponible: <strong style="color: #d9534f; font-size: 11px;">v${latest}</strong>`;
    updateInstructions.style.display = "block";
    refreshAutoUpdateButton();
  } else {
    window.__hayActualizacion = false;
    updateStatus.innerHTML = `✅ Extensión al día (v${current})`;
    updateInstructions.style.display = "none";
    if (btnActualizarAuto) btnActualizarAuto.style.display = "none";
  }
}

// Iniciar verificación de actualizaciones al abrir el popup
checkForUpdates();

