// Configuración con tu URL de LocalTunnel
const SERVER_URL = "https://open-parts-sit.loca.lt";

// Función mejorada para enviar citas
async function guardarCita(citaData) {
  try {
    const response = await fetch(`${SERVER_URL}/citas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(citaData)
    });

    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  } catch (error) {
    console.error("Error en guardarCita:", error);
    throw new Error("No se pudo conectar con el servidor. Intenta más tarde.");
  }
}

// Manejo del formulario
document.getElementById("appointmentForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const submitBtn = e.target.querySelector("button[type='submit']");
  const originalText = submitBtn.textContent;
  
  try {
    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";

    const citaData = {
      nombre: document.getElementById("nombre").value.trim(),
      cedula: document.getElementById("cedula").value.trim(),
      correo: document.getElementById("correo").value.trim(),
      telefono: document.getElementById("telefono").value.trim(),
      oficina: document.getElementById("oficina").value,
      servicio: document.getElementById("servicio").value,
      fecha: document.getElementById("fecha").value,
      hora: document.getElementById("hora").value
    };

    const resultado = await guardarCita(citaData);
    mostrarAlerta("✅ Cita registrada en SQL Server", "success");
    e.target.reset();
  } catch (error) {
    mostrarAlerta(`❌ Error: ${error.message}`, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

// Función para mostrar alertas
function mostrarAlerta(mensaje, tipo) {
  const alertaDiv = document.createElement("div");
  alertaDiv.className = `alerta ${tipo}`;
  alertaDiv.textContent = mensaje;
  
  const contenedor = document.getElementById("alerta-container") || document.body;
  contenedor.prepend(alertaDiv);
  
  setTimeout(() => alertaDiv.remove(), 5000);
}
