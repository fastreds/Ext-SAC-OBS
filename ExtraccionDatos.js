// Valida si un objeto de datos de paciente contiene información sustancial
function esDatoPacienteValido(datos) {
  if (!datos || typeof datos !== "object") return false;
  return !!(
    (datos.firstSurname && datos.firstSurname.trim().length > 0) ||
    (datos.primerApellido && datos.primerApellido.trim().length > 0) ||
    (datos.firstName && datos.firstName.trim().length > 0) ||
    (datos.nombre && datos.nombre.trim().length > 0) ||
    (datos.identityCard && datos.identityCard.trim().length > 0) ||
    (datos.patientID && datos.patientID.trim().length > 0)
  );
}

// Busca elementos popover o modales de cita en un documento
function buscarPopover(doc) {
  if (!doc) return null;
  const selectors = [
    '.popover.my-popover-appointment-options',
    '.popover.show',
    '.popover',
    '.my-popover-appointment-options',
    '.fc-popover',
    '.tippy-box',
    '[role="tooltip"]',
    '.modal.show',
    '.modal-dialog'
  ];
  for (const sel of selectors) {
    try {
      const elements = doc.querySelectorAll(sel);
      for (const el of elements) {
        const text = el.textContent ? el.textContent.toLowerCase() : "";
        if (text.includes("identificación") || text.includes("identificacion") || 
            text.includes("carné") || text.includes("carne") || 
            text.includes("f. nacimiento") || text.includes("nombre")) {
          return el;
        }
      }
    } catch (e) {}
  }
  return null;
}

// Función para extraer datos de la agenda (popover de cita)
function extraerDatosDeAgenda(popoverContainer) {
  if (!popoverContainer) return null;
  const html = popoverContainer.innerHTML || "";
  const textContent = popoverContainer.textContent || "";

  // 1. Nombre
  let fullName = "";
  const fullNameMatch = html.match(/Nombre\s*:\s*(?:<span[^>]*>)?([^<]+)/i) ||
                        textContent.match(/Nombre\s*:\s*([^\n\r]+)/i);
  if (fullNameMatch) {
    fullName = fullNameMatch[1].trim();
  }

  const cleanFullName = fullName.split("(")[0].trim();
  let firstName = "";
  let firstSurname = "";
  let secondSurname = "";

  if (cleanFullName) {
    const words = cleanFullName.split(/\s+/);
    if (words.length >= 3) {
      secondSurname = words[words.length - 1];
      firstSurname = words[words.length - 2];
      firstName = words.slice(0, words.length - 2).join(" ");
    } else if (words.length === 2) {
      firstSurname = words[1];
      firstName = words[0];
    } else {
      firstName = cleanFullName;
    }
  }

  // 2. Identificación
  const idMatch = html.match(/Identificación\s*:\s*(?:<span[^>]*>)?(\d+)/i) ||
                  textContent.match(/Identificación\s*:\s*(\d+)/i) ||
                  textContent.match(/Identificacion\s*:\s*(\d+)/i);
  const id = idMatch ? idMatch[1].trim() : "";

  // 3. Carné
  const studentCardMatch = html.match(/Carné estudiantil:\s*(?:<span[^>]*>)?([A-Za-z0-9]+)/i) ||
                           textContent.match(/Carné(?:\s+estudiantil)?\s*:\s*([A-Za-z0-9]+)/i) ||
                           textContent.match(/Carne(?:\s+estudiantil)?\s*:\s*([A-Za-z0-9]+)/i);
  const studentCard = studentCardMatch ? studentCardMatch[1].trim() : "";

  // 4. Fecha de nacimiento
  const dobMatch = html.match(/F\.?\s*Nacimiento\s*:\s*(?:<span[^>]*>)?(\d{2}\/\d{2}\/\d{4})/i) ||
                   textContent.match(/F\.?\s*Nacimiento\s*:\s*(\d{2}\/\d{2}\/\d{4})/i) ||
                   textContent.match(/\b(\d{2}\/\d{2}\/\d{4})\b/);
  const dobitrhday = dobMatch ? (dobMatch[1] || dobMatch[0]).trim() : "";

  // 5. Email
  const emailMatch = html.match(/Email\s*:\s*(?:<span[^>]*>)?([\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/i) ||
                     textContent.match(/[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  const email = emailMatch ? (emailMatch[1] || emailMatch[0]).trim() : "";

  // 6. Teléfono
  const phoneMatch = html.match(/Teléfono Celular\s*:\s*(?:<span[^>]*>)?(\d+)/i) ||
                     html.match(/Teléfono\s*:\s*(?:<span[^>]*>)?(\d+)/i) ||
                     textContent.match(/Teléfono(?:\s+Celular)?\s*:\s*(\d+)/i) ||
                     textContent.match(/\b([24678]\d{7})\b/);
  const phone = phoneMatch ? (phoneMatch[1] || phoneMatch[0]).trim() : "";

  return {
    fullName: cleanFullName,
    nombreCompleto: cleanFullName,
    firstSurname: firstSurname,
    primerApellido: firstSurname,
    secondSurname: secondSurname,
    segundoApellido: secondSurname,
    firstName: firstName,
    nombre: firstName,
    patientID: id,
    identityCard: studentCard || id,
    birthDate: dobitrhday,
    phone: phone,
    email: email
  };
}

// Función para extraer datos del expediente
function extraerDatosDeExpediente(doc) {
  if (!doc) return null;

  const resultado = {
    fullName: "",
    nombreCompleto: "",
    firstSurname: "",
    primerApellido: "",
    secondSurname: "",
    segundoApellido: "",
    firstName: "",
    nombre: "",
    patientID: "",
    identityCard: "",
    gender: "",
    birthDate: "",
    phone: "",
    email: ""
  };

  try {
    // Buscar contenedor que parezca un expediente
    const containers = doc.querySelectorAll(
      '.card, .card-body, .portlet, .portlet-body, #demographics, #patient_summary, .patient-card, .tab-pane.active'
    );

    let searchRoot = null;
    for (const c of containers) {
      const text = c.textContent.toLowerCase();
      if ((text.includes("identificación") || text.includes("identificacion") || text.includes("cédula") || text.includes("cedula") || text.includes("carné") || text.includes("expediente")) &&
          (text.includes("nacimiento") || text.includes("edad") || text.includes("sexo") || text.includes("género") || text.includes("genero"))) {
        searchRoot = c;
        break;
      }
    }

    if (!searchRoot) {
      // Fallback a card-body o documento entero
      searchRoot = doc.querySelector('.card-body.pt-4') || doc.querySelector('#demographics') || doc;
    }

    // Nombre completo del paciente
    const fullNameElem = searchRoot.querySelector('.card-label.font-weight-bold.text-dark-75') ||
                         searchRoot.querySelector('.card-label.font-weight-bolder') ||
                         searchRoot.querySelector('.card-label') ||
                         searchRoot.querySelector('.patient-name, #patient_name, #pat_name') ||
                         searchRoot.querySelector('h3.card-title, h4.card-title, .card-title') ||
                         searchRoot.querySelector('.text-dark-75');

    const fullName = fullNameElem?.textContent.trim();
    if (fullName) {
      const cleanName = fullName.replace(/^(paciente|cliente)\s*:?/i, '').trim();
      resultado.fullName = cleanName;
      resultado.nombreCompleto = cleanName;
      const parts = cleanName.split(/\s+/);
      if (parts.length >= 3) {
        resultado.primerApellido = parts[0];
        resultado.segundoApellido = parts[1];
        resultado.nombre = parts.slice(2).join(' ');
        resultado.firstSurname = parts[0];
        resultado.secondSurname = parts[1];
        resultado.firstName = parts.slice(2).join(' ');
      } else if (parts.length === 2) {
        resultado.primerApellido = parts[0];
        resultado.nombre = parts[1];
        resultado.firstSurname = parts[0];
        resultado.firstName = parts[1];
      } else {
        resultado.nombre = cleanName;
        resultado.firstName = cleanName;
      }
    }

    // Extracción de campos en items o filas
    const items = searchRoot.querySelectorAll('.d-flex, tr, .row, dl, div');
    for (const item of items) {
      const text = item.textContent.trim();
      const textLower = text.toLowerCase();

      // Cédula / Identificación / Carné
      if (!resultado.identityCard && (textLower.includes("cédula") || textLower.includes("cedula") || textLower.includes("carné") || textLower.includes("carne") || textLower.includes("identificación") || textLower.includes("identificacion"))) {
        const m = text.match(/[A-Za-z0-9\-_]{6,}/);
        if (m) {
          resultado.identityCard = m[0];
          if (!resultado.patientID) resultado.patientID = m[0];
        }
      }

      // Fecha de nacimiento
      if (!resultado.birthDate && (textLower.includes("nacimiento") || textLower.includes("f. nac") || textLower.includes("dob"))) {
        const m = text.match(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/);
        if (m) resultado.birthDate = m[0];
      }

      // Sexo / Género
      if (!resultado.gender && (textLower.includes("sexo") || textLower.includes("género") || textLower.includes("genero"))) {
        if (textLower.includes("masculino") || textLower.includes("hombre") || textLower.match(/\b(m)\b/)) {
          resultado.gender = "Masculino";
        } else if (textLower.includes("femenino") || textLower.includes("mujer") || textLower.match(/\b(f)\b/)) {
          resultado.gender = "Femenino";
        }
      }

      // Teléfono / Celular
      if (!resultado.phone && (textLower.includes("tel") || textLower.includes("celular") || textLower.includes("movil"))) {
        const m = text.match(/\b[24678]\d{3}[-\s]?\d{4}\b/) || text.match(/\b\d{8,10}\b/);
        if (m) resultado.phone = m[0].replace(/\s+/g, '');
      }

      // Email
      if (!resultado.email && (textLower.includes("email") || textLower.includes("correo") || text.includes("@"))) {
        const m = text.match(/[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
        if (m) resultado.email = m[0];
      }
    }

    // Fallbacks si algún dato no se extrajo
    if (!resultado.birthDate) {
      const m = searchRoot.textContent.match(/\b\d{2}\/\d{2}\/\d{4}\b/);
      if (m) resultado.birthDate = m[0];
    }
    if (!resultado.email) {
      const m = searchRoot.textContent.match(/[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
      if (m) resultado.email = m[0];
    }
    if (!resultado.patientID) {
      resultado.patientID = searchRoot.querySelector('.d-flex.align-items-center.justify-content-between span.text-muted')?.textContent.trim() || "";
    }
  } catch (e) {
    console.warn("[Ext-SAC-OBS] Error en extracción de expediente:", e);
  }

  return resultado;
}

// Busca y extrae datos de paciente en doc y en sus iframes recursivamente
function buscarYExtraerDatosPaciente(rootDoc = document) {
  // 1. Probar popover en este documento
  const popover = buscarPopover(rootDoc);
  if (popover) {
    const datos = extraerDatosDeAgenda(popover);
    if (esDatoPacienteValido(datos)) {
      return datos;
    }
  }

  // 2. Probar sección de expediente en este documento
  const datosExp = extraerDatosDeExpediente(rootDoc);
  if (esDatoPacienteValido(datosExp)) {
    return datosExp;
  }

  // 3. Probar en iframes hijos directos del mismo origen
  try {
    const iframes = rootDoc.querySelectorAll('iframe, frame');
    for (const iframe of iframes) {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
          const resIframe = buscarYExtraerDatosPaciente(doc);
          if (resIframe && esDatoPacienteValido(resIframe)) {
            return resIframe;
          }
        }
      } catch (e) {
        // Ignorar iframes de distinto origen
      }
    }
  } catch (e) {}

  return null;
}

// Inicialización de la función para extracción de datos (retorna los datos y los guarda en storage)
async function extractIdentificationData() {
  console.log("[Ext-SAC-OBS] Ejecutando extractIdentificationData...");

  // Buscar en el documento y en todos los iframes hijos
  const datosPaciente = buscarYExtraerDatosPaciente(document);

  if (datosPaciente && esDatoPacienteValido(datosPaciente)) {
    guardarDatosPaciente(datosPaciente);
    console.log("[Ext-SAC-OBS] Datos de paciente extraídos y guardados con éxito:", datosPaciente);
    return datosPaciente;
  }

  // Exportar datos a Modulab si está disponible en este frame
  const modulabForm = document.querySelector('patient-creation-dialog');
  if (modulabForm) {
    exportarDatosAModulab(modulabForm);
    return { modulabExportado: true };
  }

  console.log("[Ext-SAC-OBS] No se encontraron datos válidos de expediente ni popover en este frame.");
  return null;
}

// Auto-captura al hacer clic en eventos del calendario o popovers
document.addEventListener("click", (e) => {
  const isCalendarOrPopover = e.target.closest?.(
    '.fc-event, .fc-timegrid-event, .fc-daygrid-event, [data-event-id], .popover, .my-popover-appointment-options'
  );
  if (isCalendarOrPopover) {
    setTimeout(() => {
      const datos = buscarYExtraerDatosPaciente(document);
      if (datos && esDatoPacienteValido(datos)) {
        guardarDatosPaciente(datos);
        console.log("[Ext-SAC-OBS] Auto-captura de cita en clic exitosa:", datos);
      }
    }, 350);
  }
}, true);

// Auto-captura al cargar la página si es un expediente
function intentarAutoExtraccion() {
  const datos = buscarYExtraerDatosPaciente(document);
  if (datos && esDatoPacienteValido(datos)) {
    guardarDatosPaciente(datos);
    console.log("[Ext-SAC-OBS] Auto-captura de expediente al cargar:", datos);
  }
}
setTimeout(intentarAutoExtraccion, 1200);
setTimeout(intentarAutoExtraccion, 3500);

// Función para guardar los datos en chrome.storage
function guardarDatosPaciente(datosPaciente) {
  if (!esDatoPacienteValido(datosPaciente)) return;

  chrome.storage.local.get("AAE_EXT_SAC", (result) => {
    const AAE_EXT_SAC = result.AAE_EXT_SAC || { ExtracDatos: { infoCliente: [] } };
    AAE_EXT_SAC.ExtracDatos = AAE_EXT_SAC.ExtracDatos || {};
    AAE_EXT_SAC.ExtracDatos.infoCliente = [datosPaciente];
    chrome.storage.local.set({ AAE_EXT_SAC }, () => {
      console.log('[Ext-SAC-OBS] Datos guardados en infoCliente:', datosPaciente);
    });
  });
}

// Función para exportar datos a Modulab
function exportarDatosAModulab(modulabForm) {
  chrome.storage.local.get("AAE_EXT_SAC", (result) => {
    if (result.AAE_EXT_SAC && result.AAE_EXT_SAC.ExtracDatos && Array.isArray(result.AAE_EXT_SAC.ExtracDatos.infoCliente)) {
      const data = result.AAE_EXT_SAC.ExtracDatos.infoCliente[0];
      if (data) {


        const pNombre = data.nombre || data.firstName || "";
        const pApellido1 = data.primerApellido || data.firstSurname || "";
        const pApellido2 = data.segundoApellido || data.secondSurname || "";

        const firstSurnameEl = document.getElementById("FirstSurname");
        if (firstSurnameEl) firstSurnameEl.value = pApellido1;

        setValueAndTriggerEvent(document.getElementById("FirstSurname"), pApellido1);
        setValueAndTriggerEvent(document.getElementById("SecondSurname"), pApellido2);
        setValueAndTriggerEvent(document.querySelector('input[name="PatientName"]'), pNombre);
        setValueAndTriggerEvent(document.getElementById("NSSField"), data.identityCard);
        setValueAndTriggerEvent(document.getElementById("ExtIDField"), data.patientID);
        setValueAndTriggerEvent(document.getElementById("NTSField"), data.ntNumber);
        setValueAndTriggerEvent(document.getElementById("DNIField"), data.dni || data.identityCard);

        // Casilla específica para 'Exitus'
        const exitusCheckbox = document.querySelector('input[name="Exitus"]');
        if (exitusCheckbox) {
          exitusCheckbox.checked = data.exitus || false;
          exitusCheckbox.dispatchEvent(new Event("change")); // Forzar cambio de estado
        }

        // Selección de campos (Sexo y Fecha Nacimiento)
        const genderInput = document.querySelector('systelab-gender-select input');
        setValueAndTriggerEvent(genderInput, data.gender);

        const birthDatePicker = document.querySelectorAll('systelab-datepicker input');
        if (birthDatePicker[2]) {
          setValueAndTriggerEvent(birthDatePicker[2], data.birthDate);


          simuladorTecleo(birthDatePicker[2], data.birthDate);
        }

        // Información de contacto
        setValueAndTriggerEvent(document.querySelector('input[name="firstElement"]'), data.address);
        setValueAndTriggerEvent(document.getElementById("countryID"), data.country);
        setValueAndTriggerEvent(document.getElementById("cityID"), data.city);
        setValueAndTriggerEvent(document.getElementById("provinceID"), data.province);
        setValueAndTriggerEvent(document.getElementById("input15"), data.postalCode);
        setValueAndTriggerEvent(document.getElementById("input17"), data.phone);
        setValueAndTriggerEvent(document.getElementById("input20"), data.email);
        setValueAndTriggerEvent(document.getElementById("NacionalidadField"), data.nationality);
        setValueAndTriggerEvent(document.getElementById("PaisNacimientoField"), data.birthCountry);
        setValueAndTriggerEvent(document.getElementById("input27"), data.location);
      } else {
        console.log('No se encontraron datos en infoCliente.');
      }
    }
  });
}

const setValueAndTriggerEvent = (element, value) => {
  if (element) {
    element.value = value || "";

    // Disparar evento de entrada
    element.dispatchEvent(new Event("input", { bubbles: true }));

    // Comprobación para lanzar eventos adicionales según el tipo de campo
    if (element.type === "date" || element.type === "datetime-local") {
      // Disparar eventos adicionales para campos de selección de fecha
      element.dispatchEvent(new Event("change", { bubbles: true }));
      element.dispatchEvent(new Event("blur", { bubbles: true }));
    } else if (element.tagName === "SELECT") {
      // Disparar eventos adicionales para campos select
      element.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      // Disparar "focus" y "blur" para otros tipos de campo
      element.dispatchEvent(new Event("focus", { bubbles: true }));
      element.dispatchEvent(new Event("blur", { bubbles: true }));
    }
  }
};

const simuladorTecleo = async (element, text) => {
  if (element) {
    element.focus();  // Asegura que el campo tenga el foco antes de escribir

    for (const char of text) {
      // Establece el valor parcial y simula los eventos de teclado
      element.value += char;

      // Eventos para emular la escritura
      element.dispatchEvent(new KeyboardEvent("keydown", { key: char, bubbles: true }));
      element.dispatchEvent(new KeyboardEvent("keypress", { key: char, bubbles: true }));
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new KeyboardEvent("keyup", { key: char, bubbles: true }));

      // Esperar un poco entre cada carácter para simular la velocidad de escritura
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Disparar eventos de finalización de escritura
    element.dispatchEvent(new Event("change", { bubbles: true }));
    element.dispatchEvent(new Event("blur", { bubbles: true }));
  }
};

///////////////////////// extraccion e inyección de datos de gestion de incidentes  //////////////////////

// Flag state
let isProcessingForm = false;

async function llenarFormularioAtencionMedica() {
  if (isProcessingForm) return;
  isProcessingForm = true;

  try {
    const text = await navigator.clipboard.readText();
    let datos;
    try {
      datos = JSON.parse(text);
    } catch (e) {
      console.error("El contenido del portapapeles no es un JSON válido.", e);
      alert("El contenido del portapapeles no es un JSON válido.");
      return false;
    }

    console.log("Datos desde portapapeles:", datos);
    return llenarFormularioConDatos(datos);

  } catch (error) {
    if (error.message.includes("Document is not focused") || error.message.includes("Read permission denied")) {
      console.warn("Fallo lectura automática de portapapeles. Solicitando ingreso manual.");
      const manualInput = prompt("No se pudo leer el portapapeles automáticamente (el documento no tenía foco).\n\nPor favor, pega el JSON aquí y presiona Aceptar:");
      if (manualInput) {
        try {
          const datosManual = JSON.parse(manualInput);
          return llenarFormularioConDatos(datosManual);
        } catch (e) {
          alert("El texto pegado no es un JSON válido.");
          return false;
        }
      } else {
        return false;
      }
    }

    console.error('Error al llenar el formulario desde portapapeles:', error);
    alert('Error al leer del portapapeles: ' + error.message);
    return false;
  } finally {
    isProcessingForm = false;
  }
}

// Nueva función extraída para llenar el formulario con el objeto de datos
function llenarFormularioConDatos(datos) {
  try {
    console.log("Procesando datos:", datos);

    // Validar que se proporcionaron datos
    if (!datos || typeof datos !== 'object') {
      throw new Error('Los datos proporcionados no son válidos');
    }

    // Información del incidente
    if (datos.unidad_amb !== undefined) document.getElementById('unidad_amb').value = datos.unidad_amb;
    if (datos.despachador !== undefined) setSelectValue('despachador', datos.despachador);
    if (datos.tipo_caso !== undefined) setSelectValue('tipo_caso', datos.tipo_caso);

    if (datos.informacion_incidente !== undefined) {
      const infoIncidenteElement = document.getElementById('informacion_incidente');
      if (infoIncidenteElement) {
        infoIncidenteElement.value = datos.informacion_incidente;
      }
    }

    if (datos.lugar_atencion !== undefined) {
      setSelectValue('lugar_atencion', datos.lugar_atencion);
      // Mostrar campo "otro" si se seleccionó la opción "Otro" (valor 0)
      if (datos.lugar_atencion === '0' || datos.lugar_atencion === 0) {
        document.getElementById('div_lugar_atencion').style.display = 'block';
        if (datos.lugar_atencion_extra !== undefined) {
          document.getElementById('lugar_atenlugar_atencion_extracion').value = datos.lugar_atencion_extra;
        }
      }
    }

    // Horarios
    const camposHora = [
      'hora_despacho', 'hora_salida', 'llegada_allugar',
      'llegada_alpaciente', 'retiro_escena', 'llegada_centro_medico',
      'retiro_centro_medico', 'llegada_estacion', 'hora_disponible'
    ];
    camposHora.forEach(campo => {
      if (datos[campo] !== undefined) document.getElementById(campo).value = datos[campo];
    });

    // Jornada
    if (datos.jornada !== undefined) {
      const radioJornada = document.querySelector(`input[name="jornada"][value="${datos.jornada}"]`);
      if (radioJornada) {
        radioJornada.click();
        radioJornada.checked = true;
      }
    }

    // Tripulación
    for (let i = 1; i <= 4; i++) {
      const key = `tripulante_${i}`;
      if (datos[key] !== undefined && datos[key] !== "") {
        const normalizeText = (text) => {
          return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        };

        const rawName = datos[key];
        const nameToFind = normalizeText(rawName);
        // Split by whitespace and filter out small words
        const nameTokens = nameToFind.split(/\s+/).filter(t => t.length > 2);

        const selectId = `tripulante_${i}_id`;
        const selectElement = document.getElementById(selectId);

        if (selectElement) {
          let found = false;
          for (let j = 0; j < selectElement.options.length; j++) {
            const rawOption = selectElement.options[j].text;
            const optionText = normalizeText(rawOption);

            // 1. Exact match or inclusion (both ways) - BUT SKIP EMPTY OPTIONS
            let match = false;
            if (optionText.length > 0) {
              match = (optionText === nameToFind || optionText.includes(nameToFind) || nameToFind.includes(optionText));
            }

            // 2. Token match (if not exact)
            if (!match && nameTokens.length > 0) {
              const allTokensPresent = nameTokens.every(token => optionText.includes(token));
              if (allTokensPresent) {
                match = true;
              }
            }

            if (match) {
              selectElement.selectedIndex = j;
              selectElement.dispatchEvent(new Event('change', { bubbles: true }));

              // Inyectar evento para actualizar Select2
              dispatchSelect2Update(selectId, selectElement.options[j].value);

              found = true;
              break;
            }
          }
          if (!found) console.warn(`Tripulante no encontrado en lista: ${rawName}`);
        }
        // Fallback input text
        const inputTripulante = document.getElementById(key);
        if (inputTripulante) inputTripulante.value = datos[key];
      }
    }

    // Manejo paciente
    if (datos.categoria_manejo !== undefined) {
      const radioManejo = document.querySelector(`input[name="manejo_paciente"][value="${datos.categoria_manejo}"]`);
      if (radioManejo) {
        radioManejo.click();
        radioManejo.checked = true;
      }
    }

    // Categoría de salida
    if (datos.categoria_salida !== undefined) {
      const radioCategoria = document.querySelector(`input[name="categoria_salida"][value="${datos.categoria_salida}"]`);
      if (radioCategoria) {
        radioCategoria.click();
        radioCategoria.checked = true;
      }
    }

    // Derivación de paciente e.g. Hospital
    if (datos.traslado_hospital !== undefined) {
      const radioTraslado = document.querySelector(`input[name="traslado_hospital"][value="${datos.traslado_hospital}"]`);
      if (radioTraslado) {
        radioTraslado.checked = true;
        if (datos.traslado_hospital === '1' || datos.traslado_hospital === 1) {
          document.getElementById('traslado_hospital_div').style.display = 'block';
          if (datos.hospital !== undefined) {
            setSelectValue('hospital', datos.hospital);
            if (datos.hospital === '0' || datos.hospital === 0) {
              document.getElementById('traslado_hospital_otro_div').style.display = 'block';
              if (datos.hospital_otro !== undefined) {
                document.getElementById('hospital_otro').value = datos.hospital_otro;
              }
            }
          }
        }
      }
    }

    return true;
  } catch (e) {
    console.error("Error procesando datos:", e);
    alert("Error al procesar datos: " + e.message);
    return false;
  }
}

// Función auxiliar para establecer valores en selects
function setSelectValue(id, value) {
  try {
    const select = document.getElementById(id);
    if (!select) return false;

    // Para selects normales
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].value == value) {
        select.selectedIndex = i;
        // Disparar evento change si es necesario
        const event = new Event('change');
        select.dispatchEvent(event);

        // Inyectar evento para actualizar plugins (Select2 etc.)
        dispatchSelect2Update(id, value);

        return true;
      }
    }

    return false;
  } catch (error) {
    console.error(`Error al establecer valor en select ${id}:`, error);
    return false;
  }
}



// Inicializar script de ayuda en la página (solo si existe el formulario de incidentes)
function initPageScript() {
  const hayFormularioIncidentes = !!(
    document.getElementById('unidad_amb') ||
    document.getElementById('tripulante_1_id') ||
    document.getElementById('informacion_incidente')
  );
  if (!hayFormularioIncidentes) return;

  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('trigger_select2.js');
  script.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
}
// Initialize immediately
initPageScript();

// Helper to dispatch event to page script
function dispatchSelect2Update(elementId, value) {
  document.dispatchEvent(new CustomEvent('ProcessSelect2Update', {
    detail: {
      elementId: elementId,
      value: value
    }
  }));
}


// Escuchar mensajes del popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "llenarFormularioAtencionMedica") {
    console.log("Recibido comando: llenarFormularioAtencionMedica");
    llenarFormularioAtencionMedica();
  }
});
