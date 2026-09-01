import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, AlertTriangle, Calendar, ShieldCheck, X, FileText, Syringe, Trash2, Upload, Clock, Stethoscope } from 'lucide-react';
import { useToast } from '../components/ToastProvider';

export default function PetList() {
    const [pets, setPets] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedCarnet, setSelectedCarnet] = useState<any | null>(null);
    const [deletingPet, setDeletingPet] = useState<any | null>(null);
    const showToast = useToast();
    const [appointments, setAppointments] = useState<any[]>([]);

    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState('Perro');
    const [newBreed, setNewBreed] = useState('');
    const [newAge, setNewAge] = useState('');
    const [newAllergies, setNewAllergies] = useState('Ninguna');
    const [newImageBase64, setNewImageBase64] = useState('');

    // Obtenemos al dueño actual
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (currentUser.id) {
            fetchPets();
            fetchAppointments();
        }
    }, [currentUser.id]);

    const fetchAppointments = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/appointments/owner/${currentUser.id}`);
            const data = await response.json();
            setAppointments(data);
        } catch (error) {
            console.error("Error al cargar tus citas:", error);
        }
    };

    // Fecha de hoy y de mañana en formato YYYY-MM-DD, igual al que guarda
    // el <input type="date"> del Marketplace, para poder comparar.
    // OJO: usamos la fecha LOCAL del navegador (no toISOString, que es UTC)
    // porque si son ya las 7-8pm en Ecuador, en UTC ya es el día siguiente,
    // y eso hacía que una cita de "mañana" saliera marcada como "hoy".
    const toDateKey = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };
    const todayKey = toDateKey(new Date());
    const tomorrowKey = toDateKey(new Date(Date.now() + 24 * 60 * 60 * 1000));

    const upcomingAppointments = appointments.filter(a => a.status === 'PENDIENTE');

    const fetchPets = async () => {
        try {
            // Buscamos SOLO las mascotas de este usuario
            const response = await fetch(`http://localhost:3001/api/pets/${currentUser.id}`);
            const data = await response.json();
            setPets(data);
        } catch (error) {
            console.error("Error al cargar mascotas:", error);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => setNewImageBase64(reader.result as string);
        }
    };

    const handleCreatePet = async (e: React.FormEvent) => {
        e.preventDefault();
        const petData = {
            ownerId: currentUser.id, // Le pegamos la etiqueta de dueño
            name: newName,
            type: newType,
            breed: newBreed,
            age: newAge,
            allergies: newAllergies,
            imageUrl: newImageBase64 || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400',
        };

        try {
            const response = await fetch('http://localhost:3001/api/pets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(petData)
            });
            const created = await response.json();
            setPets([created, ...pets]);
            setShowForm(false);
        } catch (error) {
            console.error("Error al crear mascota:", error);
        }
    };

    const confirmDeletePet = async () => {
        if (!deletingPet) return;
        const id = deletingPet.id;
        try {
            await fetch(`http://localhost:3001/api/pets/${id}`, { method: 'DELETE' });
            setPets(pets.filter(p => p.id !== id));
            if (selectedCarnet?.id === id) setSelectedCarnet(null);
            showToast(`${deletingPet.name} fue eliminado.`, 'info');
        } catch (error) {
            console.error("Error al eliminar:", error);
            showToast('No se pudo eliminar la mascota, intenta de nuevo.', 'error');
        } finally {
            setDeletingPet(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800">Mis Mascotas</h1>
                        <p className="text-slate-500 mt-1">¡Hola {currentUser.name}! Gestiona tus peludos y su carnet.</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)} className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-teal-100 transition-all">
                        <Plus size={20} /> {showForm ? 'Cerrar' : 'Nueva Mascota'}
                    </button>
                </div>

                {/* MIS PRÓXIMAS CITAS: se ve apenas entras, con aviso si es hoy o mañana */}
                {upcomingAppointments.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Mis Próximas Citas</h2>
                        <div className="space-y-3">
                            {upcomingAppointments.map(appt => {
                                const isToday = appt.date === todayKey;
                                const isTomorrow = appt.date === tomorrowKey;
                                return (
                                    <div
                                        key={appt.id}
                                        className={`relative bg-white p-4 pl-6 rounded-2xl shadow-sm border overflow-hidden flex flex-wrap items-center justify-between gap-3 ${
                                            isToday ? 'border-rose-200' : isTomorrow ? 'border-amber-200' : 'border-slate-200'
                                        }`}
                                    >
                                        <span className={`absolute left-0 top-0 h-full w-1.5 ${isToday ? 'bg-rose-400' : isTomorrow ? 'bg-amber-400' : 'bg-teal-300'}`} />
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                                                <Stethoscope size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{appt.petName} · {appt.businessName}</p>
                                                <p className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                                                    <span className="flex items-center gap-1"><Calendar size={12} /> {appt.date}</span>
                                                    <span className="flex items-center gap-1"><Clock size={12} /> {appt.time}</span>
                                                </p>
                                            </div>
                                        </div>
                                        {(isToday || isTomorrow) && (
                                            <span className={`text-xs font-extrabold px-3 py-1.5 rounded-full ${isToday ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                                                {isToday ? '¡Es hoy!' : 'Es mañana'}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* FORMULARIO */}
                <AnimatePresence>
                    {showForm && (
                        <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleCreatePet} className="bg-white p-6 rounded-3xl shadow-md border border-slate-200 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <h3 className="text-xl font-bold text-slate-800 md:col-span-2">Registrar una nueva mascota</h3>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">Nombre</label>
                                <input type="text" required value={newName} onChange={e => setNewName(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-teal-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">Tipo de animal</label>
                                <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-teal-600">
                                    <option value="Perro">Perro</option>
                                    <option value="Gato">Gato</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">Raza</label>
                                <input type="text" required value={newBreed} onChange={e => setNewBreed(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-teal-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">Edad</label>
                                <input type="text" required value={newAge} onChange={e => setNewAge(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-teal-600" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-600 mb-1">Alergias</label>
                                <input type="text" value={newAllergies} onChange={e => setNewAllergies(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-teal-600" placeholder="Ej. Ninguna" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-600 mb-1">Foto</label>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm" />
                            </div>
                            <div className="md:col-span-2 flex justify-end mt-4">
                                <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all">Guardar Mascota</button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* TARJETAS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pets.map((pet) => (
                        <motion.div key={pet.id} whileHover={{ y: -5 }} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all relative">
                            <button onClick={(e) => { e.stopPropagation(); setDeletingPet(pet); }} className="absolute top-3 left-3 bg-rose-500/90 hover:bg-rose-600 text-white p-2 rounded-full shadow-md z-10 transition-colors">
                                <Trash2 size={16} />
                            </button>
                            <div className="h-48 relative">
                                <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
                                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-teal-800 text-xs font-extrabold px-3 py-1 rounded-full">{pet.type}</span>
                            </div>
                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-slate-800">{pet.name}</h3>
                                <p className="text-sm font-semibold text-teal-600 mb-4">{pet.breed}</p>
                                <div className="space-y-2 text-slate-600 text-sm border-t border-slate-100 pt-4 mb-4">
                                    <p className="flex items-center gap-2"><Calendar size={16} /> Edad: {pet.age}</p>
                                    <p className="flex items-start gap-2 text-rose-800 mt-2"><AlertTriangle size={16} className="text-rose-500" /> Alergias: {pet.allergies || 'Ninguna'}</p>
                                </div>
                                <button onClick={() => setSelectedCarnet(pet)} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                                    <FileText size={16} className="text-teal-600" /> Ver Carnet
                                </button>
                            </div>
                        </motion.div>
                    ))}
                    {pets.length === 0 && <p className="text-slate-500 col-span-3 text-center py-10">No tienes mascotas registradas aún. ¡Añade tu primer peludo!</p>}
                </div>

                {/* MODAL CARNET */}
                <AnimatePresence>
                    {selectedCarnet && (
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100">
                                <div className="bg-teal-600 p-6 text-white relative">
                                    <button onClick={() => setSelectedCarnet(null)} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full transition-colors"><X size={20} /></button>
                                    <div className="flex items-center gap-3 mb-2">
                                        <ShieldCheck size={28} className="text-teal-200" />
                                        <h2 className="text-2xl font-bold">Carnet Digital</h2>
                                    </div>
                                    <p className="text-teal-100 text-sm">Registro médico oficial de Supabase.</p>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                                        <img src={selectedCarnet.imageUrl} className="w-16 h-16 rounded-full object-cover border-2 border-teal-100" />
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800">{selectedCarnet.name}</h3>
                                            <p className="text-sm text-slate-500">{selectedCarnet.breed}</p>
                                        </div>
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Historial</h4>
                                    <div className="space-y-4 max-h-48 overflow-y-auto">
                                        {(!selectedCarnet.history || selectedCarnet.history.length === 0) ? (
                                            <p className="text-xs text-slate-400 text-center py-4">No hay registros médicos aún.</p>
                                        ) : (
                                            selectedCarnet.history.map((record: any, idx: number) => (
                                                <div key={idx} className="flex gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <div className="bg-teal-100 text-teal-600 p-2.5 rounded-xl h-fit"><Syringe size={18} /></div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{record.action}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">{record.date} | Sello: {record.vet}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* MODAL CONFIRMAR ELIMINAR (reemplaza el confirm() feo del navegador) */}
                <AnimatePresence>
                    {deletingPet && (
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl">
                                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
                                    <AlertTriangle size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-1">¿Eliminar a {deletingPet.name}?</h3>
                                <p className="text-sm text-slate-500 mb-6">Se borrará su perfil y su carnet digital. Esta acción no se puede deshacer.</p>
                                <div className="flex justify-end gap-3">
                                    <button type="button" onClick={() => setDeletingPet(null)} className="px-4 py-2 text-slate-500 font-bold">
                                        Cancelar
                                    </button>
                                    <button type="button" onClick={confirmDeletePet} className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2">
                                        <Trash2 size={16} /> Eliminar
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}