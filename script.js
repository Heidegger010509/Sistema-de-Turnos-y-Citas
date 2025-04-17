const nombre = document.getElementById("nombre").value;
const cedula = document.getElementById("cedula").value;
const correo = document.getElementById("correo").value;
const telefono = document.getElementById("telefono").value;
const oficina = document.getElementById("oficina").value;
const servicio = document.getElementById("servicio").value;
const fecha = document.getElementById("fecha").value;
const hora = document.getElementById("hora").value;

fetch("https://salty-bikes-fry.loca.lt/citas", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    nombre,
    cedula: document.getElementById("cedula").value,
    correo,
    telefono: document.getElementById("telefono").value,
    oficina,
    servicio,
    fecha,
    hora
  })
})
.then(res => res.json())
.then(data => {
  console.log("Cita guardada:", data);
})
.catch(err => {
  console.error("Error:", err);
});
