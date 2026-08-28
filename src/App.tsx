import { BrowserRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Home, Store, ShieldCheck, HeartPulse, LogOut } from 'lucide-react';
import LoginPage from './auth/LoginPage';
import PetDashboard from './pets/PetList';
import Market from './marketplace/Market';
import BusinessDashboard from './businesses/BusinessDashboard';
import AdminDashboard from './admin/Dashboard';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === '/';

  // Leemos qué rol tiene el usuario en esta sesión
  const userRole = localStorage.getItem('userRole') || '';

  const handleLogout = () => {
    localStorage.clear(); // Borramos la memoria al salir
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-teal-50/40">
      {!isLogin && (
        <nav className="bg-white border-b border-teal-100 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-2 text-teal-600">
                <HeartPulse size={28} />
                <span className="text-2xl font-extrabold tracking-tight">PetPocket</span>
              </div>
              <div className="hidden md:flex space-x-6 items-center">
                {/* Menú Inteligente: Se adapta al Rol */}
                {userRole === 'CLIENTE' && (
                  <Link to="/mascotas" className="text-slate-600 hover:text-teal-600 font-semibold flex items-center gap-1.5 transition-colors"><Home size={18} /> Mis Mascotas</Link>
                )}

                <Link to="/market" className="text-slate-600 hover:text-teal-600 font-semibold flex items-center gap-1.5 transition-colors"><Store size={18} /> Marketplace</Link>

                {userRole === 'NEGOCIO' && (
                  <Link to="/negocio-panel" className="text-slate-600 hover:text-teal-600 font-semibold flex items-center gap-1.5 transition-colors"><Store size={18} /> Panel Mi Negocio</Link>
                )}

                {userRole === 'ADMIN' && (
                  <Link to="/admin" className="text-slate-600 hover:text-emerald-600 font-semibold flex items-center gap-1.5 transition-colors"><ShieldCheck size={18} /> Admin</Link>
                )}

                <button onClick={handleLogout} className="text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1.5 ml-4 transition-colors border-l pl-4 border-slate-200">
                  <LogOut size={18} /> Salir
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      <main>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/mascotas" element={<PetDashboard />} />
          <Route path="/market" element={<Market />} />
          <Route path="/negocio-panel" element={<BusinessDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}