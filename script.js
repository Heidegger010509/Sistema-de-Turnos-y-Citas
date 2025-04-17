// ================= CONFIGURACIÓN =================
const SERVER_URL = "https://blue-buckets-guess.loca.lt";  // Tu nueva URL de LocalTunnel
const DEBUG_MODE = true;  // Cambia a 'false' en producción

// ================= FUNCIONES PRINCIPALES =================
async function enviarCita(citaData) {
  if (DEBUG_MODE) console.log("[DEBUG] Datos a enviar:", citaData);

  try {
    const response = await fetch(`${SERVER_URL}/citas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(citaData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Error del servidor");
    }

    return await response.json();
  } catch (error) {
    if (DEBUG_MODE) console.error("[DEBUG] Error al enviar:", error);
    throw new Error("No se pudo conectar con el servidor. Intente más tarde.");
  }
}

function manejarFormulario(event) {
  event.preventDefault();
  const form = event.target;
  const boton = form.querySelector("button[type='submit']");
  const textoOriginal = boton.textContent;

  // Datos del formulario
  const datos = {
    nombre: form.nombre.value.trim(),
    cedula: form.cedula.value.trim(),
    correo: form.correo.value.trim(),
    telefono: form.telefono.value.trim(),
    oficina: form.oficina.value,
    servicio: form.servicio.value,
    fecha: form.fecha.value,
    hora: form.hora.value
  };

  // Validación rápida
  if (!datos.nombre || !datos.cedula) {
    mostrarMensaje("⚠️ Nombre y cédula son obligatorios", "warning");
    return;
  }

  // Envío
  boton.disabled = true;
  boton.textContent = "Enviando...";

  enviarCita(datos)
    .then(respuesta => {
      mostrarMensaje("✅ Cita registrada exitosamente", "success");
      form.reset();
    })
    .catch(error => {
      mostrarMensaje(`❌ ${error.message}`, "error");
    })
    .finally(() => {
      boton.disabled = false;
      boton.textContent = textoOriginal;
    });
}

// ================= INTERFAZ DE USUARIO =================
function mostrarMensaje(texto, tipo) {
  // Crea contenedor si no existe
  let contenedor = document.getElementById("mensajes-flotantes");
  if (!contenedor) {
    contenedor = document.createElement("div");
    contenedor.id = "mensajes-flotantes";
    contenedor.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      max-width: 300px;
    `;
    document.body.appendChild(contenedor);
  }

  // Crea mensaje
  const mensaje = document.createElement("div");
  mensaje.className = `mensaje ${tipo}`;
  mensaje.innerHTML = `
    <p>${texto}</p>
    <span class="cerrar">×</span>
  `;
  mensaje.querySelector(".cerrar").onclick = () => mensaje.remove();

  // Estilos dinámicos
  mensaje.style.cssText = `
    padding: 12px 16px;
    margin-bottom: 10px;
    border-radius: 4px;
    color: white;
    animation: fadeIn 0.3s;
    position: relative;
    background: ${tipo === "success" ? "#4CAF50" : 
                tipo === "error" ? "#F44336" : 
                tipo === "warning" ? "#FF9800" : "#2196F3"};
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;

  contenedor.prepend(mensaje);
  setTimeout(() => mensaje.remove(), 5000);
}

// ================= INICIALIZACIÓN =================
document.addEventListener("DOMContentLoaded", () => {
  // Agregar animación CSS
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

  // Configurar formulario
  const formulario = document.getElementById("appointmentForm");
  if (formulario) {
    formulario.addEventListener("submit", manejarFormulario);
    if (DEBUG_MODE) console.log("[DEBUG] Formulario configurado correctamente");
  } else if (DEBUG_MODE) {
    console.warn("[DEBUG] No se encontró el formulario con ID 'appointmentForm'");
  }
});
