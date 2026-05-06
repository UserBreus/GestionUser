import { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_custom_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error parsing saved user", e);
      }
    }
  }, []);

  const handleLogin = (userData: any) => {
    localStorage.setItem('nexus_custom_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('nexus_custom_user');
    setUser(null);
  };

  return (
    <div className="min-h-screen w-full overflow-hidden relative selection:bg-nexus-primary selection:text-white bg-nexus-darker">
      {/* Background blobs for premium feel */}
      <div className="fixed top-0 -left-4 w-96 h-96 bg-nexus-primary rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob pointer-events-none"></div>
      <div className="fixed top-0 -right-4 w-96 h-96 bg-nexus-accent rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="fixed -bottom-8 left-1/2 -translate-x-1/2 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000 pointer-events-none"></div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {!user ? (
          <Login onLogin={handleLogin} />
        ) : (
          <Dashboard user={user} onLogout={handleLogout} />
        )}
      </div>
    </div>
  );
}

export default App;
