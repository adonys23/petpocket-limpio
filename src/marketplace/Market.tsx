import { useState, useEffect } from 'react';
import { Store, MapPin, Phone, Clock, ShieldCheck, HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Market() {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const [businesses, setBusinesses] = useState<any[]>([]);
    const [filter, setFilter] = useState('TODOS');

    // Estados para el Modal de Agendar
    const [selectedBiz, setSelectedBiz] = useState<any>(null);
    const [myPets, setMyPets] = useState<any[]>([]);
    const [appointmentData, setAppointmentData] = useState({ petId: '', date: '', time: '', reason: '' });

    useEffect(() => {
        fetchBusinesses();
        // Cargar mis mascotas para el selector del modal
        if (currentUser.id) {
            fetch(`http://localhost:3001/api/pets/${currentUser.id}`)
                .then(res => res.json())
                .then(data => setMyPets(data));
        }
    }, [currentUser.id]);

    const fetchBusinesses = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/business');
            const data = await response.json();
            setBusinesses(data);
        } catch (error) {
            console.error("Error al cargar marketplace:", error);
        }
    };

    const handleAgendar = async (e: React.FormEvent) => {
        e.preventDefault();
        const pet = myPets.find(p => p.id === appointmentData.petId);

        await fetch('http://localhost:3001/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...appointmentData,
                petName: pet.name,
                ownerId: currentUser.id,
                businessId: selectedBiz.ownerId
            })
        });
        alert('¡Cita agendada con éxito! La clínica ha sido notificada.');
        setSelectedBiz(null);
    };

    const filteredBusinesses = filter === 'TODOS'
        ? businesses
        : businesses.filter(b => b.type === filter);

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-slate-800 flex items-center justify-center gap-3 mb-4">
                        <Store className="text-teal-600" size={40} />
                        Marketplace PetPocket
                    </h1>
                    <p className="text-slate-500 text-lg">Encuentra veterinarias, peluquerías y tiendas reales cerca de ti.</p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {['TODOS', 'VETERINARIA', 'PELUQUERIA', 'TIENDA'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${filter === type ? 'bg-teal-600 text-white shadow-teal-200' : 'bg-white text-slate-600 hover:bg-teal-50 border border-slate-200'}`}
                        >
                            {type === 'TODOS' ? 'Todos los negocios' : type}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredBusinesses.map((biz) => (
                        <motion.div key={biz.id} whileHover={{ y: -5 }} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                            <div className="h-48 relative bg-slate-100">
                                {biz.imageUrl ? (
                                    <img src={biz.imageUrl} alt={biz.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300"><Store size={64} /></div>
                                )}
                                <span className="absolute top-4 right-4 bg-white/90 backdrop-blur text-teal-800 text-xs font-extrabold px-3 py-1.5 rounded-full shadow-sm">
                                    {biz.type}
                                </span>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">{biz.name}</h3>
                                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{biz.description}</p>

                                <div className="space-y-2 mb-6">
                                    <p className="flex items-center gap-2 text-sm text-slate-500"><MapPin size={16} className="text-teal-600" /> {biz.address}</p>
                                    <p className="flex items-center gap-2 text-sm text-slate-500"><Phone size={16} className="text-teal-600" /> {biz.phone}</p>
                                    {biz.is24_7 && (
                                        <p className="flex items-center gap-2 text-sm text-rose-600 font-bold"><Clock size={16} /> Atención 24/7</p>
                                    )}
                                </div>

                                <div className="mt-auto">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Servicios / Productos</p>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {biz.services?.split(',').map((service: string, idx: number) => (
                                            <span key={idx} className="bg-teal-50 text-teal-700 text-xs px-2.5 py-1 rounded-lg border border-teal-100">{service.trim()}</span>
                                        ))}
                                    </div>

                                    <button onClick={() => setSelectedBiz(biz)} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                                        <HeartPulse size={18} /> {biz.type === 'TIENDA' ? 'Hacer Pedido' : 'Agendar Cita'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {filteredBusinesses.length === 0 && (
                        <div className="col-span-full text-center py-20">
                            <ShieldCheck size={48} className="text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 text-lg">Aún no hay negocios registrados en esta categoría.</p>
                        </div>
                    )}
                </div>

                {/* MODAL AGENDAR CITA */}
                {selectedBiz && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
                            <h3 className="text-2xl font-bold mb-4">Agendar en {selectedBiz.name}</h3>
                            <form onSubmit={handleAgendar} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">¿Para qué mascota es?</label>
                                    <select required onChange={e => setAppointmentData({ ...appointmentData, petId: e.target.value })} className="w-full border rounded-xl p-2.5">
                                        <option value="">Selecciona tu mascota...</option>
                                        {myPets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">Fecha</label>
                                        <input type="date" required onChange={e => setAppointmentData({ ...appointmentData, date: e.target.value })} className="w-full border rounded-xl p-2.5" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">Hora</label>
                                        <input type="time" required onChange={e => setAppointmentData({ ...appointmentData, time: e.target.value })} className="w-full border rounded-xl p-2.5" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Motivo / Servicio</label>
                                    <input type="text" required onChange={e => setAppointmentData({ ...appointmentData, reason: e.target.value })} className="w-full border rounded-xl p-2.5" placeholder="Ej. Vacuna, Baño..." />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button type="button" onClick={() => setSelectedBiz(null)} className="px-4 py-2 text-slate-500 font-bold">Cancelar</button>
                                    <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-xl font-bold">Confirmar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}