fetch("https://salty-bikes-fry.loca.lt", {
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
