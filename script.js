const serviciosPorOficina = {
  "santo-domingo": ["Apertura de cuenta", "Prestamos personales", "Atencion al cliente"],
  "santiago": ["Inversiones", "Gestion de tarjetas", "Consulta de movimientos"],
  "puerto-plata": ["Remesas", "Cambio de divisas", "Servicio al cliente"]
};

document.getElementById("oficina").addEventListener("change", function () {
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

document.getElementById("appointmentForm").addEventListener("submit", function (e) {
  e.preventDefault();
const nombre = document.getElementById("nombre").value;
const correo = document.getElementById("correo").value;
const oficina = document.getElementById("oficina").value;
const servicio = document.getElementById("servicio").value;
const fecha = document.getElementById("fecha").value;
const hora = document.getElementById("hora").value;

// Simular evento para seguimiento
console.log("Evento: reserva_realizada", 
    {nombre, correo, telefono, oficina, servicio, fecha, hora});
 

const resultado = document.getElementById("resultado");
resultado.innerHTML = 
`<h3>Cita confirmada!</h3>
<p>${nombre}, tu cita para el servicio <strong>${servicio}</strong> en la oficina de 
<strong>${oficina}</strong> ha sido programada para el dia <strong>${fecha}</strong> a 
las <strong>${hora}</strong>.</p>
<p>Te enviaremos un recordatorio a <strong>${correo}</strong>.</p> 
`;
resultado.classList.remove("hidden");

this.reset();                             
});