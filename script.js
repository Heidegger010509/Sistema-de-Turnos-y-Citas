// Configuración de servicios por oficina
const serviciosPorOficina = {
  "santo-domingo": ["Apertura de cuenta", "Préstamos personales", "Atención al cliente"],
  "santiago": ["Inversiones", "Gestión de tarjetas", "Consulta de movimientos"],
  "puerto-plata": ["Remesas", "Cambio de divisas", "Servicio al cliente"]
};

// URL de tu Google Apps Script (¡ya incluida tu URL!)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzpAjM8IA3UaLCR7eM1a2WcPqBFS3Uv2MGH09wsAeAozNUb1Lnog6giGLvXxDTHRMwU/exec";

// Cargar servicios cuando se selecciona una oficina
document.getElementById("oficina").addEventListener("change", function() {
  const oficina = this.value;
  const servicioSelect = document.getElementById("servicio");
  
  // Resetear opciones
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

// Manejar el envío del formulario
document.getElementById("appointmentForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  
  // Validar términos y condiciones
  if (!document.getElementById("terminos").checked) {
    alert("Debes aceptar los términos y condiciones.");
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

  // Validar campos vacíos
  if (Object.values(formData).some(field => !field)) {
    alert("Por favor completa todos los campos.");
    return;
  }

  // Deshabilitar botón para evitar múltiples envíos
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
      mostrarConfirmacion(formData);
      this.reset(); // Limpiar formulario
    } else {
      throw new Error(result.message || "Error al guardar los datos.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert(`Error al enviar: ${error.message}`);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Reservar Cita";
  }
});

// Mostrar mensaje de confirmación
function mostrarConfirmacion(data) {
  const resultado = document.getElementById("resultado");
  resultado.innerHTML = `
    <h3>¡Cita registrada con éxito!</h3>
    <p><strong>${data.nombre}</strong>, tu cita para <strong>${data.servicio}</strong> en <strong>${formatOfficeName(data.oficina)}</strong> ha sido agendada.</p>
    <p>📅 <strong>Fecha:</strong> ${formatDate(data.fecha)}</p>
    <p>⏰ <strong>Hora:</strong> ${data.hora}</p>
    <p>📧 <strong>Correo:</strong> ${data.correo}</p>
    <p class="note">Recibirás un correo de confirmación.</p>
  `;
  resultado.classList.remove("hidden");
  resultado.scrollIntoView({ behavior: "smooth" });
}

// Formatear nombre de oficina (ej: "santo-domingo" → "Santo Domingo")
function formatOfficeName(office) {
  return office.split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Formatear fecha (ej: "2023-12-25" → "25/12/2023")
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", { 
    day: "2-digit", 
    month: "2-digit", 
    year: "numeric" 
  });
}
