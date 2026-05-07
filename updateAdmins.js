const url = 'https://administracionuser.uy/api/sql';

async function run() {
  const q1 = "USE Ventas_Dev; SELECT id, rol FROM usuarios WHERE CAST(rol as varchar(max)) IN ('admin', 'administrador', 'administracion')";
  const res1 = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json'}, body: JSON.stringify({query: q1}) });
  const data1 = await res1.json();
  console.log("Admins:", data1);

  if (data1.data && data1.data.length > 0) {
    const fullPerms = {
      apps: ['stock', 'ventas'],
      require_location: false,
      stock_tools: {
        "sidebar_inventario": { access: "write", sub: { hub_ingresar: "write", hub_trasladar: "write", hub_solicitudes: "write", hub_retirar: "write", hub_etiquetas: "write", hub_pesos: "write", tab_inventario: "write", tab_historial: "write" } },
        "sidebar_sectores": { access: "write", sub: { op_consumir: "write", op_recibir: "write", op_solicitar: "write" } },
        "sidebar_compras": { access: "write", sub: { ver_compras: "write", crear_compra: "write" } },
        "sidebar_sistema": { access: "write", sub: { gestion_productos: "write", gestion_usuarios: "write", gestion_alertas: "write" } }
      },
      ventas_tools: {
        "clients": { access: "write", sub: { crear_cliente: "write", editar_cliente: "write", exportar_excel: "write" } },
        "interactions": { access: "write", sub: { crear_hilo: "write" } },
        "import": { access: "write", sub: { importar_base: "write" } },
        "dashboard": { access: "write" },
        "visor": { access: "write" },
        "team": { access: "write" },
        "admin": { access: "write" },
        "monitor": { access: "write" }
      }
    };

    const permStr = JSON.stringify(fullPerms).replace(/'/g, "''");

    for (const u of data1.data) {
      const q2 = `USE Ventas_Dev; UPDATE usuarios SET permisos = '${permStr}' WHERE id = '${u.id}'`;
      console.log("Updating", u.id);
      await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json'}, body: JSON.stringify({query: q2}) });
    }
    console.log("All admins updated in the database.");
  }
}

run();
