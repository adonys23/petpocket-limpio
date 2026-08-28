import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, AlertTriangle, Calendar, Bell, ShieldCheck, X, FileText, Syringe } from 'lucide-react';

const initialPets = [
    {
        id: 1, name: 'Max', type: 'Perro', breed: 'Golden Retriever', age: '2 años', allergies: 'Ninguna', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400',
        history: [
            { date: '10 Feb 2026', action: 'Vacuna Antirrábica', vet: 'VetCentral 24H' },
            { date: '15 Abr 2026', action: 'Desparasitación Interna', vet: 'VetCentral 24H' }
        ]
    },
    {
        id: 2, name: 'Kiko', type: 'Loro', breed: 'Amazónico', age: '1 año', allergies: 'Sensible al polen', image: 'https://images.unsplash.com/photo-1522858547137-f1d655206256?auto=format&fit=crop&q=80&w=400',
        history: [
            { date: '05 Ene 2026', action: 'Revisión de Plumaje', vet: 'Exóticos Spa' }
        ]
    }
];

export default function PetList() {
    const [pets, setPets] = useState(initialPets);
    const [showForm, setShowForm] = useState(false);
    const [selectedCarnet, setSelectedCarnet] = useState<typeof initialPets[0] | null>(null);

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800">Mis Mascotas</h1>
                        <p className="text-slate-500 mt-1">Gestiona perfiles y visualiza el carnet oficial de tus mascotas.</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)} className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-teal-100 transition-all">
                        <Plus size={20} /> {showForm ? 'Cerrar' : 'Nueva Mascota'}
                    </button>
                </div>

                {/* Tarjetas de Mascotas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pets.map((pet) => (
                        <motion.div key={pet.id} whileHover={{ y: -5 }} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all">
                            <div className="h-48 relative">
                                <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
                                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-teal-800 text-xs font-extrabold px-3 py-1 rounded-full">{pet.type}</span>
                            </div>
                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-slate-800">{pet.name}</h3>
                                <p className="text-sm font-semibold text-teal-600 mb-4">{pet.breed}</p>
                                <div className="space-y-2 text-slate-600 text-sm border-t border-slate-100 pt-4 mb-4">
                                    <p className="flex items-center gap-2"><Calendar size={16} /> Edad: {pet.age}</p>
                                    <p className="flex items-start gap-2 text-rose-800 mt-2"><AlertTriangle size={16} className="text-rose-500" /> Alergias: {pet.allergies}</p>
                                </div>
                                {/* BOTÓN DEL CARNET */}
                                <button
                                    onClick={() => setSelectedCarnet(pet)}
                                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                                >
                                    <FileText size={16} className="text-teal-600" /> Ver Carnet Médico Oficial
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* MODAL DEL CARNET DIGITAL (Animado) */}
                <AnimatePresence>
                    {selectedCarnet && (
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100"
                            >
                                <div className="bg-teal-600 p-6 text-white relative">
                                    <button onClick={() => setSelectedCarnet(null)} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full transition-colors">
                                        <X size={20} />
                                    </button>
                                    <div className="flex items-center gap-3 mb-2">
                                        <ShieldCheck size={28} className="text-teal-200" />
                                        <h2 className="text-2xl font-bold">Carnet Digital</h2>
                                    </div>
                                    <p className="text-teal-100 text-sm">Documento oficial de solo lectura. Únicamente clínicas autorizadas pueden registrar eventos.</p>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                                        <img src={selectedCarnet.image} alt={selectedCarnet.name} className="w-16 h-16 rounded-full object-cover border-2 border-teal-100" />
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800">{selectedCarnet.name}</h3>
                                            <p className="text-sm text-slate-500">{selectedCarnet.type} - {selectedCarnet.breed}</p>
                                        </div>
                                    </div>

                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Historial de Vacunación</h4>
                                    <div className="space-y-4">
                                        {selectedCarnet.history.map((record, index) => (
                                            <div key={index} className="flex gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                                <div className="bg-teal-100 text-teal-600 p-2.5 rounded-xl h-fit"><Syringe size={18} /></div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{record.action}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{record.date}</p>
                                                    <p className="text-xs font-semibold text-teal-700 mt-1 flex items-center gap-1">
                                                        <ShieldCheck size={12} /> Sello: {record.vet}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button onClick={() => setSelectedCarnet(null)} className="w-full mt-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors">
                                        Cerrar Carnet
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