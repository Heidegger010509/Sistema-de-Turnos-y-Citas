// Configuración de servicios por oficina
const serviciosPorOficina = {
  "santo-domingo": ["Apertura de cuenta", "Préstamos personales", "Atención al cliente"],
  "santiago": ["Inversiones", "Gestión de tarjetas", "Consulta de movimientos"],
  "puerto-plata": ["Remesas", "Cambio de divisas", "Servicio al cliente"]
};

// URL actualizada de tu Google Apps Script
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz1bh0GdN9nk_r8Sg0rLlQV0yEIUmmyO5mV7vinILcJnbEkyxC4zXvNw1jqLxljJx9j/exec";

// Cargar dinámicamente los servicios según la oficina seleccionada
document.getElementById("oficina").addEventListener("change", function() {
  const oficinaSeleccionada = this.value;
  const selectServicio = document.getElementById("servicio");
  
  // Limpiar opciones anteriores
  selectServicio.innerHTML = '<option value="">-- Selecciona un servicio --</option>';
  
  if (oficinaSeleccionada && serviciosPorOficina[oficinaSeleccionada]) {
    serviciosPorOficina[oficinaSeleccionada].forEach(servicio => {
      const opcion = document.createElement("option");
      opcion.value = servicio;
      opcion.textContent = servicio;
      selectServicio.appendChild(opcion);
    });
  }
});

// Manejar el envío del formulario
document.getElementById("appointmentForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  
  // Mostrar estado de carga
  const botonSubmit = this.querySelector("button[type='submit']");
  const textoOriginal = botonSubmit.textContent;
  botonSubmit.disabled = true;
  botonSubmit.innerHTML = '<span class="spinner"></span> Procesando...';

  // Obtener datos del formulario
  const datosFormulario = {
    nombre: document.getElementById("nombre").value.trim(),
    cedula: document.getElementById("cedula").value.trim(),
    correo: document.getElementById("correo").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    oficina: document.getElementById("oficina").value,
    servicio: document.getElementById("servicio").value,
    fecha: document.getElementById("fecha").value,
    hora: document.getElementById("hora").value
  };

  // Validaciones
  if (!document.getElementById("terminos").checked) {
    mostrarError("Debes aceptar los términos y condiciones");
    botonSubmit.disabled = false;
    botonSubmit.textContent = textoOriginal;
    return;
  }

  if (Object.values(datosFormulario).some(campo => !campo && campo !== 'telefono')) {
    mostrarError("Por favor completa todos los campos obligatorios");
    botonSubmit.disabled = false;
    botonSubmit.textContent = textoOriginal;
    return;
  }

  try {
    // Enviar datos al servidor
    const respuesta = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosFormulario)
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok || !resultado.success) {
      throw new Error(resultado.message || "Error en el servidor");
    }

    mostrarConfirmacion(datosFormulario);
    this.reset();
    
  } catch (error) {
    console.error("Error al enviar el formulario:", error);
    mostrarError(`Error al guardar la cita: ${error.message}`);
  } finally {
    botonSubmit.disabled = false;
    botonSubmit.textContent = textoOriginal;
  }
});

// Función para mostrar confirmación
function mostrarConfirmacion(datos) {
  const contenedorResultado = document.getElementById("resultado");
  
  contenedorResultado.innerHTML = `
    <div class="alert success">
      <h3>¡Cita Registrada Exitosamente!</h3>
      <p><strong>${datos.nombre}</strong>, tu cita ha sido agendada:</p>
      <ul class="confirmation-details">
        <li>📌 <strong>Servicio:</strong> ${datos.servicio}</li>
        <li>🏢 <strong>Oficina:</strong> ${formatearNombreOficina(datos.oficina)}</li>
        <li>📅 <strong>Fecha:</strong> ${formatearFecha(datos.fecha)}</li>
        <li>⏰ <strong>Hora:</strong> ${datos.hora}</li>
        <li>📧 <strong>Correo:</strong> ${datos.correo}</li>
      </ul>
      <p class="note">Recibirás un correo de confirmación con los detalles.</p>
    </div>
  `;
  
  contenedorResultado.classList.remove("hidden");
  contenedorResultado.scrollIntoView({ behavior: "smooth" });
}

// Función para mostrar errores
function mostrarError(mensaje) {
  const contenedorResultado = document.getElementById("resultado");
  
  contenedorResultado.innerHTML = `
    <div class="alert error">
      <h3>Error al Procesar la Solicitud</h3>
      <p>${mensaje}</p>
      <p>Por favor intenta nuevamente o contacta al soporte.</p>
    </div>
  `;
  
  contenedorResultado.classList.remove("hidden");
  contenedorResultado.scrollIntoView({ behavior: "smooth" });
}

// Funciones auxiliares de formato
function formatearNombreOficina(nombre) {
  return nombre.split("-")
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");
}

function formatearFecha(fechaString) {
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(fechaString).toLocaleDateString('es-ES', opciones);
}
