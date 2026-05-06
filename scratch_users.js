const query = "USE Ventas_Dev; SELECT id, nombre_completo FROM usuarios";

fetch('https://administracionuser.uy/api/sql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query })
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(console.error);
