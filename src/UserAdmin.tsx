import { useState, useEffect } from 'react';
import { executeAWSQuery } from './lib/aws-client';
import { Users, X, Save, Edit2, Shield, Plus, ToggleLeft, ToggleRight, Loader2, ChevronDown, ChevronRight } from 'lucide-react';

interface User {
  id: string;
  nombre_completo: string;
  pass: string;
  rol: string;
  cedula: string | null;
  avatar: string | null;
  permisos: string | null;
}

const STOCK_TOOLS = [
  { 
    id: 'sidebar_dashboard', 
    name: '🖥️ Panel de Control',
    subTools: [] 
  },
  { 
    id: 'sidebar_inventario', 
    name: '🌍 Inventario Global (Gerencial)',
    subTools: [
      { id: 'hub_ingresar', name: 'Botón: Ingresar Stock' },
      { id: 'hub_trasladar', name: 'Botón: Trasladar' },
      { id: 'hub_solicitudes', name: 'Botón: Órdenes Solicitadas' },
      { id: 'hub_retirar', name: 'Botón: Retirar Stock' },
      { id: 'hub_etiquetas', name: 'Botón: Generar Etiqueta' },
      { id: 'hub_pesos', name: 'Botón: Registro de Peso' },
      { id: 'tab_inventario', name: 'Pestaña: Inventario (Patrimonio)' },
      { id: 'tab_historial', name: 'Pestaña: Historial Remitos' }
    ]
  },
  { 
    id: 'sidebar_sectores', 
    name: '📦 Mi Sector (Operativo)',
    subTools: [
      { id: 'op_consumir', name: 'Botón: Consumir Lote Físico' },
      { id: 'op_recibir', name: 'Pestaña: Controlar y Recibir Remitos' },
      { id: 'op_solicitar', name: 'Pestaña: Pedir Insumos a Central' }
    ]
  },
  { 
    id: 'sidebar_compras', 
    name: '🚚 Compras e Ingresos',
    subTools: [
      { id: 'ver_compras', name: 'Ver Órdenes de Compra' },
      { id: 'crear_compra', name: 'Crear Nueva Orden' }
    ]
  },
  { 
    id: 'sidebar_sistema', 
    name: '⚙️ Gestión de Sistema',
    subTools: [
      { id: 'gestion_productos', name: 'ABM de Productos' },
      { id: 'gestion_usuarios', name: 'ABM de Usuarios' },
      { id: 'gestion_alertas', name: 'Configurar Alertas' }
    ]
  },
];

const VENTAS_TOOLS = [
  { 
    id: 'dashboard', 
    name: '📊 Panel General (Ventas)',
    subTools: []
  },
  { 
    id: 'clients', 
    name: '👥 Cartera de Clientes',
    subTools: [
      { id: 'crear_cliente', name: 'Botón: Nuevo Cliente' },
      { id: 'editar_cliente', name: 'Botón: Editar Cliente' },
      { id: 'exportar_excel', name: 'Botón: Exportar a Excel' }
    ]
  },
  { 
    id: 'interactions', 
    name: '💬 Seguimiento / Hilos',
    subTools: [
      { id: 'crear_hilo', name: 'Iniciar Hilo de Seguimiento' }
    ]
  },
  { 
    id: 'visor', 
    name: '👀 Visor Local',
    subTools: []
  },
  { 
    id: 'import', 
    name: '📁 Directorio Global (Base)',
    subTools: [
      { id: 'importar_base', name: 'Botón: Importar Clientes' }
    ]
  },
  { 
    id: 'team', 
    name: '🏆 Ranking de Equipo',
    subTools: []
  },
  { 
    id: 'admin', 
    name: '⚙️ Panel de Control (Admin)',
    subTools: []
  },
  { 
    id: 'monitor', 
    name: '🌐 Monitor de Red',
    subTools: []
  }
];

type AccessLevel = 'none' | 'read' | 'write';

interface ToolPermission {
  access: AccessLevel;
  sub: Record<string, AccessLevel>;
}

export default function UserAdmin({ onBack }: { onBack: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formId, setFormId] = useState('');
  const [formOriginalId, setFormOriginalId] = useState('');
  const [formNombre, setFormNombre] = useState('');
  const [formPass, setFormPass] = useState('');
  const [formRol, setFormRol] = useState('vendedor');
  const [formCedula, setFormCedula] = useState('');
  const [formAvatar, setFormAvatar] = useState('');
  
  // Permissions State
  const [hasStock, setHasStock] = useState(false);
  const [hasVentas, setHasVentas] = useState(false);
  const [requireLocation, setRequireLocation] = useState(true);
  const [isActive, setIsActive] = useState(true);
  
  const [stockTools, setStockTools] = useState<Record<string, ToolPermission>>({});
  const [ventasTools, setVentasTools] = useState<Record<string, ToolPermission>>({});

  // UI State for accordions
  const [expandedTools, setExpandedTools] = useState<string[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await executeAWSQuery('SELECT id, nombre_completo, pass, rol, cedula, avatar, permisos FROM usuarios');
      setUsers(data || []);
    } catch (err: any) {
      setError('Error al cargar usuarios: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const parseToolObj = (t: any): Record<string, ToolPermission> => {
    if (!t) return {};
    const obj: Record<string, ToolPermission> = {};
    
    // Legacy support (array)
    if (Array.isArray(t)) {
      t.forEach(k => {
        obj[k] = { access: 'write', sub: {} };
      });
      return obj;
    }

    // Object format support
    Object.keys(t).forEach(k => {
      const val = t[k];
      if (typeof val === 'string') {
        // v3 format: "inventario": "write"
        obj[k] = { access: val as AccessLevel, sub: {} };
      } else if (typeof val === 'object') {
        // v4 format: "inventario": { access: "write", sub: { ... } }
        obj[k] = {
          access: val.access || 'none',
          sub: val.sub || {}
        };
      }
    });

    return obj;
  };

  const handleEdit = (u: User) => {
    setEditingUser(u);
    setIsNewUser(false);
    setFormOriginalId(u.id);
    setFormId(u.id);
    setFormNombre(u.nombre_completo || '');
    setFormPass(u.pass || '');
    setFormRol(u.rol || 'vendedor');
    setFormCedula(u.cedula || '');
    setFormAvatar(u.avatar || '');

    setHasStock(false);
    setHasVentas(false);
    setRequireLocation(true);
    setIsActive(true);
    setStockTools({});
    setVentasTools({});
    setExpandedTools([]);

    if (u.permisos) {
      try {
        const p = JSON.parse(u.permisos);
        if (p.apps) {
          setHasStock(p.apps.includes('stock'));
          setHasVentas(p.apps.includes('ventas'));
        }
        if (p.require_location !== undefined) {
          setRequireLocation(p.require_location);
        }
        if (p.active !== undefined) {
          setIsActive(p.active);
        } else {
          setIsActive(true);
        }
        if (p.stock_tools) setStockTools(parseToolObj(p.stock_tools));
        if (p.ventas_tools) setVentasTools(parseToolObj(p.ventas_tools));

      } catch(e) {
        console.error("Error parsing user permissions", e);
      }
    }
  };

  const handleCreate = () => {
    setIsNewUser(true);
    setEditingUser({ id: '', nombre_completo: '', pass: '', rol: 'vendedor', cedula: null, avatar: null, permisos: null });
    setFormId('');
    setFormOriginalId('');
    setFormNombre('');
    setFormPass('');
    setFormRol('vendedor');
    setFormCedula('');
    setFormAvatar('');
    setHasStock(false);
    setHasVentas(false);
    setRequireLocation(true);
    setIsActive(true);
    setStockTools({});
    setVentasTools({});
    setExpandedTools([]);
  };

  const handleSave = async () => {
    if (!formId || !formNombre || !formPass) {
      alert("Por favor completa ID, Nombre y Contraseña");
      return;
    }

    setSaving(true);
    
    const apps = [];
    if (hasStock) apps.push('stock');
    if (hasVentas) apps.push('ventas');

    const permisosJson = JSON.stringify({
      version: 4,
      active: isActive,
      apps,
      require_location: requireLocation,
      stock_tools: stockTools,
      ventas_tools: ventasTools
    });

    try {
      if (isNewUser) {
        await executeAWSQuery(`
          INSERT INTO usuarios (id, nombre_completo, pass, rol, cedula, avatar, permisos) 
          VALUES ('${formId}', '${formNombre}', '${formPass}', '${formRol}', '${formCedula}', '${formAvatar}', '${permisosJson}')
        `);
      } else {
        await executeAWSQuery(`
          UPDATE usuarios 
          SET id = '${formId}', 
              nombre_completo = '${formNombre}', 
              pass = '${formPass}', 
              rol = '${formRol}', 
              cedula = '${formCedula}',
              avatar = '${formAvatar}',
              permisos = '${permisosJson}' 
          WHERE id = '${formOriginalId}'
        `);
      }
      await loadUsers();
      setEditingUser(null);
    } catch (err: any) {
      alert("Error al guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!formOriginalId) return;
    const confirmDelete = window.confirm(`¿Estás completamente seguro de eliminar al usuario ${formOriginalId}? Esta acción NO se puede deshacer.`);
    if (!confirmDelete) return;

    setSaving(true);
    try {
      await executeAWSQuery(`DELETE FROM usuarios WHERE id = '${formOriginalId}'`);
      await loadUsers();
      setEditingUser(null);
    } catch (err: any) {
      alert("Error al eliminar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleExpand = (toolId: string) => {
    setExpandedTools(prev => prev.includes(toolId) ? prev.filter(t => t !== toolId) : [...prev, toolId]);
  };

  const renderToolEditor = (
    tool: any, 
    toolState: Record<string, ToolPermission>, 
    setToolState: React.Dispatch<React.SetStateAction<Record<string, ToolPermission>>>
  ) => {
    const perm = toolState[tool.id] || { access: 'none', sub: {} };
    const isExpanded = expandedTools.includes(tool.id);
    const hasSub = tool.subTools && tool.subTools.length > 0;

    return (
      <div key={tool.id} className="bg-black/40 rounded-lg border border-slate-800 overflow-hidden">
        {/* Main Tool Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-b border-transparent">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            {hasSub ? (
              <button 
                onClick={() => toggleExpand(tool.id)}
                className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <div className="w-6" /> // spacer
            )}
            <span className="text-sm text-slate-300 font-medium">{tool.name}</span>
          </div>
          
          <select 
            value={perm.access} 
            onChange={e => {
              const val = e.target.value as AccessLevel;
              setToolState(prev => ({
                ...prev,
                [tool.id]: { ...perm, access: val }
              }));
            }}
            className="bg-nexus-dark border border-nexus-border rounded-lg px-3 py-1 text-xs focus:border-nexus-primary outline-none text-slate-200 ml-8 sm:ml-0"
          >
            <option value="none">🚫 Bloqueado (Oculto)</option>
            <option value="read">👁️ Solo Visión (Lectura)</option>
            <option value="write">✅ Acceso Total (Entrar y Usar)</option>
          </select>
        </div>

        {/* Sub Tools Panel */}
        {hasSub && isExpanded && (
          <div className="bg-black/60 p-3 pl-12 border-t border-slate-800 space-y-3">
            <p className="text-xs text-slate-500 mb-2">Visibilidad de Campos y Botones Internos:</p>
            {tool.subTools.map((sub: any) => {
              const subAccess = perm.sub[sub.id] || 'none';
              return (
                <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/50 pb-2 last:border-0 last:pb-0">
                  <span className="text-xs text-slate-300 mb-1 sm:mb-0">{sub.name}</span>
                  <select 
                    value={subAccess} 
                    onChange={e => {
                      const val = e.target.value as AccessLevel;
                      setToolState(prev => ({
                        ...prev,
                        [tool.id]: {
                          ...perm,
                          sub: {
                            ...perm.sub,
                            [sub.id]: val
                          }
                        }
                      }));
                    }}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs focus:border-nexus-primary outline-none text-slate-300 min-w-[160px]"
                  >
                    <option value="none">🚫 Ocultar botón/campo</option>
                    <option value="read">👁️ Solo ver (Deshabilitado)</option>
                    <option value="write">✅ Visible y Habilitado</option>
                  </select>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in text-white p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 glass-panel p-6 rounded-2xl">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-nexus-primary/20 rounded-xl text-nexus-primary">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
            <p className="text-slate-400 text-sm">Control de accesos, permisos granulares y sub-herramientas</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleCreate}
            className="flex items-center px-4 py-2 bg-nexus-primary hover:bg-nexus-primaryHover text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </button>
          <button 
            onClick={onBack}
            className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
          >
            Volver
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-nexus-primary" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 text-center">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* USER LIST */}
          <div className="lg:col-span-1 glass-panel rounded-2xl overflow-hidden flex flex-col max-h-[850px]">
            <div className="p-4 border-b border-nexus-border/50 bg-nexus-darker/50 flex justify-between items-center">
              <h2 className="font-semibold text-slate-200">Directorio</h2>
              <span className="text-xs bg-nexus-primary/20 text-nexus-primary px-2 py-1 rounded-full">{users.length}</span>
            </div>
            <div className="overflow-y-auto p-2 flex-1 space-y-1 custom-scrollbar">
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleEdit(u)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${editingUser?.id === u.id ? 'bg-nexus-primary/20 border border-nexus-primary/30' : 'hover:bg-white/5 border border-transparent'}`}
                >
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium text-slate-200">{u.nombre_completo || u.id}</span>
                    <span className="text-xs text-slate-400">@{u.id} • {u.rol}</span>
                  </div>
                  <Edit2 className="w-4 h-4 text-slate-500" />
                </button>
              ))}
            </div>
          </div>

          {/* EDIT FORM */}
          {editingUser ? (
            <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-nexus-border/50 bg-nexus-darker/50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-nexus-accent" />
                  {isNewUser ? 'Crear Nuevo Usuario' : `Editando: ${editingUser.id}`}
                </h2>
                <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8 max-h-[700px]">
                
                {/* Datos Básicos */}
                <section>
                  <h3 className="text-sm font-bold text-nexus-primary uppercase tracking-wider mb-4 border-b border-nexus-border/50 pb-2">Todos los Datos (Tabla Usuarios)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">ID (Username) *</label>
                      <input 
                        type="text" 
                        value={formId} 
                        onChange={e => setFormId(e.target.value)}
                        className="w-full bg-nexus-dark border border-nexus-border rounded-lg px-3 py-2 text-sm focus:border-nexus-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Nombre Completo *</label>
                      <input 
                        type="text" 
                        value={formNombre} 
                        onChange={e => setFormNombre(e.target.value)}
                        className="w-full bg-nexus-dark border border-nexus-border rounded-lg px-3 py-2 text-sm focus:border-nexus-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Contraseña *</label>
                      <input 
                        type="text" 
                        value={formPass} 
                        onChange={e => setFormPass(e.target.value)}
                        className="w-full bg-nexus-dark border border-nexus-border rounded-lg px-3 py-2 text-sm focus:border-nexus-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Rol Global *</label>
                      <input 
                        type="text"
                        list="roles-list"
                        value={formRol} 
                        onChange={e => setFormRol(e.target.value)}
                        placeholder="Ej. vendedor, admin, nuevo_rol..."
                        className="w-full bg-nexus-dark border border-nexus-border rounded-lg px-3 py-2 text-sm focus:border-nexus-primary outline-none"
                      />
                      <datalist id="roles-list">
                        {Array.from(new Set(users.map(u => u.rol).filter(Boolean))).map(r => (
                          <option key={r} value={r} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Cédula</label>
                      <input 
                        type="text" 
                        value={formCedula} 
                        onChange={e => setFormCedula(e.target.value)}
                        className="w-full bg-nexus-dark border border-nexus-border rounded-lg px-3 py-2 text-sm focus:border-nexus-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">URL Avatar (Opcional)</label>
                      <input 
                        type="text" 
                        value={formAvatar} 
                        onChange={e => setFormAvatar(e.target.value)}
                        className="w-full bg-nexus-dark border border-nexus-border rounded-lg px-3 py-2 text-sm focus:border-nexus-primary outline-none"
                      />
                    </div>
                  </div>
                </section>

                {/* Acceso a Módulos y Toggles globales */}
                <section>
                  <h3 className="text-sm font-bold text-nexus-primary uppercase tracking-wider mb-4 border-b border-nexus-border/50 pb-2">Configuración de Seguridad y Sub-Permisos</h3>
                  
                  <div className="mb-6 bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50" onClick={() => setRequireLocation(!requireLocation)}>
                    <div>
                      <h4 className="font-semibold text-slate-200">Obligar a elegir Ubicación / Sucursal en el Login</h4>
                      <p className="text-xs text-slate-400">Si está apagado, el usuario podrá entrar sin declarar una sucursal activa.</p>
                    </div>
                    {requireLocation ? <ToggleRight className="w-8 h-8 text-nexus-primary" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
                  </div>

                  <div className={`mb-6 border rounded-xl overflow-hidden p-4 flex items-center justify-between cursor-pointer transition-colors ${isActive ? 'bg-green-900/10 border-green-500/20 hover:bg-green-900/20' : 'bg-red-900/10 border-red-500/20 hover:bg-red-900/20'}`} onClick={() => setIsActive(!isActive)}>
                    <div>
                      <h4 className={`font-semibold ${isActive ? 'text-green-400' : 'text-red-400'}`}>Cuenta {isActive ? 'Habilitada' : 'Deshabilitada (Suspendida)'}</h4>
                      <p className="text-xs text-slate-400">Si se deshabilita, el usuario no podrá iniciar sesión en ningún sistema.</p>
                    </div>
                    {isActive ? <ToggleRight className="w-8 h-8 text-green-500" /> : <ToggleLeft className="w-8 h-8 text-red-500" />}
                  </div>

                  {/* APP STOCK */}
                  <div className="mb-6 bg-blue-900/10 border border-blue-500/20 rounded-xl overflow-hidden">
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-blue-900/20 border-b border-blue-500/10"
                      onClick={() => setHasStock(!hasStock)}
                    >
                      <div>
                        <h4 className="font-semibold text-blue-400">Sistema de Stock</h4>
                        <p className="text-xs text-slate-400">Habilitar acceso al ecosistema de inventario</p>
                      </div>
                      {hasStock ? <ToggleRight className="w-8 h-8 text-blue-500" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
                    </div>
                    
                    {hasStock && (
                      <div className="p-4 bg-black/20 flex flex-col space-y-3">
                        {STOCK_TOOLS.map(tool => renderToolEditor(tool, stockTools, setStockTools))}
                      </div>
                    )}
                  </div>

                  {/* APP VENTAS */}
                  <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl overflow-hidden">
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-purple-900/20 border-b border-purple-500/10"
                      onClick={() => setHasVentas(!hasVentas)}
                    >
                      <div>
                        <h4 className="font-semibold text-purple-400">Sistema de Ventas</h4>
                        <p className="text-xs text-slate-400">Habilitar acceso al ecosistema de facturación</p>
                      </div>
                      {hasVentas ? <ToggleRight className="w-8 h-8 text-purple-500" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
                    </div>
                    
                    {hasVentas && (
                      <div className="p-4 bg-black/20 flex flex-col space-y-3">
                        {VENTAS_TOOLS.map(tool => renderToolEditor(tool, ventasTools, setVentasTools))}
                      </div>
                    )}
                  </div>

                </section>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="p-4 border-t border-nexus-border/50 bg-nexus-darker/80 flex justify-between items-center">
                {!isNewUser ? (
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition-all disabled:opacity-50"
                  >
                    Eliminar Usuario
                  </button>
                ) : (
                  <div></div>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center px-6 py-2 bg-gradient-to-r from-nexus-primary to-nexus-accent hover:from-nexus-primaryHover hover:to-nexus-accent text-white rounded-xl font-medium transition-all disabled:opacity-50 shadow-lg shadow-nexus-primary/20"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Guardar Cambios
                </button>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 glass-panel rounded-2xl flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-slate-700/50">
              <Shield className="w-16 h-16 text-slate-700 mb-4" />
              <h2 className="text-xl font-bold text-slate-400">Selecciona un usuario</h2>
              <p className="text-slate-500 mt-2 max-w-md">Elige un usuario del directorio para modificar todos los datos de la base, sus accesos y permisos granulares de lectura/escritura y sub-herramientas detalladas.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
