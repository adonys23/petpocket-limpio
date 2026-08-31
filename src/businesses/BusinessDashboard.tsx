import { useState, useEffect } from 'react';
import { Store, Phone, MapPin, Clock, Info, CheckCircle } from 'lucide-react';

export default function BusinessDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const [activeTab, setActiveTab] = useState('PERFIL');
    const [appointments, setAppointments] = useState<any[]>([]);

    const [saved, setSaved] = useState(false);
    const [formData, setFormData] = useState({
        ownerId: currentUser.id,
        name: currentUser.name || '',
        type: currentUser.role,
        description: '',
        address: '',
        phone: '',
        is24_7: false,
        services: '',
        imageUrl: ''
    });

    useEffect(() => {
        if (activeTab === 'CITAS') {
            fetch(`http://localhost:3001/api/appointments/business/${currentUser.id}`)
                .then(res => res.json())
                .then(data => setAppointments(data));
        }
    }, [activeTab, currentUser.id]);

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
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error("Error al guardar perfil de negocio:", error);
        }
    };

    const handleFinalize = async (appt: any) => {
        const action = prompt(`¿Qué servicio/tratamiento se le realizó a ${appt.petName}? (Esto irá a su carnet digital)`);
        if (!action) return;

        await fetch(`http://localhost:3001/api/appointments/${appt.id}/finalize`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ petId: appt.petId, action, vetName: currentUser.name })
        });

        alert("¡Carnet digital actualizado y cita finalizada!");
        setActiveTab('PERFIL');
        setTimeout(() => setActiveTab('CITAS'), 100);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
                        <Store className="text-teal-600" size={32} />
                        Panel de Mi Negocio
                    </h1>
                    <p className="text-slate-500 mt-1">Configura tu perfil y gestiona tus citas médicas.</p>
                </div>

                {/* PESTAÑAS */}
                <div className="flex gap-4 mb-8 border-b border-slate-200 pb-4">
                    <button onClick={() => setActiveTab('PERFIL')} className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'PERFIL' ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>Mi Perfil Público</button>
                    <button onClick={() => setActiveTab('CITAS')} className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'CITAS' ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>Agenda y Pacientes</button>
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
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Foto principal del negocio</label>
                            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
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
                    <div className="space-y-4">
                        {appointments.map(appt => (
                            <div key={appt.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">Paciente: {appt.petName}</h3>
                                    <p className="text-sm text-slate-500 flex gap-4 mt-1">
                                        <span>📅 {appt.date}</span>
                                        <span>⏰ {appt.time}</span>
                                    </p>
                                    <p className="text-teal-700 font-semibold mt-2">Motivo: {appt.reason}</p>
                                </div>
                                <div>
                                    {appt.status === 'PENDIENTE' ? (
                                        <button onClick={() => handleFinalize(appt)} className="bg-slate-800 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-slate-900 shadow-md">
                                            Finalizar y Actualizar Carnet
                                        </button>
                                    ) : (
                                        <span className="text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl">Completada</span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {appointments.length === 0 && <p className="text-slate-500 text-center py-10 bg-white rounded-3xl border border-slate-100">No tienes citas agendadas aún.</p>}
                    </div>
                )}
            </div>
        </div>
    );
}