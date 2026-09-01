import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
    id: number;
    message: string;
    type: ToastType;
}

type ShowToast = (message: string, type?: ToastType) => void;

const ToastContext = createContext<ShowToast>(() => {});

// Hook para lanzar notificaciones desde cualquier componente:
// const showToast = useToast();
// showToast('¡Cita agendada con éxito!');
// showToast('Algo salió mal', 'error');
export function useToast() {
    return useContext(ToastContext);
}

const ICONS: Record<ToastType, ReactNode> = {
    success: <CheckCircle2 className="text-emerald-500 shrink-0" size={22} />,
    error: <XCircle className="text-rose-500 shrink-0" size={22} />,
    info: <Info className="text-teal-500 shrink-0" size={22} />,
};

const BAR_COLORS: Record<ToastType, string> = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    info: 'bg-teal-500',
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const dismiss = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback<ShowToast>((message, type = 'success') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => dismiss(id), 4000);
    }, [dismiss]);

    return (
        <ToastContext.Provider value={showToast}>
            {children}

            <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 w-[calc(100%-2.5rem)] max-w-sm pointer-events-none">
                <AnimatePresence>
                    {toasts.map(t => (
                        <motion.div
                            key={t.id}
                            layout
                            initial={{ opacity: 0, y: -16, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 60, scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className="relative pointer-events-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex items-start gap-3 p-4 pl-5"
                        >
                            <span className={`absolute left-0 top-0 h-full w-1.5 ${BAR_COLORS[t.type]}`} />
                            <div className="pt-0.5">{ICONS[t.type]}</div>
                            <p className="text-sm font-semibold text-slate-700 flex-1 leading-snug">{t.message}</p>
                            <button
                                onClick={() => dismiss(t.id)}
                                className="text-slate-300 hover:text-slate-500 transition-colors shrink-0"
                                aria-label="Cerrar notificación"
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
