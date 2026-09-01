import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- 1. USUARIOS ---
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ error: "El correo ya está registrado" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: { name, email, role, password: hashedPassword }
        });
        res.json({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role });
    } catch (error) {
        res.status(500).json({ error: "Error al registrar" });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) return res.status(401).json({ error: "Contraseña incorrecta" });

        res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
});

// --- 2. MASCOTAS ---
app.get('/api/pets/:ownerId', async (req, res) => {
    const { ownerId } = req.params;
    const pets = await prisma.pet.findMany({
        where: { ownerId },
        orderBy: { createdAt: 'desc' }
    });
    res.json(pets);
});

app.post('/api/pets', async (req, res) => {
    const { name, type, breed, age, allergies, imageUrl, ownerId } = req.body;
    const newPet = await prisma.pet.create({
        data: { name, type, breed, age, allergies, imageUrl, ownerId }
    });
    res.json(newPet);
});

app.delete('/api/pets/:id', async (req, res) => {
    const { id } = req.params;
    await prisma.pet.delete({ where: { id } });
    res.json({ message: "Eliminada" });
});

// --- 3. NEGOCIOS PARA EL MARKETPLACE ---
app.post('/api/business', async (req, res) => {
    const { ownerId, name, type, description, address, phone, is24_7, services, imageUrl, workDays, openTime, closeTime, slotMinutes } = req.body;
    const data = {
        name, type, description, address, phone, is24_7, services, imageUrl,
        workDays: workDays || [],
        openTime: openTime || null,
        closeTime: closeTime || null,
        slotMinutes: slotMinutes || 30
    };
    const business = await prisma.business.upsert({
        where: { ownerId },
        update: data,
        create: { ownerId, ...data }
    });
    res.json(business);
});

app.get('/api/business', async (req, res) => {
    const businesses = await prisma.business.findMany();
    res.json(businesses);
});

// Calcula los horarios libres de un negocio para una fecha dada, según su
// horario configurado (workDays/openTime/closeTime/slotMinutes) y las citas
// que ya existan ese día.
app.get('/api/appointments/available', async (req, res) => {
    const { businessId, date } = req.query;
    if (!businessId || !date) {
        return res.status(400).json({ error: "Faltan businessId o date" });
    }
    try {
        const business = await prisma.business.findUnique({ where: { ownerId: String(businessId) } });
        if (!business) return res.status(404).json({ error: "Negocio no encontrado" });

        const DAYS = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
        const dayAbbr = DAYS[new Date(`${date}T00:00:00Z`).getUTCDay()];

        const isOpenToday = business.is24_7 || (business.workDays || []).includes(dayAbbr);
        if (!isOpenToday) {
            return res.json({ closed: true, slots: [] });
        }

        const openTime = business.is24_7 ? '00:00' : (business.openTime || '09:00');
        const closeTime = business.is24_7 ? '23:59' : (business.closeTime || '18:00');
        const slotMinutes = business.slotMinutes || 30;

        const [openH, openM] = openTime.split(':').map(Number);
        const [closeH, closeM] = closeTime.split(':').map(Number);
        let cursor = openH * 60 + openM;
        const end = closeH * 60 + closeM;

        const allSlots = [];
        while (cursor + slotMinutes <= end) {
            const h = String(Math.floor(cursor / 60)).padStart(2, '0');
            const m = String(cursor % 60).padStart(2, '0');
            allSlots.push(`${h}:${m}`);
            cursor += slotMinutes;
        }

        const taken = await prisma.appointment.findMany({
            where: { businessId: String(businessId), date: String(date) },
            select: { time: true }
        });
        const takenSet = new Set(taken.map(t => t.time));

        res.json({ closed: false, slots: allSlots.filter(s => !takenSet.has(s)) });
    } catch (error) {
        console.error("Error al calcular horarios disponibles:", error);
        res.status(500).json({ error: "Error al calcular horarios disponibles" });
    }
});

// --- 4. RUTAS DE CITAS Y CARNET DIGITAL ---
app.post('/api/appointments', async (req, res) => {
    const { petId, petName, ownerId, businessId, date, time, reason } = req.body;
    try {
        const newAppt = await prisma.appointment.create({
            data: { petId, petName, ownerId, businessId, date, time, reason }
        });
        res.json(newAppt);
    } catch (error) {
        // P2002 = choque con la restricción @@unique([businessId, date, time]):
        // alguien más ya agendó justo ese horario un instante antes.
        if (error.code === 'P2002') {
            return res.status(409).json({ error: "Ese horario ya fue reservado por alguien más. Elige otro." });
        }
        console.error("Error al crear cita:", error);
        res.status(500).json({ error: "Error al agendar la cita" });
    }
});

app.get('/api/appointments/business/:businessId', async (req, res) => {
    const { businessId } = req.params;
    const appts = await prisma.appointment.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' }
    });
    res.json(appts);
});

// Citas vistas desde el lado del dueño de mascota (para el apartado
// "Mis Próximas Citas" que se ve al iniciar sesión en /mascotas).
app.get('/api/appointments/owner/:ownerId', async (req, res) => {
    const { ownerId } = req.params;
    try {
        const appts = await prisma.appointment.findMany({
            where: { ownerId },
            orderBy: { date: 'asc' }
        });
        const businesses = await prisma.business.findMany();
        const withBusinessName = appts.map(appt => {
            // businessId guarda el ownerId del negocio, no el id de Business.
            const biz = businesses.find(b => b.ownerId === appt.businessId);
            return { ...appt, businessName: biz ? biz.name : 'Negocio' };
        });
        res.json(withBusinessName);
    } catch (error) {
        res.status(500).json({ error: "Error al cargar tus citas" });
    }
});

app.put('/api/appointments/:id/finalize', async (req, res) => {
    const { id } = req.params;
    const { petId, action, vetName } = req.body;

    try {
        const updatedAppt = await prisma.appointment.update({
            where: { id },
            data: { status: "FINALIZADA" }
        });

        const pet = await prisma.pet.findUnique({ where: { id: petId } });
        let currentHistory = [];
        if (pet.history) {
            currentHistory = typeof pet.history === 'string' ? JSON.parse(pet.history) : pet.history;
        }

        const newRecord = {
            date: new Date().toLocaleDateString(),
            action: action,
            vet: vetName
        };

        await prisma.pet.update({
            where: { id: petId },
            data: { history: currentHistory.concat(newRecord) }
        });

        res.json(updatedAppt);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar carnet" });
    }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Motor corriendo en http://localhost:${PORT}`));