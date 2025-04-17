// Configuración de servicios por oficina
const serviciosPorOficina = {
  "santo-domingo": ["Apertura de cuenta", "Préstamos personales", "Atención al cliente"],
  "santiago": ["Inversiones", "Gestión de tarjetas", "Consulta de movimientos"],
  "puerto-plata": ["Remesas", "Cambio de divisas", "Servicio al cliente"]
};

// URL de Google Apps Script con proxy CORS como respaldo
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz1bh0GdN9nk_r8Sg0rLlQV0yEIUmmyO5mV7vinILcJnbEkyxC4zXvNw1jqLxljJx9j/exec";
const CORS_PROXY = "https://corsproxy.io/?"; // Proxy alternativo

// Cargar servicios según oficina seleccionada
document.getElementById("oficina").addEventListener("change", function() {
  const oficina = this.value;
  const servicioSelect = document.getElementById("servicio");
  servicioSelect.innerHTML = '<option value="">-- Selecciona un servicio --</option>';
  
  if (oficina && serviciosPorOficina[oficina]) {
    serviciosPorOficina[oficina].forEach(servicio => {
      const option = document.createElement("option");
      option.value = servicio;
      option.textContent = servicio;
      servicioSelect.appendChild(option);
    });
  }
});

// Manejar envío del formulario
document.getElementById("appointmentForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  
  const boton = this.querySelector("button[type='submit']");
  const textoOriginal = boton.innerHTML;
  boton.disabled = true;
  boton.innerHTML = '<span class="spinner">⌛</span> Enviando...';

  const formData = {
    nombre: document.getElementById("nombre").value.trim(),
    cedula: document.getElementById("cedula").value.trim(),
    correo: document.getElementById("correo").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    oficina: document.getElementById("oficina").value,
    servicio: document.getElementById("servicio").value,
    fecha: document.getElementById("fecha").value,
    hora: document.getElementById("hora").value,
    origin: window.location.origin // Necesario para CORS
  };

  // Validaciones
  if (!validarFormulario(formData)) {
    boton.disabled = false;
    boton.innerHTML = textoOriginal;
    return;
  }

  try {
    // Intentar primero sin proxy
    await enviarDatos(GOOGLE_SCRIPT_URL, formData);
    
    mostrarConfirmacion(formData);
    this.reset();
  } catch (error) {
    console.error("Error directo, intentando con proxy:", error);
    
    try {
      // Segundo intento con proxy CORS
      await enviarDatos(CORS_PROXY + encodeURIComponent(GOOGLE_SCRIPT_URL), formData);
      
      mostrarConfirmacion(formData);
      this.reset();
    } catch (proxyError) {
      console.error("Error con proxy:", proxyError);
      mostrarError(`
        No se pudo conectar con el servidor. 
        <br>Por favor intenta nuevamente más tarde.
        <br><small>Error: ${proxyError.message}</small>
      `);
    }
  } finally {
    boton.disabled = false;
    boton.innerHTML = textoOriginal;
  }
});

// Función para enviar datos
async function enviarDatos(url, data) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Error en el servidor");
  }

  return result;
}

// Validación de formulario
function validarFormulario(data) {
  if (!document.getElementById("terminos").checked) {
    mostrarError("Debes aceptar los términos y condiciones");
    return false;
  }

  const camposRequeridos = ['nombre', 'cedula', 'correo', 'oficina', 'servicio', 'fecha', 'hora'];
  const faltantes = camposRequeridos.filter(campo => !data[campo]);

  if (faltantes.length > 0) {
    mostrarError(`Faltan campos requeridos: ${faltantes.join(", ")}`);
    return false;
  }

  return true;
}

// Mostrar confirmación
function mostrarConfirmacion(data) {
  const resultado = document.getElementById("resultado");
  resultado.innerHTML = `
    <div class="success-message">
      <h3>✅ Cita Registrada Exitosamente</h3>
      <p><strong>${data.nombre}</strong>, tu cita ha sido agendada:</p>
      <ul>
        <li><strong>Servicio:</strong> ${data.servicio}</li>
        <li><strong>Oficina:</strong> ${formatOffice(data.oficina)}</li>
        <li><strong>Fecha:</strong> ${formatDate(data.fecha)}</li>
        <li><strong>Hora:</strong> ${data.hora}</li>
      </ul>
      <p>Se envió un comprobante a <strong>${data.correo}</strong></p>
    </div>
  `;
  resultado.classList.remove("hidden");
  resultado.scrollIntoView({ behavior: "smooth" });
}

// Mostrar errores
function mostrarError(mensaje) {
  const resultado = document.getElementById("resultado");
  resultado.innerHTML = `
    <div class="error-message">
      <h3>❌ Error al Procesar</h3>
      <p>${mensaje}</p>
    </div>
  `;
  resultado.classList.remove("hidden");
  resultado.scrollIntoView({ behavior: "smooth" });
}

// Funciones de formato
function formatOffice(office) {
  return office.split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(dateString) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Prueba inicial de conexión (opcional)
async function testConnection() {
  try {
    const testUrl = `${GOOGLE_SCRIPT_URL}?test=true`;
    await fetch(testUrl, { method: 'HEAD' });
    console.log("Conexión directa funciona");
  } catch {
    console.warn("Usando proxy CORS como respaldo");
  }
}

testConnection();
