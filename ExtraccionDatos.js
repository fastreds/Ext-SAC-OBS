// Inicialización de la función para extracción de datos
async function extractIdentificationData() {
  console.log("Función Extracción de datos.");


  // Extraer datos de la sección de expediente
  const container = document.querySelector('.card-body.pt-4');
  if (container) {
    const datosPaciente = extraerDatosDeExpediente(container);
    guardarDatosPaciente(datosPaciente);
  } else {
    console.log("No se encuentra visualizando un expediente");
  }

  // Extraer datos de la agenda
  const popoverContainer = document.querySelector('.popover.my-popover-appointment-options');
  if (popoverContainer) {
    const datosPaciente = extraerDatosDeAgenda(popoverContainer);
    guardarDatosPaciente(datosPaciente);
  } else {
    console.log("No se realizó extracción de datos de la agenda");
  }

  // Exportar datos a Modulab si está disponible
  const modulabForm = document.querySelector('patient-creation-dialog');
  if (modulabForm) {
    exportarDatosAModulab(modulabForm);
  } else {
    console.log("No se encuentra en Modulab");
  }
}

// Función para extraer datos del expediente
function extraerDatosDeExpediente(container) {
  const fullName = container.querySelector('.card-label.font-weight-bold.text-dark-75')?.textContent.trim();
  const nameParts = fullName.split(' ');
  const firstName = nameParts.slice(2).join(' ');
  const lastName = nameParts.slice(0, 2).join(' ').split(" ");
  const identification = container.querySelector('.d-flex.align-items-center.justify-content-between span.text-muted')?.textContent.trim();
  const dobText = container.querySelectorAll('[class="text-muted"]');
  const dateOfBirth = dobText[2].textContent.match(/\d{2}\/\d{2}\/\d{4}/)[0];
  const Sexo = dobText[3].textContent;
  const email = container.querySelector('div.d-flex.align-items-center.justify-content-between:nth-of-type(4) .text-muted')?.textContent.trim();
  const phoneText = container.querySelector('div.d-flex.align-items-center.justify-content-between:nth-of-type(5) .text-muted')?.textContent.trim();
  const phone = phoneText ? phoneText.split(' ') : [];
  const studentCard = container.querySelector('div.d-flex.align-items-center.justify-content-between:nth-of-type(6) .text-muted')?.textContent.trim();

  return {
    firstSurname: firstName,
    secondSurname: lastName[1],
    firstName: lastName[0],
    patientID: identification,
    identityCard: studentCard,
    gender: Sexo,
    birthDate: dateOfBirth,
    phone: phone[0],
    email: email
  };
}

// Función para extraer datos de la agenda
function extraerDatosDeAgenda(popoverContainer) {
  const fullNameMatch = popoverContainer.innerHTML.match(/Nombre\s*:\s*<span[^>]*>(.*?)<\/span>/);
  const fullName = fullNameMatch ? fullNameMatch[1].trim() : null;
  const fullName0 = fullName.split("(")[0].trim();
  const words = fullName0.split(" ");
  const apellidos = words.slice(-2).join(" ").split(" ");
  const fullName2 = words.slice(0, -2).join(" ");
  const idMatch = popoverContainer.innerHTML.match(/Identificación\s*:\s*(\d+)/);
  const id = idMatch ? idMatch[1] : null;
  const studentCardMatch = popoverContainer.innerHTML.match(/Carné estudiantil:\s*([A-Za-z0-9]+)/);
  const studentCard = studentCardMatch ? studentCardMatch[1] : null;
  const dobMatch = popoverContainer.innerHTML.match(/F. Nacimiento\s*:\s*(\d{2}\/\d{2}\/\d{4})/);
  const dobitrhday = dobMatch ? dobMatch[1] : null;
  const emailMatch = popoverContainer.innerHTML.match(/Email\s*:\s*([\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/);
  const email = emailMatch ? emailMatch[1] : null;
  const phoneMatch = popoverContainer.innerHTML.match(/Teléfono Celular\s*:\s*(\d+)/);
  const phone = phoneMatch ? phoneMatch[1] : null;

  return {
    firstSurname: fullName2,
    secondSurname: apellidos[1],
    firstName: apellidos[0],
    patientID: id,
    identityCard: studentCard,
    birthDate: dobitrhday,
    phone: phone,
    email: email
  };
}

// Función para guardar los datos en chrome.storage
function guardarDatosPaciente(datosPaciente) {
  chrome.storage.local.get("AAE_EXT_SAC", (result) => {
    const AAE_EXT_SAC = result.AAE_EXT_SAC || { ExtracDatos: { infoCliente: [] } };
    AAE_EXT_SAC.ExtracDatos.infoCliente = []; //limpiamos el contenido previo
    AAE_EXT_SAC.ExtracDatos.infoCliente.push(datosPaciente);
    chrome.storage.local.set({ AAE_EXT_SAC }, () => {
      console.log('Datos guardados en infoCliente:', datosPaciente);
    });
  });
}

// Función para exportar datos a Modulab
function exportarDatosAModulab(modulabForm) {
  chrome.storage.local.get("AAE_EXT_SAC", (result) => {
    if (result.AAE_EXT_SAC && result.AAE_EXT_SAC.ExtracDatos && Array.isArray(result.AAE_EXT_SAC.ExtracDatos.infoCliente)) {
      const data = result.AAE_EXT_SAC.ExtracDatos.infoCliente[0];
      if (data) {


        document.getElementById("FirstSurname").value = data.firstName || "";

        setValueAndTriggerEvent(document.getElementById("FirstSurname"), data.firstName);
        setValueAndTriggerEvent(document.getElementById("SecondSurname"), data.secondSurname);
        setValueAndTriggerEvent(document.querySelector('input[name="PatientName"]'), data.firstSurname);
        setValueAndTriggerEvent(document.getElementById("NSSField"), data.identityCard);
        setValueAndTriggerEvent(document.getElementById("ExtIDField"), data.patientID);
        setValueAndTriggerEvent(document.getElementById("NTSField"), data.ntNumber);
        setValueAndTriggerEvent(document.getElementById("DNIField"), data.dni);

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

async function llenarFormularioAtencionMedica() {


  chrome.storage.local.get("AAE_EXT_SAC", (result) => {
    if (result.AAE_EXT_SAC && result.AAE_EXT_SAC.GestionIncidentes && Array.isArray(result.AAE_EXT_SAC.GestionIncidentes.infoIncidente)) {
      const datos = result.AAE_EXT_SAC.GestionIncidentes.infoIncidente[0];

      console.log("copia datos al form de incidentes" + datos);



  try {



    // Validar que se proporcionaron datos
    if (!datos || typeof datos !== 'object') {
      throw new Error('Los datos proporcionados no son válidos');
    }

    // Información del incidente
    if (datos.unidad_amb !== undefined) {
      document.getElementById('unidad_amb').value = datos.unidad_amb;
    }

    if (datos.despachador !== undefined) {
      setSelectValue('despachador', datos.despachador);
    }

    if (datos.tipo_caso !== undefined) {
      setSelectValue('tipo_caso', datos.tipo_caso);
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
      if (datos[campo] !== undefined) {
        document.getElementById(campo).value = datos[campo];
      }
    });

    // Jornada
    if (datos.jornada !== undefined) {
      const radioJornada = document.querySelector(`input[name="jornada"][value="${datos.jornada}"]`);
      if (radioJornada) {
        radioJornada.checked = true;
      }
    }

    // Tripulación
    for (let i = 1; i <= 4; i++) {
      const campo = `tripulante_${i}_id`;
      if (datos[campo] !== undefined) {
        setSelectValue(campo, datos[campo]);
        document.getElementById(`tripulante_${i}`).value = datos[campo];

      }
    }

    


    // Manejo paciente
    if (datos.manejo_paciente !== undefined) {
      const radioManejo = document.querySelector(`input[name="manejo_paciente"][value="${datos.manejo_paciente}"]`);
      if (radioManejo) {
        radioManejo.checked = true;
      }
    }

    // Categoría de salida
    if (datos.categoria_salida !== undefined) {
      const radioCategoria = document.querySelector(`input[name="categoria_salida"][value="${datos.categoria_salida}"]`);
      if (radioCategoria) {
        radioCategoria.checked = true;
      }
    }

    // Derivación de paciente
    if (datos.traslado_hospital !== undefined) {
      const radioTraslado = document.querySelector(`input[name="traslado_hospital"][value="${datos.traslado_hospital}"]`);
      if (radioTraslado) {
        radioTraslado.checked = true;

        // Mostrar campos relacionados si es necesario
        if (datos.traslado_hospital === '1' || datos.traslado_hospital === 1) {
          document.getElementById('traslado_hospital_div').style.display = 'block';

          if (datos.hospital !== undefined) {
            setSelectValue('hospital', datos.hospital);

            // Mostrar campo "otro" si se seleccionó la opción "Otro"
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

    // Acciones de atención
    if (datos.accion_atencion && Array.isArray(datos.accion_atencion)) {
      datos.accion_atencion.forEach(valor => {
        const checkbox = document.querySelector(`input[name="accion_atencion[]"][value="${valor}"]`);
        if (checkbox) {
          checkbox.checked = true;
        }
      });
    }

    // Equipo dejado en hospital
    if (datos.equipo_dejado !== undefined) {
      document.getElementById('equipo_dejado').value = datos.equipo_dejado;
    }

    // Responsables
    if (datos.contacto_medico !== undefined) {
      document.getElementById('contacto_medico').value = datos.contacto_medico;
    }

    if (datos.profesional_reponsable_deriva !== undefined) {
      document.getElementById('profesional_reponsable_deriva').value = datos.profesional_reponsable_deriva;
    }

    return true;

    
  } catch (error) {
    console.error('Error al llenar el formulario:', error.message);
    return false;
  }


}
});


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
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error(`Error al establecer valor en select ${id}:`, error);
    return false;
  }


}

