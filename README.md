# Documentación del Proyecto Ext-SAC-OBS

## 1. Introducción

El proyecto **Ext-SAC-OBS** es una extensión desarrollada para la **Oficina de Bienestar y Salud (OBS)** de la **Universidad de Costa Rica**, en integración con el sistema **Saludaunclick.com (SAC)**. Su objetivo es mejorar la gestión de incidentes, control de ausencias, agenda y otras funciones clave dentro de la OBS.

## 2. Instalación

### Requisitos previos

- Navegador compatible con extensiones (Chrome, Edge, etc.)
- Acceso al sistema **Saludaunclick.com**
- Permisos adecuados dentro de la OBS

### Pasos de instalación

1. Descargar el repositorio desde GitHub.
2. Acceder a `chrome://extensions/` en el navegador.
3. Activar el **modo desarrollador**.
4. Cargar la extensión descomprimida seleccionando la carpeta del proyecto.

## 3. Uso

### Funcionalidades principales

- **Gestión de Incidentes**: Registro y seguimiento de incidentes en la OBS.
- **Control de Ausencias**: Monitoreo de personal ausente.
- **Actualización de Agenda**: Sincronización y actualización de horarios.
- **Extracción de Datos**: Obtención de información relevante desde SAC.
- **Manejo de Etiquetas**: Organización y categorización de registros en la plataforma.
- **Valoraciones y Feedback**: Evaluación de eventos y servicios de la OBS.

### Interfaz de usuario

- **Menú principal**: Acceso a las funciones clave.
- **Popup de la extensión**: Permite interacciones rápidas con la plataforma SAC.
- **Notificaciones y alertas**: Informan sobre eventos críticos en la OBS.

## 4. Estructura de Archivos

```
Ext-SAC-OBS/
│── docs/                      # Documentación del proyecto
│── images/ico/                # Íconos de la extensión
│── sonido/                    # Archivos de audio para alertas
│── manifest.json              # Configuración de la extensión
│── popup.html                 # Interfaz del popup
│── popup.js                   # Lógica del popup
│── injection.js               # Inyección de scripts en SAC
│── scripts/
│   ├── ControlDeAusentes.js   # Gestión de ausencias
│   ├── Etiquetas.js           # Manejo de etiquetas
│   ├── ExtraccionDatos.js     # Extracción de información de SAC
│   ├── RefrescarAgenda.js     # Actualización de la agenda
│   ├── valoraciones.js        # Módulo de evaluaciones y feedback
│── gestionDeIncidentes/
│   ├── gestionDeIncidentes.html  # Interfaz para incidentes
│   ├── gestionDeIncidentes.js    # Lógica de gestión de incidentes
```

## 5. Análisis de Funciones

### **1. ControlDeAusentes.js**
Gestiona la lista de ausencias del personal de OBS. Extrae información desde SAC y la muestra en la extensión.

### **2. Etiquetas.js**
Permite clasificar datos y registros dentro de la plataforma SAC, facilitando la organización y búsqueda de información relevante.

### **3. ExtraccionDatos.js**
Obtiene datos específicos desde SAC, como historial de incidentes, citas programadas o registros médicos, dependiendo de los permisos del usuario.

### **4. RefrescarAgenda.js**
Actualiza automáticamente la agenda de OBS con los cambios registrados en SAC, asegurando que los datos reflejen la información más reciente.

### **5. Valoraciones.js**
Facilita la recopilación de feedback sobre eventos o servicios, permitiendo evaluar la calidad de atención en OBS.

### **6. gestionDeIncidentes.js**
Proporciona herramientas para registrar, actualizar y hacer seguimiento a incidentes dentro de OBS, asegurando un manejo adecuado de emergencias.

## 6. Desarrollo y Contribución

### Requisitos de desarrollo

- Conocimientos en JavaScript, HTML y CSS.
- Familiaridad con la API de extensiones de Chrome.
- Acceso al entorno de pruebas en SAC.

### Configuración del entorno

1. Clonar el repositorio.
2. Instalar dependencias si es necesario.
3. Usar herramientas de depuración en el navegador.

### Guía de contribución

- Realizar cambios en una rama separada.
- Seguir los estándares de codificación definidos.
- Enviar pull requests con descripciones detalladas.

## 7. Integración con SAC

- **Autenticación**: Uso de credenciales para acceder a datos de SAC.
- **Sincronización de datos**: Módulos que interactúan con la API de SAC.
- **Permisos**: Acceso restringido según roles de usuario en OBS.

## 8. Preguntas Frecuentes (FAQ)

**¿Cómo actualizo la extensión?**

- Descarga la última versión y recarga la extensión desde `chrome://extensions/`.

**¿Qué hacer si la extensión no funciona?**

- Verifica los permisos y la conexión con SAC.
- Revisa la consola del navegador para errores.

**¿Cómo reportar un problema?**

- Crear un issue en GitHub con detalles del error y pasos para reproducirlo.

## 9. Contacto y Soporte

Para dudas o soporte técnico, contacta al equipo de la OBS en la **Universidad de Costa Rica** o abre un ticket en el repositorio de GitHub.

