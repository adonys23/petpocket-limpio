import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Lock, User, UserPlus, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('DUEÑO');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const endpoint = isLogin ? '/api/login' : '/api/register';
        const payload = isLogin
            ? { email, password }
            : { name, email, password, role };

        try {
            const response = await fetch(`http://localhost:3001${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Ocurrió un error');
                return;
            }

            // Guardamos los datos del usuario en el navegador
            localStorage.setItem('user', JSON.stringify(data));

            // Redirigimos automáticamente según el rol sin recargar la página
            if (data.role === 'DUEÑO') {
                navigate('/mascotas');
            } else {
                navigate('/negocio-panel');
            }

        } catch (err) {
            setError('Error al conectar con el servidor');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-teal-600 p-8 text-center">
                    <ShieldCheck size={48} className="text-white mx-auto mb-4" />
                    <h2 className="text-3xl font-extrabold text-white">PetPocket</h2>
                    <p className="text-teal-100 mt-2">Tu veterinaria digital</p>
                </div>

                <div className="p-8">
                    <div className="flex bg-slate-100 rounded-xl p-1 mb-8">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${isLogin ? 'bg-white shadow text-teal-700' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${!isLogin ? 'bg-white shadow text-teal-700' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Crear Cuenta
                        </button>
                    </div>

                    {error && (
                        <div className="bg-rose-100 text-rose-700 p-3 rounded-xl text-sm font-semibold mb-6 text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence>
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 mb-1">Nombre Completo / Negocio</label>
                                        <div className="relative">
                                            <User size={18} className="absolute left-3 top-3 text-slate-400" />
                                            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-teal-600" placeholder="Ej. Juan Pérez" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 mb-1">¿Qué tipo de cuenta deseas?</label>
                                        <select value={role} onChange={e => setRole(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-teal-600">
                                            <option value="DUEÑO">Soy dueño de mascota</option>
                                            <option value="VETERINARIA">Soy una Clínica Veterinaria</option>
                                            <option value="PELUQUERIA">Soy una Peluquería Canina</option>
                                            <option value="TIENDA">Venta de artículos para mascotas</option>
                                        </select>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Correo Electrónico</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-3 text-slate-400" />
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-teal-600" placeholder="correo@ejemplo.com" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Contraseña</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-3 text-slate-400" />
                                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-teal-600" placeholder="••••••••" />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-6">
                            {isLogin ? <><LogIn size={20} /> Entrar a mi cuenta</> : <><UserPlus size={20} /> Registrarme ahora</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}