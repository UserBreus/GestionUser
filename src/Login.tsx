import { useState, useEffect } from 'react';
import { executeAWSQuery } from './lib/aws-client';
import { Shield, Lock, User, Loader2, MapPin } from 'lucide-react';

export default function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [depositos, setDepositos] = useState<any[]>([]);
  const [selectedDeposito, setSelectedDeposito] = useState('');

  const [step, setStep] = useState<1 | 2>(1);
  const [pendingUser, setPendingUser] = useState<any>(null);

  useEffect(() => {
    executeAWSQuery('SELECT id, nombre, tipo FROM Stock_Depositos')
      .then(data => setDepositos(data || []))
      .catch(err => console.error("Error loading depositos", err));
  }, []);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Por favor, ingresa usuario y contraseña');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await executeAWSQuery(`SELECT * FROM usuarios WHERE id = '${username}' AND pass = '${password}'`);
      
      if (res && res.length > 0) {
        let p: any = {};
        try {
          if (res[0].permisos) p = typeof res[0].permisos === 'string' ? JSON.parse(res[0].permisos) : res[0].permisos;
        } catch(e) {}
        
        const userRole = (res[0].rol || '').toLowerCase();
        const isAdmin = ['admin', 'administrador', 'administracion'].includes(userRole);

        if (isAdmin) {
            // Forzar que el admin no requiera ubicación y tenga acceso global
            p.require_location = false;
            res[0].is_super_admin = true; // Flag for other projects
        }

        // Add parsed object so other projects don't have to parse the string manually
        res[0].permisos_obj = p;
        
        const requireLoc = p.require_location !== false; // por defecto es true
        
        if (requireLoc) {
          // Move to step 2 to ask for location
          setPendingUser(res[0]);
          setStep(2);
        } else {
          // Log in immediately
          finishLogin(res[0], null);
        }
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeposito) {
      setError('Debes seleccionar tu ubicación de trabajo actual');
      return;
    }
    
    setLoading(true);
    await finishLogin(pendingUser, selectedDeposito);
    setLoading(false);
  };

  const finishLogin = async (userRecord: any, locId: string | null) => {
    const depoRecord = locId ? depositos.find(d => d.id.toString() === locId) : null;
    const enrichedUser = {
        ...userRecord,
        sucursal_activa_id: locId ? parseInt(locId) : null,
        sucursal_activa_nombre: depoRecord?.nombre || null
    };
    
    // Register login audit session in the background
    if (locId) {
      try {
        await executeAWSQuery(`INSERT INTO Stock_Sesiones_Login (usuario_id, deposito_id) VALUES ('${userRecord.id}', ${locId})`);
      } catch(audErr) {
        console.error("No se pudo registrar la sesión de auditoría", audErr);
      }
    }

    localStorage.setItem('nexus_custom_user', JSON.stringify(enrichedUser));
    onLogin(enrichedUser);
  };

  return (
    <div className="w-full max-w-md animate-slide-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-nexus-dark border border-nexus-border shadow-xl mb-4">
          <Shield className="w-8 h-8 text-nexus-primary" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Portal Central</h1>
        <p className="text-slate-400 mt-2">Acceso Seguro Unificado (SSO)</p>
      </div>

      <div className="glass-panel rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-nexus-primary to-nexus-accent"></div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg text-center animate-fade-in mb-6">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Usuario</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-nexus-border rounded-xl bg-nexus-dark/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-nexus-primary focus:border-transparent transition-all"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  className="block w-full pl-10 pr-3 py-3 border border-nexus-border rounded-xl bg-nexus-dark/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-nexus-primary focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-nexus-primary to-nexus-accent hover:from-nexus-primaryHover hover:to-nexus-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexus-primary focus:ring-offset-nexus-darker disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Ingresar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLocationSubmit} className="space-y-6 animate-slide-up">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white">Hola, {pendingUser?.nombre_completo || pendingUser?.id}</h2>
              <p className="text-sm text-slate-400">Por favor, indica tu ubicación para hoy.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Ubicación Actual</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-slate-500" />
                </div>
                <select
                  className="block w-full pl-10 pr-3 py-3 border border-nexus-border rounded-xl bg-nexus-dark/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-nexus-primary focus:border-transparent transition-all appearance-none"
                  value={selectedDeposito}
                  onChange={(e) => setSelectedDeposito(e.target.value)}
                >
                  <option value="" disabled>Seleccionar sucursal de turno...</option>
                  {depositos.map(d => (
                    <option key={d.id} value={d.id}>{d.nombre} ({d.tipo})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => { setStep(1); setPendingUser(null); setPassword(''); }}
                className="w-1/3 flex items-center justify-center py-3 px-4 border border-nexus-border rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 transition-all"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-nexus-primary to-nexus-accent hover:from-nexus-primaryHover hover:to-nexus-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexus-primary focus:ring-offset-nexus-darker disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Confirmar e Ingresar'}
              </button>
            </div>
          </form>
        )}
      </div>
      
      <div className="mt-8 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} Administración Central.
      </div>
    </div>
  );
}
