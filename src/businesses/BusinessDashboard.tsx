import { Calendar, Users, DollarSign, Clock, CheckCircle, Package, ShoppingBag, Truck } from 'lucide-react';

export default function BusinessDashboard() {
    const businessType = localStorage.getItem('businessType') || 'VETERINARIA';
    const isShop = businessType === 'TIENDA';

    // Datos falsos para Vet/Spa
    const appointments = [
        { id: 1, time: '09:00', pet: 'Luna', type: 'Gato', owner: 'Carlos M.', reason: isShop ? '-' : 'Control mensual' },
        { id: 2, time: '14:30', pet: 'Max', type: 'Perro', owner: 'Adonys C.', reason: isShop ? '-' : 'Vacunación Anual' }
    ];

    // Datos falsos para Tienda
    const orders = [
        { id: 101, item: 'Saco Royal Canin 15kg', client: 'Ana G.', total: '$65.00', status: 'Por entregar' },
        { id: 102, item: 'Juguete Kong + Correa', client: 'Luis P.', total: '$22.50', status: 'Enviado' }
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-800">
                        {isShop ? 'Panel de Tienda de Mascotas' : 'Panel Clínico y Agenda'}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {isShop ? 'Gestiona tu inventario y pedidos del día.' : 'Gestiona tu agenda y revisa el historial de pacientes.'}
                    </p>
                </div>

                {/* Métricas cambian según el tipo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-bold text-slate-400 uppercase">{isShop ? 'Pedidos Hoy' : 'Pacientes Hoy'}</span>
                            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">{isShop ? <ShoppingBag size={22} /> : <Users size={22} />}</div>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-800">{isShop ? '12 Pedidos' : '8 Citas'}</h2>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-bold text-slate-400 uppercase">Ingresos Estimados</span>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><DollarSign size={22} /></div>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-800">{isShop ? '$245.00' : '$450.00'}</h2>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-bold text-slate-400 uppercase">{isShop ? 'Stock Bajo' : 'Pendientes'}</span>
                            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">{isShop ? <Package size={22} /> : <Clock size={22} />}</div>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-800">{isShop ? '3 Prod.' : '2 Turnos'}</h2>
                    </div>
                </div>

                {/* Tabla dinámica */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            {isShop ? <><Package size={20} className="text-teal-600" /> Pedidos Recientes</> : <><Calendar size={20} className="text-teal-600" /> Agenda de Hoy</>}
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        {isShop ? (
                            // VISTA DE TIENDA
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                                        <th className="p-4 font-semibold">ID Pedido</th>
                                        <th className="p-4 font-semibold">Producto</th>
                                        <th className="p-4 font-semibold">Cliente</th>
                                        <th className="p-4 font-semibold">Total</th>
                                        <th className="p-4 font-semibold">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {orders.map(order => (
                                        <tr key={order.id} className="hover:bg-slate-50">
                                            <td className="p-4 font-bold text-slate-700">#{order.id}</td>
                                            <td className="p-4 font-medium text-slate-800">{order.item}</td>
                                            <td className="p-4 text-sm text-slate-600">{order.client}</td>
                                            <td className="p-4 font-bold text-emerald-600">{order.total}</td>
                                            <td className="p-4"><span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1 w-max"><Truck size={12} /> {order.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            // VISTA DE VET/SPA
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                                        <th className="p-4 font-semibold">Hora</th>
                                        <th className="p-4 font-semibold">Paciente</th>
                                        <th className="p-4 font-semibold">Motivo</th>
                                        <th className="p-4 font-semibold">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {appointments.map(app => (
                                        <tr key={app.id} className="hover:bg-slate-50">
                                            <td className="p-4 font-bold text-slate-700">{app.time}</td>
                                            <td className="p-4 font-medium text-slate-800">{app.pet} <span className="text-xs text-slate-500 block">{app.type}</span></td>
                                            <td className="p-4 text-sm text-slate-600">{app.reason}</td>
                                            <td className="p-4"><button className="bg-teal-50 text-teal-700 hover:bg-teal-100 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1"><CheckCircle size={14} /> Finalizar</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}