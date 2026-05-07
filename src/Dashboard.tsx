import { LogOut, Package, ShoppingCart, Activity, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import UserAdmin from './UserAdmin';

export default function Dashboard({ user, onLogout }: { user: any, onLogout: () => void }) {
  const [showAdmin, setShowAdmin] = useState(false);

  const isProd = import.meta.env.PROD;
  const stockUrl = isProd ? '/stock' : 'http://localhost:5173/';
  const ventasUrl = isProd ? '/ventas' : 'http://localhost:5174/';

  const userRole = user.rol?.toLowerCase() || '';
  const isAdmin = ['admin', 'administrador', 'administracion'].includes(userRole);

  if (showAdmin) {
    return <UserAdmin onBack={() => setShowAdmin(false)} />;
  }

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in">
      <header className="flex flex-col sm:flex-row items-center justify-between mb-12 glass-panel rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-nexus-primary to-nexus-accent"></div>
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-nexus-primary to-nexus-accent flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-nexus-primary/20">
            {user.id ? user.id.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Hola, {user.nombre_completo || user.id}</h2>
            <p className="text-sm text-slate-400">Portal Central CRM</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {isAdmin && (
            <button 
              onClick={() => setShowAdmin(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-nexus-primary hover:text-white border border-nexus-primary/50 hover:bg-nexus-primary rounded-xl transition-all shadow-lg hover:shadow-nexus-primary/50"
            >
              <ShieldAlert className="w-4 h-4 mr-2" />
              Administrar Usuarios
            </button>
          )}

          <button 
            onClick={onLogout}
            className="flex items-center px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-colors border border-transparent hover:border-red-400/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-4">
          Hub de Operaciones
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Selecciona el módulo al que deseas ingresar. Tu sesión se mantendrá activa en todo el ecosistema de forma automática.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <a 
          href={stockUrl}
          className="group relative flex flex-col h-80 glass-panel rounded-3xl p-8 hover:bg-nexus-card hover:border-nexus-primary/50 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden shadow-lg hover:shadow-nexus-primary/20"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
            <Package className="w-64 h-64 text-nexus-primary" />
          </div>
          <div className="relative z-10 flex-1 flex flex-col">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Sistema de Stock</h3>
            <p className="text-slate-400 flex-1 leading-relaxed">
              Gestión de inventario, remitos, almacenes y control de mercadería.
            </p>
            <div className="flex items-center text-nexus-primary font-semibold mt-4 group-hover:translate-x-2 transition-transform duration-300">
              Ingresar al módulo <Activity className="ml-2 w-4 h-4" />
            </div>
          </div>
        </a>

        <a 
          href={ventasUrl}
          className="group relative flex flex-col h-80 glass-panel rounded-3xl p-8 hover:bg-nexus-card hover:border-nexus-accent/50 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden shadow-lg hover:shadow-nexus-accent/20"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
            <ShoppingCart className="w-64 h-64 text-nexus-accent" />
          </div>
          <div className="relative z-10 flex-1 flex flex-col">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Sistema de Ventas</h3>
            <p className="text-slate-400 flex-1 leading-relaxed">
              Punto de venta, facturación, clientes y reportes comerciales.
            </p>
            <div className="flex items-center text-nexus-accent font-semibold mt-4 group-hover:translate-x-2 transition-transform duration-300">
              Ingresar al módulo <Activity className="ml-2 w-4 h-4" />
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
