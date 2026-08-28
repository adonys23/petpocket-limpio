import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Clock, Stethoscope, Scissors, ShoppingBag, Map, Navigation, Loader2 } from 'lucide-react';

const mockBusinesses = [
    { id: 1, name: 'VetCentral 24 Horas', type: 'veterinaria', distance: '1.2 km', rating: 4.8, address: 'Av. Amazonas, Quito', image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=600' },
    { id: 2, name: 'Cortes Perrunos & Spa', type: 'peluqueria', distance: '3.5 km', rating: 4.5, address: 'Av. De los Shyris, Quito', image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=600' },
    { id: 3, name: 'Mundo Mascota Store', type: 'tienda', distance: '0.8 km', rating: 4.9, address: 'CC El Recreo', image: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&q=80&w=600' }
];

export default function Market() {
    const [filter, setFilter] = useState('todos');
    const [locationState, setLocationState] = useState<'idle' | 'loading' | 'found'>('idle');

    const filtered = filter === 'todos' ? mockBusinesses : mockBusinesses.filter(b => b.type === filter);

    const handleGetLocation = () => {
        setLocationState('loading');
        // Le pedimos permiso al navegador
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                () => {
                    setTimeout(() => setLocationState('found'), 1500); // Simulamos la búsqueda
                },
                () => { alert("Por favor permite el acceso a tu ubicación."); setLocationState('idle'); }
            );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800">Marketplace</h1>
                        <p className="text-slate-500 mt-1">Encuentra veterinarias y tiendas cerca de ti.</p>
                    </div>

                    <button
                        onClick={handleGetLocation}
                        disabled={locationState === 'loading'}
                        className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all"
                    >
                        {locationState === 'idle' && <><Navigation size={18} /> Usar mi ubicación GPS</>}
                        {locationState === 'loading' && <><Loader2 size={18} className="animate-spin" /> Buscando cerca...</>}
                        {locationState === 'found' && <><MapPin size={18} className="text-emerald-400" /> Ubicación Activa</>}
                    </button>
                </div>

                {/* Simulación del MAPA si ya encontró la ubicación */}
                <AnimatePresence>
                    {locationState === 'found' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8">
                            <div className="bg-slate-200 h-48 rounded-3xl border-2 border-slate-300 relative overflow-hidden flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                                <div className="absolute inset-0 bg-teal-900/10 backdrop-blur-[1px]"></div>
                                <div className="z-10 flex flex-col items-center">
                                    <MapPin size={40} className="text-rose-500 mb-2 drop-shadow-lg" />
                                    <span className="bg-white px-4 py-2 rounded-full text-sm font-bold shadow-md">Estás en Quito, sector Centro Norte</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Filtros */}
                <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                    <button onClick={() => setFilter('todos')} className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${filter === 'todos' ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>Todos</button>
                    <button onClick={() => setFilter('veterinaria')} className={`px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${filter === 'veterinaria' ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}><Stethoscope size={16} /> Vets</button>
                    <button onClick={() => setFilter('tienda')} className={`px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${filter === 'tienda' ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}><ShoppingBag size={16} /> Tiendas</button>
                </div>

                {/* Tarjetas con indicador de Distancia */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(biz => (
                        <motion.div key={biz.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="h-40 overflow-hidden relative">
                                <img src={biz.image} alt={biz.name} className="w-full h-full object-cover" />
                                {locationState === 'found' && (
                                    <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                        <Navigation size={12} /> A {biz.distance} de ti
                                    </span>
                                )}
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-slate-800">{biz.name}</h3>
                                    <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg text-xs font-extrabold"><Star size={12} className="fill-current" /> {biz.rating}</span>
                                </div>
                                <p className="flex items-center gap-2 text-slate-500 text-sm"><MapPin size={14} className="text-teal-600" /> {biz.address}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}