import { useState, useEffect } from 'react';
import { executeAWSQuery } from './lib/aws-client';
import { Users, X, Save, Edit2, Shield, Plus, ToggleLeft, ToggleRight, Loader2, Check } from 'lucide-react';

interface User {
  id: string;
  nombre_completo: string;
  pass: string;
  rol: string;
  permisos: string | null;
}

const STOCK_TOOLS = [
  { id: 'dashboard', name: 'Dashboard Principal' },
  { id: 'inventario', name: 'Gestión de Inventario' },
  { id: 'remitos', name: 'Historial de Remitos' },
  { id: 'solicitudes', name: 'Módulo de Solicitudes' },
];

const VENTAS_TOOLS = [
  { id: 'pos', name: 'Punto de Venta (Caja)' },
  { id: 'clientes', name: 'Gestión de Clientes' },
  { id: 'reportes', name: 'Reportes y Métricas' },
  { id: 'facturacion', name: 'Facturación Electrónica' },
];

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
  
  // Permissions State
  const [hasStock, setHasStock] = useState(false);
  const [hasVentas, setHasVentas] = useState(false);
  const [stockTools, setStockTools] = useState<string[]>([]);
  const [ventasTools, setVentasTools] = useState<string[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await executeAWSQuery('SELECT id, nombre_completo, pass, rol, permisos FROM usuarios');
      setUsers(data || []);
    } catch (err: any) {
      setError('Error al cargar usuarios: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (u: User) => {
    setEditingUser(u);
    setIsNewUser(false);
    setFormOriginalId(u.id);
    setFormId(u.id);
    setFormNombre(u.nombre_completo || '');
    setFormPass(u.pass || '');
    setFormRol(u.rol || 'vendedor');

    // Parse Permissions
    setHasStock(false);
    setHasVentas(false);
    setStockTools([]);
    setVentasTools([]);

    if (u.permisos) {
      try {
        const p = JSON.parse(u.permisos);
        if (p.apps) {
          setHasStock(p.apps.includes('stock'));
          setHasVentas(p.apps.includes('ventas'));
        } else {
          // Legacy support (flat array of strings)
          if (Array.isArray(p)) {
             setHasStock(true); // default old users to stock
             const legacyTools = p.filter(x => typeof x === 'string').map(x => x.replace('sidebar_', ''));
             setStockTools(legacyTools);
          }
        }
        if (p.stock_tools) setStockTools(p.stock_tools);
        if (p.ventas_tools) setVentasTools(p.ventas_tools);
      } catch(e) {
        console.error("Error parsing user permissions", e);
      }
    }
  };

  const handleCreate = () => {
    setIsNewUser(true);
    setEditingUser({ id: '', nombre_completo: '', pass: '', rol: 'vendedor', permisos: null });
    setFormId('');
    setFormOriginalId('');
    setFormNombre('');
    setFormPass('');
    setFormRol('vendedor');
    setHasStock(false);
    setHasVentas(false);
    setStockTools([]);
    setVentasTools([]);
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
      version: 2,
      apps,
      stock_tools: stockTools,
      ventas_tools: ventasTools
    });

    try {
      if (isNewUser) {
        await executeAWSQuery(`
          INSERT INTO usuarios (id, nombre_completo, pass, rol, permisos) 
          VALUES ('${formId}', '${formNombre}', '${formPass}', '${formRol}', '${permisosJson}')
        `);
      } else {
        await executeAWSQuery(`
          UPDATE usuarios 
          SET id = '${formId}', 
              nombre_completo = '${formNombre}', 
              pass = '${formPass}', 
              rol = '${formRol}', 
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
            <p className="text-slate-400 text-sm">Control de accesos y permisos globales</p>
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
          <div className="lg:col-span-1 glass-panel rounded-2xl overflow-hidden flex flex-col max-h-[700px]">
            <div className="p-4 border-b border-nexus-border/50 bg-nexus-darker/50">
              <h2 className="font-semibold text-slate-200">Directorio ({users.length})</h2>
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

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                
                {/* Datos Básicos */}
                <section>
                  <h3 className="text-sm font-bold text-nexus-primary uppercase tracking-wider mb-4 border-b border-nexus-border/50 pb-2">Datos Base</h3>
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
                      <select 
                        value={formRol} 
                        onChange={e => setFormRol(e.target.value)}
                        className="w-full bg-nexus-dark border border-nexus-border rounded-lg px-3 py-2 text-sm focus:border-nexus-primary outline-none"
                      >
                        <option value="vendedor">Vendedor</option>
                        <option value="encargado">Encargado</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Acceso a Módulos */}
                <section>
                  <h3 className="text-sm font-bold text-nexus-primary uppercase tracking-wider mb-4 border-b border-nexus-border/50 pb-2">Acceso a Aplicaciones</h3>
                  
                  {/* APP STOCK */}
                  <div className="mb-6 bg-blue-900/10 border border-blue-500/20 rounded-xl overflow-hidden">
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-blue-900/20"
                      onClick={() => setHasStock(!hasStock)}
                    >
                      <div>
                        <h4 className="font-semibold text-blue-400">Sistema de Stock</h4>
                        <p className="text-xs text-slate-400">Habilitar acceso al ecosistema de inventario</p>
                      </div>
                      {hasStock ? <ToggleRight className="w-8 h-8 text-blue-500" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
                    </div>
                    
                    {hasStock && (
                      <div className="p-4 border-t border-blue-500/10 bg-black/20 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {STOCK_TOOLS.map(tool => (
                          <div key={tool.id} onClick={() => setStockTools(prev => prev.includes(tool.id) ? prev.filter(t => t !== tool.id) : [...prev, tool.id])} className="flex items-center space-x-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${stockTools.includes(tool.id) ? 'bg-blue-500 border-blue-500' : 'border-slate-600 group-hover:border-blue-400'}`}>
                              {stockTools.includes(tool.id) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-sm text-slate-300 group-hover:text-white">{tool.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* APP VENTAS */}
                  <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl overflow-hidden">
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-purple-900/20"
                      onClick={() => setHasVentas(!hasVentas)}
                    >
                      <div>
                        <h4 className="font-semibold text-purple-400">Sistema de Ventas</h4>
                        <p className="text-xs text-slate-400">Habilitar acceso al ecosistema de facturación</p>
                      </div>
                      {hasVentas ? <ToggleRight className="w-8 h-8 text-purple-500" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
                    </div>
                    
                    {hasVentas && (
                      <div className="p-4 border-t border-purple-500/10 bg-black/20 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {VENTAS_TOOLS.map(tool => (
                          <div key={tool.id} onClick={() => setVentasTools(prev => prev.includes(tool.id) ? prev.filter(t => t !== tool.id) : [...prev, tool.id])} className="flex items-center space-x-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${ventasTools.includes(tool.id) ? 'bg-purple-500 border-purple-500' : 'border-slate-600 group-hover:border-purple-400'}`}>
                              {ventasTools.includes(tool.id) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-sm text-slate-300 group-hover:text-white">{tool.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </section>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="p-4 border-t border-nexus-border/50 bg-nexus-darker/80 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center px-6 py-2 bg-gradient-to-r from-nexus-primary to-nexus-accent hover:from-nexus-primaryHover hover:to-nexus-accent text-white rounded-xl font-medium transition-all disabled:opacity-50"
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
              <p className="text-slate-500 mt-2 max-w-md">Elige un usuario del directorio para modificar sus accesos y herramientas, o crea uno nuevo.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
