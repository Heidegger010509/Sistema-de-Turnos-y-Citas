// Configuración
const SCRIPT_ID = "AKfycbwXYdDxuQkAiGWGZdGiJ4FJ2ewr0domhO1reZxcULI";
const PROXY_URL = "https://cors-anywhere.herokuapp.com/";
const SCRIPT_URL = `${PROXY_URL}https://script.google.com/macros/s/${SCRIPT_ID}/exec`;

// Función mejorada para enviar datos
async function sendData(data) {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "Origin": "https://heidegger010509.github.io"
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    return await response.json();
  } catch (error) {
    console.error("Error sending data:", error);
    throw error;
  }
}

// Manejo del formulario
document.getElementById("appointmentForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const submitBtn = e.target.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";
  
  const formData = {
    nombre: document.getElementById("nombre").value.trim(),
    cedula: document.getElementById("cedula").value.trim(),
    correo: document.getElementById("correo").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    oficina: document.getElementById("oficina").value,
    servicio: document.getElementById("servicio").value,
    fecha: document.getElementById("fecha").value,
    hora: document.getElementById("hora").value,
    origin: window.location.origin
  };

  try {
    const result = await sendData(formData);
    
    if (result.success) {
      mostrarMensajeExito(result.message);
      e.target.reset();
    } else {
      throw new Error(result.message || "Error del servidor");
    }
  } catch (error) {
    mostrarError(error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Reservar Cita";
  }
});

// Funciones auxiliares
function mostrarMensajeExito(mensaje) {
  const resultado = document.getElementById("resultado");
  resultado.innerHTML = `
    <div class="alert success">
      <h3>✅ Éxito</h3>
      <p>${mensaje}</p>
    </div>
  `;
  resultado.classList.remove("hidden");
}

function mostrarError(mensaje) {
  const resultado = document.getElementById("resultado");
  resultado.innerHTML = `
    <div class="alert error">
      <h3>❌ Error</h3>
      <p>${mensaje}</p>
      <p>Intenta nuevamente o contacta al soporte.</p>
    </div>
  `;
  resultado.classList.remove("hidden");
}
