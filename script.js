// Configuración de servicios por oficina
const serviciosPorOficina = {
  "santo-domingo": ["Apertura de cuenta", "Préstamos personales", "Atención al cliente"],
  "santiago": ["Inversiones", "Gestión de tarjetas", "Consulta de movimientos"],
  "puerto-plata": ["Remesas", "Cambio de divisas", "Servicio al cliente"]
};

// URL de tu Google Apps Script
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzpAjM8IA3UaLCR7eM1a2WcPqBFS3Uv2MGH09wsAeAozNUb1Lnog6giGLvXxDTHRMwU/exec";

// Cargar servicios cuando se selecciona oficina
document.getElementById("oficina").addEventListener("change", function() {
  const oficina = this.value;
  const servicioSelect = document.getElementById("servicio");
  servicioSelect.innerHTML = '<option value="">-- Selecciona un servicio --</option>';
  
  if (serviciosPorOficina[oficina]) {
    serviciosPorOficina[oficina].forEach(servicio => {
      const option = document.createElement("option");
      option.value = servicio;
      option.textContent = servicio;
      servicioSelect.appendChild(option);
    });
  }
});

// Manejar el envío del formulario
document.getElementById("appointmentForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  
  // Validar checkbox de términos
  if (!document.getElementById("terminos").checked) {
    alert("Debes aceptar los términos y condiciones");
    return;
  }

  // Obtener datos del formulario
  const formData = {
    nombre: document.getElementById("nombre").value.trim(),
    cedula: document.getElementById("cedula").value.trim(),
    correo: document.getElementById("correo").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    oficina: document.getElementById("oficina").value,
    servicio: document.getElementById("servicio").value,
    fecha: document.getElementById("fecha").value,
    hora: document.getElementById("hora").value
  };

  // Validar campos obligatorios
  if (!formData.nombre || !formData.cedula || !formData.correo || !formData.telefono || 
      !formData.oficina || !formData.servicio || !formData.fecha || !formData.hora) {
    alert("Por favor complete todos los campos requeridos");
    return;
  }

  // Mostrar carga
  const submitBtn = this.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";

  try {
    // Enviar datos a Google Sheets
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (result.success) {
      // Mostrar confirmación
      mostrarConfirmacion(formData);
      this.reset(); // Limpiar formulario
    } else {
      throw new Error(result.message || "Error al guardar los datos");
    }
  } catch (error) {
    console.error("Error:", error);
    alert(`Error al enviar el formulario: ${error.message}`);
  } finally {
    // Restaurar botón
    submitBtn.disabled = false;
    submitBtn.textContent = "Reservar Cita";
  }
});

// Función para mostrar la confirmación
function mostrarConfirmacion(data) {
  const resultado = document.getElementById("resultado");
  resultado.innerHTML = `
    <h3>¡Cita confirmada!</h3>
    <p>${data.nombre}, tu cita para <strong>${data.servicio}</strong> en la oficina de 
    <strong>${capitalizeFirstLetter(data.oficina.replace("-", " "))}</strong> ha sido programada 
    para el ${formatDate(data.fecha)} a las ${data.hora}.</p>
    <p>Recibirás un correo de confirmación a <strong>${data.correo}</strong>.</p>
    <p class="small">Número de cédula: ${data.cedula}</p>
  `;
  resultado.classList.remove("hidden");
  resultado.scrollIntoView({ behavior: "smooth" });
}

// Funciones de ayuda
function capitalizeFirstLetter(string) {
  return string.split(" ").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ");
}

function formatDate(dateString) {
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("es-ES", options);
}
