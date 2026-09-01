import { useState, useEffect, useRef } from 'react';
import { Store, Phone, MapPin, Clock, Info, CheckCircle, CalendarDays, PawPrint, ClipboardList, ImagePlus, Loader2, LogOut, ChevronDown, Navigation } from 'lucide-react';
import { useToast } from '../components/ToastProvider';
import { useNavigate } from 'react-router-dom';

const DAY_OPTIONS = [
    { key: 'LUN', label: 'Lun' },
    { key: 'MAR', label: 'Mar' },
    { key: 'MIE', label: 'Mié' },
    { key: 'JUE', label: 'Jue' },
    { key: 'VIE', label: 'Vie' },
    { key: 'SAB', label: 'Sáb' },
    { key: 'DOM', label: 'Dom' },
];

export default function BusinessDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const [activeTab, setActiveTab] = useState('PERFIL');
    const [profileLoaded, setProfileLoaded] = useState(false);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<any[]>([]);

    const showToast = useToast();
    const [saved, setSaved] = useState(false);
    const [finalizingAppt, setFinalizingAppt] = useState<any>(null);
    const [finalizeNote, setFinalizeNote] = useState('');
    const [gettingLocation, setGettingLocation] = useState(false);
    const [locationStatus, setLocationStatus] = useState('');

    const [formData, setFormData] = useState({
        ownerId: currentUser.id,
        name: currentUser.name || '',
        type: currentUser.role,
        description: '',
        address: '',
        phone: '',
        is24_7: false,
        services: '',
        imageUrl: '',
        latitude: null as number | null,
        longitude: null as number | null,
        workDays: [] as string[],
        openTime: '09:00',
        closeTime: '18:00',
        slotMinutes: 30
    });

    const handleGetLocation = () => {
        if (!('geolocation' in navigator)) {
            showToast('Tu navegador no soporta geolocalización', 'error');
            return;
        }
        setGettingLocation(true);
        setLocationStatus('');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const latFormatted = Number(latitude.toFixed(6));
                const lngFormatted = Number(longitude.toFixed(6));
                setFormData(prev => ({
                    ...prev,
                    latitude: latFormatted,
                    longitude: lngFormatted
                }));
                setGettingLocation(false);
                setLocationStatus('Ubicación capturada ✓');
                showToast('Ubicación capturada con éxito', 'success');
            },
            (error) => {
                setGettingLocation(false);
                setLocationStatus('');
                showToast('No se pudo obtener la ubicación: ' + error.message, 'error');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const toggleDay = (day: string) => {
        setFormData(prev => ({
            ...prev,
            workDays: prev.workDays.includes(day) ? prev.workDays.filter(d => d !== day) : [...prev.workDays, day]
        }));
    };

    useEffect(() => {
        if (activeTab === 'CITAS') {
            fetch(`http://localhost:3001/api/appointments/business/${currentUser.id}`)
                .then(res => res.json())
                .then(data => setAppointments(data));
        }
    }, [activeTab, currentUser.id]);

    useEffect(() => {
        if (!currentUser.id) { setProfileLoaded(true); return; }
        fetch('http://localhost:3001/api/business')
            .then(res => res.json())
            .then((businesses: any[]) => {
                const mine = businesses.find(b => b.ownerId === currentUser.id);
                if (mine) {
                    setFormData({
                        ownerId: mine.ownerId,
                        name: mine.name || '',
                        type: mine.type || currentUser.role,
                        description: mine.description || '',
                        address: mine.address || '',
                        phone: mine.phone || '',
                        is24_7: Boolean(mine.is24_7),
                        services: mine.services || '',
                        imageUrl: mine.imageUrl || '',
                        latitude: mine.latitude ?? null,
                        longitude: mine.longitude ?? null,
                        workDays: mine.workDays || [],
                        openTime: mine.openTime || '09:00',
                        closeTime: mine.closeTime || '18:00',
                        slotMinutes: mine.slotMinutes || 30
                    });
                    if (mine.latitude && mine.longitude) {
                        setLocationStatus('Ubicación previa guardada ✓');
                    }
                    setActiveTab('CITAS');
                }
            })
            .catch(error => console.error("Error al cargar el perfil existente:", error))
            .finally(() => setProfileLoaded(true));
    }, [currentUser.id]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => setFormData({ ...formData, imageUrl: reader.result as string });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/api/business', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                setSaved(true);
                setTimeout(() => {
                    setSaved(false);
                    setActiveTab('CITAS');
                }, 1500);
            }
        } catch (error) {
            console.error("Error al guardar perfil de negocio:", error);
        }
    };

    const handleFinalize = async () => {
        if (!finalizingAppt || !finalizeNote.trim()) return;

        await fetch(`http://localhost:3001/api/appointments/${finalizingAppt.id}/finalize`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ petId: finalizingAppt.petId, action: finalizeNote, vetName: currentUser.name })
        });

        showToast('¡Carnet digital actualizado y cita finalizada!', 'success');
        setFinalizingAppt(null);
        setFinalizeNote('');
        setActiveTab('PERFIL');
        setTimeout(() => setActiveTab('CITAS'), 100);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setAccountMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    if (!profileLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
                <Loader2 className="animate-spin text-teal-600" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-start justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
                            <Store className="text-teal-600" size={32} />
                            Panel de Mi Negocio
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {activeTab === 'CITAS' ? 'Gestiona tus citas médicas y pacientes.' : 'Configura la información pública de tu negocio.'}
                        </p>
                        {activeTab === 'PERFIL' && (
                            <button
                                type="button"
                                onClick={() => setActiveTab('CITAS')}
                                className="text-teal-600 hover:text-teal-700 text-sm font-bold mt-2 flex items-center gap-1"
                            >
                                ← Volver a la Agenda
                            </button>
                        )}
                    </div>

                    {/* MENÚ DE CUENTA */}
                    <div className="relative shrink-0" ref={menuRef}>
                        <button
                            type="button"
                            onClick={() => setAccountMenuOpen(o => !o)}
                            className="flex items-center gap-2 bg-white border border-slate-200 rounded-full pl-1 pr-3 py-1 shadow-sm hover:shadow-md transition-all"
                        >
                            <span className="w-10 h-10 rounded-full overflow-hidden bg-teal-600 text-white flex items-center justify-center font-bold shrink-0">
                                {formData.imageUrl ? (
                                    <img src={formData.imageUrl} alt={formData.name || 'Mi negocio'} className="w-full h-full object-cover" />
                                ) : (
                                    (formData.name || 'N').charAt(0).toUpperCase()
                                )}
                            </span>
                            <ChevronDown size={16} className={`text-slate-400 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {accountMenuOpen && (
                            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-30">
                                <div className="px-4 py-2.5 border-b border-slate-100">
                                    <p className="text-sm font-bold text-slate-800 truncate">{formData.name || 'Mi negocio'}</p>
                                    <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setActiveTab('PERFIL'); setAccountMenuOpen(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                >
                                    <Store size={16} /> Editar Perfil
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setActiveTab('CITAS'); setAccountMenuOpen(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                >
                                    <CalendarDays size={16} /> Agenda y Pacientes
                                </button>
                                <div className="border-t border-slate-100 mt-1 pt-1">
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-rose-500 hover:bg-rose-50 flex items-center gap-2"
                                    >
                                        <LogOut size={16} /> Cerrar Sesión
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* FORMULARIO DE PERFIL */}
                {activeTab === 'PERFIL' && (
                    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Nombre del Negocio</label>
                            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-teal-600" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-600 mb-1 flex items-center gap-2"><Info size={16} /> Descripción corta</label>
                            <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-teal-600" rows={3} placeholder="¿Qué hace especial a tu negocio?"></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1 flex items-center gap-2"><MapPin size={16} /> Dirección</label>
                            <input type="text" required value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-teal-600" placeholder="Ej. Av. Principal 123" />
                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                                <button
                                    type="button"
                                    onClick={handleGetLocation}
                                    disabled={gettingLocation}
                                    className="text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {gettingLocation ? <Loader2 size={13} className="animate-spin" /> : <Navigation size={13} />}
                                    📍 Usar mi ubicación actual
                                </button>
                                {locationStatus && (
                                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                        {locationStatus}
                                    </span>
                                )}
                                {formData.latitude && formData.longitude && !locationStatus && (
                                    <span className="text-xs text-slate-400">
                                        ({formData.latitude}, {formData.longitude})
                                    </span>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1 flex items-center gap-2"><Phone size={16} /> Teléfono de contacto</label>
                            <input type="text" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-teal-600" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Servicios o Productos (separados por coma)</label>
                            <input type="text" required value={formData.services} onChange={e => setFormData({ ...formData, services: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-teal-600" placeholder="Ej. Consultas, Vacunas, Cirugías" />
                        </div>

                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="is247" checked={formData.is24_7} onChange={e => setFormData({ ...formData, is24_7: e.target.checked })} className="w-5 h-5 text-teal-600 rounded border-slate-300 focus:ring-teal-500" />
                            <label htmlFor="is247" className="text-sm font-semibold text-slate-600 flex items-center gap-2"><Clock size={16} className="text-teal-600" /> ¿Atienden 24/7?</label>
                        </div>

                        <div className="md:col-span-2 border-t border-slate-100 pt-6 mt-2">
                            <label className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                                <CalendarDays size={16} /> Horario de atención
                                {formData.is24_7 && <span className="text-xs font-normal text-slate-400">(no aplica, atienden 24/7)</span>}
                            </label>

                            <div className={`flex flex-wrap gap-2 mb-4 ${formData.is24_7 ? 'opacity-40' : ''}`}>
                                {DAY_OPTIONS.map(day => (
                                    <button
                                        key={day.key}
                                        type="button"
                                        disabled={formData.is24_7}
                                        onClick={() => toggleDay(day.key)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:cursor-not-allowed ${
                                            formData.workDays.includes(day.key)
                                                ? 'bg-teal-600 text-white border-teal-600'
                                                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>

                            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${formData.is24_7 ? 'opacity-40' : ''}`}>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Hora de apertura</label>
                                    <input type="time" disabled={formData.is24_7} value={formData.openTime} onChange={e => setFormData({ ...formData, openTime: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm disabled:bg-slate-50" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Hora de cierre</label>
                                    <input type="time" disabled={formData.is24_7} value={formData.closeTime} onChange={e => setFormData({ ...formData, closeTime: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm disabled:bg-slate-50" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Duración por cita</label>
                                    <select disabled={formData.is24_7} value={formData.slotMinutes} onChange={e => setFormData({ ...formData, slotMinutes: Number(e.target.value) })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm disabled:bg-slate-50">
                                        <option value={15}>15 minutos</option>
                                        <option value={30}>30 minutos</option>
                                        <option value={45}>45 minutos</option>
                                        <option value={60}>60 minutos</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 border-t border-slate-100 pt-6 mt-2">
                            <label className="block text-sm font-semibold text-slate-600 mb-1 flex items-center gap-2"><ImagePlus size={16} /> Foto principal del negocio</label>
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                                    {formData.imageUrl ? (
                                        <img src={formData.imageUrl} alt="Vista previa" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImagePlus size={24} className="text-slate-300" />
                                    )}
                                </div>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                            </div>
                        </div>

                        <div className="md:col-span-2 flex justify-end mt-4 gap-4 items-center">
                            {saved && <span className="text-emerald-600 font-bold flex items-center gap-2"><CheckCircle size={20} /> ¡Guardado!</span>}
                            <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-all">
                                Guardar Perfil
                            </button>
                        </div>
                    </form>
                )}

                {/* VISTA DE CITAS */}
                {activeTab === 'CITAS' && (
                    <div>
                        {appointments.length > 0 && (
                            <div className="flex flex-wrap gap-4 mb-6">
                                <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                    <span className="text-2xl font-extrabold text-slate-800">{appointments.length}</span>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Citas totales</span>
                                </div>
                                <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                    <span className="text-2xl font-extrabold text-amber-600">{appointments.filter(a => a.status === 'PENDIENTE').length}</span>
                                    <span className="text-xs font-bold text-amber-500 uppercase tracking-wide">Pendientes</span>
                                </div>
                                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm">
                                    <span className="text-2xl font-extrabold text-emerald-600">{appointments.filter(a => a.status !== 'PENDIENTE').length}</span>
                                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-wide">Completadas</span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {appointments.map(appt => (
                                <div key={appt.id} className="relative bg-white p-6 pl-8 rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                    <span className={`absolute left-0 top-0 h-full w-1.5 ${appt.status === 'PENDIENTE' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                                    <div className="flex items-start gap-4">
                                        <div className="w-11 h-11 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                                            <PawPrint size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800">{appt.petName}</h3>
                                            <p className="text-sm text-slate-500 flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                                <span className="flex items-center gap-1"><CalendarDays size={14} /> {appt.date}</span>
                                                <span className="flex items-center gap-1"><Clock size={14} /> {appt.time}</span>
                                            </p>
                                            <p className="text-teal-700 font-semibold mt-2">Motivo: {appt.reason}</p>
                                        </div>
                                    </div>
                                    <div className="sm:pl-4">
                                        {appt.status === 'PENDIENTE' ? (
                                            <button onClick={() => setFinalizingAppt(appt)} className="bg-slate-800 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-slate-900 shadow-md whitespace-nowrap">
                                                Finalizar y Actualizar Carnet
                                            </button>
                                        ) : (
                                            <span className="text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl text-sm flex items-center gap-2 w-fit">
                                                <CheckCircle size={16} /> Completada
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {appointments.length === 0 && (
                                <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
                                    <ClipboardList size={40} className="text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500">No tienes citas agendadas aún.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* MODAL FINALIZAR CITA (reemplaza el prompt() feo del navegador) */}
                {finalizingAppt && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
                            <h3 className="text-xl font-bold mb-1 text-slate-800">Finalizar cita</h3>
                            <p className="text-sm text-slate-500 mb-4">
                                ¿Qué servicio o tratamiento se le realizó a{' '}
                                <span className="font-semibold text-teal-700">{finalizingAppt.petName}</span>?
                                Esto quedará registrado en su carnet digital.
                            </p>
                            <textarea
                                autoFocus
                                value={finalizeNote}
                                onChange={e => setFinalizeNote(e.target.value)}
                                rows={3}
                                placeholder="Ej. Vacuna antirrábica aplicada, desparasitación..."
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-teal-600"
                            />
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => { setFinalizingAppt(null); setFinalizeNote(''); }}
                                    className="px-4 py-2 text-slate-500 font-bold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    disabled={!finalizeNote.trim()}
                                    onClick={handleFinalize}
                                    className="bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl font-bold"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}