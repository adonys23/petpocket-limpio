import { CheckCircle, XCircle } from 'lucide-react';

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-800 mb-6">Panel de Administración</h1>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-100 font-semibold text-slate-700">
                        Solicitudes de Negocios Pendientes
                    </div>
                    <div className="p-4 flex items-center justify-between border-b hover:bg-slate-50">
                        <div>
                            <h4 className="font-bold text-slate-800">Clínica Patitas</h4>
                            <p className="text-sm text-slate-500">Veterinaria - Solicitado hoy</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"><CheckCircle size={20} /></button>
                            <button className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"><XCircle size={20} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}