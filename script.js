// Configuración inicial
const CONFIG = {
  serviciosPorOficina: {
    "santo-domingo": ["Apertura de cuenta", "Préstamos personales", "Atención al cliente"],
    "santiago": ["Inversiones", "Gestión de tarjetas", "Consulta de movimientos"],
    "puerto-plata": ["Remesas", "Cambio de divisas", "Servicio al cliente"]
  },
  scriptURL: "https://script.google.com/macros/s/AKfycbz1bh0GdN9nk_r8Sg0rLlQV0yEIUmmyO5mV7vinILcJnbEkyxC4zXvNw1jqLxljJx9j/exec",
  corsProxies: [
    "https://cors-anywhere.herokuapp.com/",
    "https://api.codetabs.com/v1/proxy/?quest=",
    "https://thingproxy.freeboard.io/fetch/"
  ]
};

// Elementos del DOM
const DOM = {
  form: document.getElementById("appointmentForm"),
  oficina: document.getElementById("oficina"),
  servicio: document.getElementById("servicio"),
  resultado: document.getElementById("resultado"),
  botonSubmit: document.querySelector("#appointmentForm button[type='submit']")
};

// Inicialización
function init() {
  setupEventListeners();
  testGoogleScriptConnection();
}

// Configurar event listeners
function setupEventListeners() {
  DOM.oficina.addEventListener("change", cargarServicios);
  DOM.form.addEventListener("submit", enviarFormulario);
}

// Cargar servicios según oficina seleccionada
function cargarServicios() {
  const oficina = DOM.oficina.value;
  DOM.servicio.innerHTML = '<option value="">-- Selecciona un servicio --</option>';
  
  if (oficina && CONFIG.serviciosPorOficina[oficina]) {
    CONFIG.serviciosPorOficina[oficina].forEach(servicio => {
      const option = document.createElement("option");
      option.value = servicio;
      option.textContent = servicio;
      DOM.servicio.appendChild(option);
    });
  }
}

// Manejar envío del formulario
async function enviarFormulario(e) {
  e.preventDefault();
  
  const datos = obtenerDatosFormulario();
  
  if (!validarFormulario(datos)) return;
  
  cambiarEstadoBoton(true);
  
  try {
    const resultado = await enviarConReintentos(datos);
    
    if (resultado.success) {
      mostrarConfirmacion(datos);
      DOM.form.reset();
    } else {
      throw new Error(resultado.message || "Error en el servidor");
    }
  } catch (error) {
    mostrarError(`Error al enviar: ${error.message}`);
    console.error("Error completo:", error);
  } finally {
    cambiarEstadoBoton(false);
  }
}

// Obtener datos del formulario
function obtenerDatosFormulario() {
  return {
    nombre: document.getElementById("nombre").value.trim(),
    cedula: document.getElementById("cedula").value.trim(),
    correo: document.getElementById("correo").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    oficina: DOM.oficina.value,
    servicio: DOM.servicio.value,
    fecha: document.getElementById("fecha").value,
    hora: document.getElementById("hora").value,
    origin: window.location.origin
  };
}

// Validar formulario
function validarFormulario(datos) {
  const camposRequeridos = ['nombre', 'cedula', 'correo', 'oficina', 'servicio', 'fecha', 'hora'];
  const faltantes = camposRequeridos.filter(campo => !datos[campo]);

  if (!document.getElementById("terminos").checked) {
    mostrarError("Debes aceptar los términos y condiciones");
    return false;
  }

  if (faltantes.length > 0) {
    mostrarError(`Faltan campos obligatorios: ${faltantes.join(", ")}`);
    return false;
  }

  return true;
}

// Enviar datos con reintentos
async function enviarConReintentos(datos, intento = 0) {
  try {
    const url = intento === 0 ? CONFIG.scriptURL : CONFIG.corsProxies[intento-1] + encodeURIComponent(CONFIG.scriptURL);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest"
      },
      body: JSON.stringify(datos)
    });

    return await response.json();
  } catch (error) {
    if (intento < CONFIG.corsProxies.length) {
      console.warn(`Intento ${intento+1} fallido, probando con proxy...`);
      return enviarConReintentos(datos, intento + 1);
    }
    throw error;
  }
}

// Cambiar estado del botón
function cambiarEstadoBoton(cargando) {
  if (cargando) {
    DOM.botonSubmit.disabled = true;
    DOM.botonSubmit.innerHTML = '<span class="spinner">⏳</span> Enviando...';
  } else {
    DOM.botonSubmit.disabled = false;
    DOM.botonSubmit.textContent = "Reservar Cita";
  }
}

// Mostrar confirmación
function mostrarConfirmacion(datos) {
  DOM.resultado.innerHTML = `
    <div class="alert alert-success">
      <h3>✅ Cita Registrada</h3>
      <p><strong>${datos.nombre}</strong>, tu cita para <strong>${datos.servicio}</strong> en <strong>${formatearOficina(datos.oficina)}</strong> ha sido confirmada.</p>
      <p><strong>Fecha:</strong> ${formatearFecha(datos.fecha)} a las ${datos.hora}</p>
      <p>Se envió un comprobante a <strong>${datos.correo}</strong></p>
    </div>
  `;
  DOM.resultado.classList.remove("hidden");
  DOM.resultado.scrollIntoView({ behavior: "smooth" });
}

// Mostrar error
function mostrarError(mensaje) {
  DOM.resultado.innerHTML = `
    <div class="alert alert-error">
      <h3>❌ Error</h3>
      <p>${mensaje}</p>
      <p>Por favor intenta nuevamente o contacta al soporte.</p>
    </div>
  `;
  DOM.resultado.classList.remove("hidden");
  DOM.resultado.scrollIntoView({ behavior: "smooth" });
}

// Funciones de formato
function formatearOficina(oficina) {
  return oficina.split("-")
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");
}

function formatearFecha(fecha) {
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(fecha).toLocaleDateString('es-ES', opciones);
}

// Probar conexión inicial
async function testGoogleScriptConnection() {
  try {
    const testData = {
      test: true,
      origin: window.location.origin
    };

    const response = await fetch(CONFIG.scriptURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest"
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log("Conexión exitosa con Google Apps Script:", result);
  } catch (error) {
    console.warn("Error en conexión inicial, se usarán proxies CORS:", error);
  }
}

// Iniciar la aplicación
document.addEventListener("DOMContentLoaded", init);
