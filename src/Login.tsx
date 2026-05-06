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

  useEffect(() => {
    executeAWSQuery('SELECT id, nombre, tipo FROM Stock_Depositos')
      .then(data => setDepositos(data || []))
      .catch(err => console.error("Error loading depositos", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Por favor, ingresa usuario y contraseña');
      return;
    }

    if (!selectedDeposito) {
      setError('Debes seleccionar tu ubicación de trabajo actual');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await executeAWSQuery(`SELECT * FROM usuarios WHERE id = '${username}' AND pass = '${password}'`);
      
      if (res && res.length > 0) {
        const depoRecord = depositos.find(d => d.id.toString() === selectedDeposito);
        const enrichedUser = {
            ...res[0],
            sucursal_activa_id: parseInt(selectedDeposito),
            sucursal_activa_nombre: depoRecord?.nombre
        };
        
        // Register login audit session in the background
        try {
          await executeAWSQuery(`INSERT INTO Stock_Sesiones_Login (usuario_id, deposito_id) VALUES ('${res[0].id}', ${selectedDeposito})`);
        } catch(audErr) {
          console.error("No se pudo registrar la sesión de auditoría", audErr);
        }

        localStorage.setItem('nexus_custom_user', JSON.stringify(enrichedUser));
        onLogin(enrichedUser);
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
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

      <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-nexus-primary to-nexus-accent"></div>
        <div className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg text-center animate-fade-in">
              {error}
            </div>
          )}
          
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

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-nexus-primary to-nexus-accent hover:from-nexus-primaryHover hover:to-nexus-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexus-primary focus:ring-offset-nexus-darker disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Ingresar al Ecosistema'}
          </button>
        </div>
      </form>
      
      <div className="mt-8 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} Administración Central.
      </div>
    </div>
  );
}
