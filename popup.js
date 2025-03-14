
  // Lista de botones
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
  const infoModulab  = document.getElementById("infoModulab");

  const instructionSelect = document.getElementById("instructionSelect");
  const TextoDeIndicaciones = document.getElementById("selectedInstructions");

  const versionSpace = document.getElementById('VersionSpace');
  const manifestData = chrome.runtime.getManifest();
  versionSpace.textContent = `${manifestData.name} - Versión: ${manifestData.version}`;

  // Comprobar la URL activa de la pestaña
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    const activeUrl = activeTab.url;
    const allowedUrls = [
      "https://www.saludaunclick.com/ucr",
      "https://lab.lcucr.com:8443",
      "https://10.226.23.18:8443/",
      "https://lcbsucr.obs.ucr.ac.cr/",
      "https://lab.lcucr.com"
    ];

    if (allowedUrls.some(url => activeUrl.includes(url))) {
      document.getElementById('popup-content').style.display = 'block';
    } else {
      document.getElementById('popup-content').style.display = 'none';
      document.getElementById('error-message').style.display = 'block';
    }
  });

  // Función para alternar estado de botones
  function toggleButton(button, setState = null) {
    const isActive = setState !== null ? setState : !button.classList.contains("active");
    button.classList.toggle("active", isActive);
    return isActive;
  }

  // Función para establecer estados iniciales de botones desde `chrome.storage.local`
  function setInitialState(button, path, field) {
    chrome.storage.local.get("AAE_EXT_SAC", (result) => {
      const state = result.AAE_EXT_SAC?.[path]?.[field] || false;
      toggleButton(button, state);
    });
  }

  
  // Configura los botones con los estados iniciales
  setInitialState(runButton1, 'agenda', 'activo');
  setInitialState(runButton7, 'BuscarAusentes', 'activo');
  setInitialState(SonidoBtn, 'sonidoAlerta', 'activo');
  setInitialState(btnvaloraciones, 'Valoraciones', 'activo');

    // Funciones específicas para cada botón
  runButton1.addEventListener("click", () => toggleAndExecute(runButton1, "popupCicloDeAgenda", 'agenda', 'activo'));


  btnvaloraciones.addEventListener("click", () => toggleAndExecute(btnvaloraciones, "valoracionesAlertRefresh", 'Valoraciones', 'activo'));

  runButton2.addEventListener("click", () => sendMessageWithArgs("agregarBotonATabla", ["Recepcion",TextoDeIndicaciones.value]));
  runButton3.addEventListener("click", () => {
    const text = getSelectedInstructions();
    sendMessageWithArgs("agregarBotonATabla", ["Medicamento", text]);
  });
  runButton4.addEventListener("click", () => sendMessageWithArgs("agregarBotonATabla", ["Correo", TextoDeIndicaciones.value]));
  runButton5.addEventListener("click", () => sendMessageWithArgs("agregarBotonATabla", ["Archivo", ""]));
  

//btn modulab 

runButton6.addEventListener("click", 
   
   async () => {
    try {
      
      sendMessageWithArgs("extractIdentificationData","modulab");
      let nuevoTexto = await ConsultaArreglo("ExtracDatos", "infoCliente");

      // Cambia el texto debajo de la etiqueta modulabo
      infoModulab.textContent = nuevoTexto['firstSurname'];
    } catch (error) {
      console.error("Error al consultar el arreglo:", error);
    }
}
  

);

  runButton7.addEventListener("click", () => toggleAndExecute(runButton7, "BuscaAusentes", 'BuscarAusentes', 'activo'));
  SonidoBtn.addEventListener("click", () => toggleAndExecute(SonidoBtn, "SonidoAgenda", 'sonidoAlerta', 'activo'));

  // Reiniciar preferencias
  ReiniciarPreferenciasBtn.addEventListener("click", () => {
    chrome.storage.local.remove("AAE_EXT_SAC", () => location.reload());
  });

  // Función para alternar estado y ejecutar función
  function toggleAndExecute(button, action, path, field) {
    chrome.storage.local.get("AAE_EXT_SAC", (result) => {
      let estructuraActual = result.AAE_EXT_SAC || {};
      estructuraActual[path] = estructuraActual[path] || {};
      estructuraActual[path][field] = toggleButton(button);
      chrome.storage.local.set({ AAE_EXT_SAC: estructuraActual }, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { action });
        });
      });
    });
  }

  // Funciones auxiliares
  function sendMessage(action) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action });
    });
  }

  function sendMessageWithArgs(action, args) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action, args });
    });
  }

  function getSelectedInstructions() {
    let text = " " + TextoDeIndicaciones.value;
    for (const option of instructionSelect.options) {
      if (option.selected) text += option.value;
    }
    return text;
  }

    // Función para alternar estado y ejecutar función
    function ConsultaArreglo(action, path) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get("AAE_EXT_SAC", (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }
    
          const estructuraActual = result.AAE_EXT_SAC;
    
          if (
            estructuraActual &&
            estructuraActual[action] &&
            estructuraActual[action][path] &&
            Array.isArray(estructuraActual[action][path])
          ) {
            console.log("Consulta de array> " + estructuraActual[action][path][0]);
            resolve(estructuraActual[action][path][0]);
          } else {
            reject("La estructura no contiene los datos esperados.");
          }
        });
      });
    }
    