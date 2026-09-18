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

// Botón para descargar la última versión (actualización manual asistida)
const btnDownloadZip = document.getElementById("btn-download-zip");
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
 * Envía un mensaje a la pestaña activa con diagnóstico en consola
 * @param {string} action - Acción a ejecutar
 */
function sendMessage(action) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs && tabs[0];
    if (!tab) {
      console.warn("[Ext-SAC-OBS] No hay pestaña activa. Acción no enviada:", action);
      return;
    }
    chrome.tabs.sendMessage(tab.id, { action }, () => {
      if (chrome.runtime.lastError) {}
    });

    if (chrome.scripting && chrome.scripting.executeScript) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: (act) => {
          if (act === "popupCicloDeAgenda" && typeof popupCicloDeAgenda === "function") popupCicloDeAgenda();
          if (act === "BuscaAusentes" && typeof GestionBuscaAusentes === "function") GestionBuscaAusentes();
          if (act === "valoracionesAlertRefresh" && typeof verificarEstadoServicioEmergencias === "function") verificarEstadoServicioEmergencias();
        },
        args: [action]
      }).catch(() => {});
    }
  });
}

function sendMessageWithArgs(action, args) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs && tabs[0];
    if (!tab) {
      console.warn("[Ext-SAC-OBS] No hay pestaña activa. Acción no enviada:", action);
      return;
    }
    chrome.tabs.sendMessage(tab.id, { action, args }, () => {
      if (chrome.runtime.lastError) {}
    });

    if (chrome.scripting && chrome.scripting.executeScript) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: (act, ags) => {
          if (act === "extractIdentificationData" && typeof extractIdentificationData === "function") extractIdentificationData();
          if (act === "agregarBotonATabla" && typeof agregarBotonATabla === "function") agregarBotonATabla(ags[0], ags[1]);
          if (act === "llenarFormularioAtencionMedica" && typeof llenarFormularioAtencionMedica === "function") llenarFormularioAtencionMedica();
        },
        args: [action, args]
      }).catch(() => {});
    }
  });
}

/**
 * Consulta datos almacenados en chrome.storage.local.
 * Reintenta varias veces para esperar a que el content script termine de guardar
 * (evita la condición de carrera entre enviar la extracción y leer el resultado).
 * @param {string} action - Acción/clave principal
 * @param {string} path - Ruta/clave secundaria
 * @param {number} intentos - Número de reintentos (por defecto 10)
 * @param {number} intervalo - Milisegundos entre reintentos (por defecto 400)
 * @returns {Promise} Promesa que resuelve con los datos consultados
 */
function ConsultaArreglo(action, path, intentos = 10, intervalo = 400) {
  return new Promise((resolve, reject) => {
    const consultar = (intento) => {
      chrome.storage.local.get("AAE_EXT_SAC", (result) => {
        if (chrome.runtime.lastError) {
          console.error(`[Ext-SAC-OBS] Error de storage en ConsultaArreglo("${action}", "${path}"):`, chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }

        const estructuraActual = result.AAE_EXT_SAC;
        const datos = estructuraActual?.[action]?.[path];

        if (Array.isArray(datos) && datos.length > 0) {
          console.log(`[Ext-SAC-OBS] ConsultaArreglo("${action}", "${path}") resuelto en intento ${intentos - intento}.`);
          resolve(datos[0]);
          return;
        }

        if (intento <= 0) {
          console.warn(
            `[Ext-SAC-OBS] ConsultaArreglo("${action}", "${path}") sin datos tras ${intentos} intentos.` +
            ` estructuraActual=${JSON.stringify(estructuraActual)}`
          );
          reject(new Error("La estructura no contiene los datos esperados."));
          return;
        }

        setTimeout(() => consultar(intento - 1), intervalo);
      });
    };
    consultar(intentos);
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

// Helper para formatear el nombre completo del paciente sin cortes
function formatearNombrePaciente(d) {
  if (!d || typeof d !== "object") return "";

  // 1. Si viene nombre completo directo
  if (d.fullName && typeof d.fullName === "string" && d.fullName.trim().length > 0) {
    return d.fullName.trim();
  }
  if (d.nombreCompleto && typeof d.nombreCompleto === "string" && d.nombreCompleto.trim().length > 0) {
    return d.nombreCompleto.trim();
  }

  // 2. Concatenar apellidos y nombres disponibles
  const partes = [];
  const apellido1 = (d.primerApellido || d.firstSurname || "").trim();
  const apellido2 = (d.segundoApellido || d.secondSurname || "").trim();
  const nombre = (d.nombre || d.firstName || "").trim();

  if (apellido1) partes.push(apellido1);
  if (apellido2) partes.push(apellido2);
  if (nombre) partes.push(nombre);

  if (partes.length > 0) {
    return partes.join(" ");
  }

  return d.identityCard || d.patientID || "Datos extraídos";
}

// Cargar el último paciente extraído al abrir el popup si ya existe en storage
chrome.storage.local.get("AAE_EXT_SAC", (result) => {
  const infoCliente = result.AAE_EXT_SAC?.ExtracDatos?.infoCliente;
  if (Array.isArray(infoCliente) && infoCliente.length > 0) {
    const nombre = formatearNombrePaciente(infoCliente[0]);
    if (nombre) {
      infoModulab.textContent = nombre;
    }
  }
});

// Botón Modulab - Extrae datos de identificación
runButton6.addEventListener("click", async () => {
  infoModulab.textContent = "Extrayendo datos...";

  // 1. Intentar ejecución directa en todos los frames
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs && tabs[0];
    if (tab && chrome.scripting) {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: () => {
          if (typeof extractIdentificationData === "function") {
            return extractIdentificationData();
          }
          return null;
        }
      });
      console.log("[Ext-SAC-OBS] Resultados de extracción directa en frames:", results);

      if (Array.isArray(results)) {
        for (const r of results) {
          const d = r?.result;
          if (d && (d.fullName || d.nombreCompleto || d.primerApellido || d.firstSurname || d.nombre || d.firstName)) {
            const nombreCompleto = formatearNombrePaciente(d);
            infoModulab.textContent = nombreCompleto;
            console.log("[Ext-SAC-OBS] Modulab: datos resueltos directamente desde frame:", d);
            return;
          }
        }
      }
    }
  } catch (e) {
    console.warn("[Ext-SAC-OBS] executeScript directo no disponible o falló:", e);
  }

  // 2. Fallback: Enviar mensaje y consultar almacenamiento con reintentos
  sendMessageWithArgs("extractIdentificationData", "modulab");
  try {
    const datos = await ConsultaArreglo("ExtracDatos", "infoCliente", 12, 350);
    const nombreCompleto = formatearNombrePaciente(datos);
    infoModulab.textContent = nombreCompleto;
    console.log("[Ext-SAC-OBS] Modulab: datos extraídos correctamente desde storage:", datos);
  } catch (error) {
    infoModulab.textContent = "Sin datos del expediente";
    console.error("[Ext-SAC-OBS] Modulab: error al consultar el arreglo:", error);
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

// Descarga directa de la última versión (actualización manual asistida)
if (btnDownloadZip) {
  btnDownloadZip.addEventListener("click", () => {
    chrome.tabs.create({ url: ZIP_URL });
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

const CACHE_KEY = "AAE_EXT_SAC_UPDATE_CACHE";
const LAST_CHECK_KEY = "AAE_EXT_SAC_LAST_CHECK";
const CHECK_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 horas: máximo 1 consulta al día
const UPDATE_URL = "https://raw.githubusercontent.com/fastreds/Ext-SAC-OBS/main/manifest.json";

/**
 * Muestra el resultado ya guardado SIN hacer peticiones de red.
 * El service worker comprueba la versión al iniciar el navegador y guarda el
 * resultado; aquí solo se lee, por lo que el popup abre al instante.
 */
function showStoredUpdate() {
  const currentVersion = manifestData.version;
  chrome.storage.local.get(CACHE_KEY, (result) => {
    const cache = result[CACHE_KEY];
    if (cache && cache.latestVersion) {
      showUpdateUI(currentVersion, cache.latestVersion);
    } else {
      // Sin caché todavía: no se muestra nada ni se toca la red
      // (el service worker la sembrará al iniciar el navegador).
      if (updateStatus) updateStatus.textContent = "";
      if (updateInstructions) updateInstructions.style.display = "none";
    }
  });
}

/**
 * Consulta GitHub. Respeta un enfriamiento de 24 h salvo que force=true
 * (botón manual del usuario). Esto evita saturar/banear en muchas PCs.
 */
function fetchLatest(force, onDone) {
  if (updateStatus) {
    updateStatus.style.color = "#888";
    updateStatus.textContent = force ? "Buscando actualizaciones..." : "";
  }
  const finalizar = () => { if (typeof onDone === "function") onDone(); };
  chrome.storage.local.get(LAST_CHECK_KEY, (res) => {
    const now = Date.now();
    const last = res[LAST_CHECK_KEY] || 0;
    if (!force && (now - last < CHECK_COOLDOWN_MS)) {
      // Dentro del enfriamiento: mostrar lo ya guardado sin tocar la red
      showStoredUpdate();
      finalizar();
      return;
    }

    fetch(UPDATE_URL)
      .then(response => {
        if (!response.ok) throw new Error("Error en respuesta de red");
        return response.json();
      })
      .then(remoteManifest => {
        const latestVersion = remoteManifest.version;
        chrome.storage.local.set({
          [CACHE_KEY]: { latestVersion: latestVersion, timestamp: now },
          [LAST_CHECK_KEY]: now
        }, () => {
          showUpdateUI(manifestData.version, latestVersion);
          finalizar();
        });
      })
      .catch(error => {
        console.error("Error al consultar actualizaciones:", error);
        if (force) {
          if (updateStatus) {
            updateStatus.style.color = "#d9534f";
            updateStatus.textContent = "No se pudo verificar (revisa tu conexión).";
          }
          finalizar();
          return;
        }
        // Si falla sin ser forzado, mostramos la caché previa si existe
        chrome.storage.local.get(CACHE_KEY, (r2) => {
          if (r2[CACHE_KEY]) {
            showUpdateUI(manifestData.version, r2[CACHE_KEY].latestVersion);
          } else if (updateStatus) {
            updateStatus.style.color = "#d9534f";
            updateStatus.textContent = "No se pudo verificar la versión.";
          }
          finalizar();
        });
      });
  });
}

// Botón discreto de búsqueda manual (el usuario decide cuándo)
if (btnCheckUpdates) {
  btnCheckUpdates.addEventListener("click", () => {
    btnCheckUpdates.disabled = true;
    btnCheckUpdates.textContent = "Buscando...";
    const terminar = () => {
      btnCheckUpdates.disabled = false;
      btnCheckUpdates.textContent = "↻ Buscar actualizaciones";
    };
    fetchLatest(true, terminar);
  });
}

/**
 * Actualiza la UI según el resultado de la comparación de versiones
 */
function showUpdateUI(current, latest) {
  if (!updateStatus || !updateInstructions) return;

  if (isNewerVersion(current, latest)) {
    updateStatus.innerHTML = `⚠️ Nueva versión disponible: <strong style="color: #d9534f; font-size: 11px;">v${latest}</strong>`;
    updateInstructions.style.display = "block";
  } else {
    updateStatus.innerHTML = `✅ Extensión al día (v${current})`;
    updateInstructions.style.display = "none";
  }
}

// Al abrir el popup solo se muestra el resultado ya guardado (sin tocar la red).
// Se difiere la lectura para no competir con el render inicial del popup.
if ("requestIdleCallback" in window) {
  requestIdleCallback(showStoredUpdate, { timeout: 200 });
} else {
  setTimeout(showStoredUpdate, 0);
}

