import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('CLIENTE');
    const [businessType, setBusinessType] = useState('VETERINARIA'); // Nuevo estado
    const navigate = useNavigate();

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();

        localStorage.setItem('userRole', role);
        localStorage.setItem('isAuthenticated', 'true');
        // Si es negocio, guardamos también qué tipo de negocio es
        if (role === 'NEGOCIO') {
            localStorage.setItem('businessType', businessType);
            navigate('/negocio-panel');
        } else if (role === 'CLIENTE') {
            navigate('/mascotas');
        } else {
            navigate('/admin');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-teal-50 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full relative z-10">
                <div className="flex justify-center mb-6">
                    <div className="bg-teal-600 p-4 rounded-2xl shadow-lg shadow-teal-200"><HeartPulse className="text-white w-10 h-10" /></div>
                </div>

                <h2 className="text-2xl font-bold text-center mb-2 text-slate-800">{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>

                <div className="flex gap-2 mb-4 bg-slate-50 p-1 rounded-xl border border-slate-100">
                    <button type="button" onClick={() => setRole('CLIENTE')} className={`w-1/2 py-2 rounded-lg font-bold text-sm transition-all ${role === 'CLIENTE' ? 'bg-white text-teal-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}>Dueño Mascota</button>
                    <button type="button" onClick={() => setRole('NEGOCIO')} className={`w-1/2 py-2 rounded-lg font-bold text-sm transition-all ${role === 'NEGOCIO' ? 'bg-white text-teal-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}>Mi Negocio</button>
                </div>

                {/* Sub-selector que solo aparece si eliges Negocio */}
                {role === 'NEGOCIO' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6">
                        <p className="text-xs font-bold text-slate-500 mb-2 uppercase text-center">¿Qué tipo de negocio es?</p>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setBusinessType('VETERINARIA')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${businessType === 'VETERINARIA' ? 'bg-teal-50 border-teal-500 text-teal-700' : 'border-slate-200 text-slate-500'}`}>Clínica</button>
                            <button type="button" onClick={() => setBusinessType('PELUQUERIA')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${businessType === 'PELUQUERIA' ? 'bg-teal-50 border-teal-500 text-teal-700' : 'border-slate-200 text-slate-500'}`}>Spa/Pelu</button>
                            <button type="button" onClick={() => setBusinessType('TIENDA')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${businessType === 'TIENDA' ? 'bg-teal-50 border-teal-500 text-teal-700' : 'border-slate-200 text-slate-500'}`}>Tienda</button>
                        </div>
                    </motion.div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    <input type="email" required placeholder="Correo electrónico" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500" />
                    <input type="password" required placeholder="Contraseña" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500" />
                    <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5">Entrar al Sistema</button>
                </form>
            </motion.div>
        </div>
    );
}