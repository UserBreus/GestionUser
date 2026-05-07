const url = 'https://administracionuser.uy/api/sql';

async function run() {
  const q1 = "USE Ventas_Dev; SELECT id, rol FROM usuarios WHERE rol IN ('admin', 'administrador', 'administracion')";
  const res1 = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json'}, body: JSON.stringify({query: q1}) });
  const data1 = await res1.json();
  console.log("Raw response:", data1);
}
run();
