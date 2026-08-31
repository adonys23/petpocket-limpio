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
    const { ownerId, name, type, description, address, phone, is24_7, services, imageUrl } = req.body;
    const business = await prisma.business.upsert({
        where: { ownerId },
        update: { name, type, description, address, phone, is24_7, services, imageUrl },
        create: { ownerId, name, type, description, address, phone, is24_7, services, imageUrl }
    });
    res.json(business);
});

app.get('/api/business', async (req, res) => {
    const businesses = await prisma.business.findMany();
    res.json(businesses);
});

// --- 4. RUTAS DE CITAS Y CARNET DIGITAL ---
app.post('/api/appointments', async (req, res) => {
    const { petId, petName, ownerId, businessId, date, time, reason } = req.body;
    const newAppt = await prisma.appointment.create({
        data: { petId, petName, ownerId, businessId, date, time, reason }
    });
    res.json(newAppt);
});

app.get('/api/appointments/business/:businessId', async (req, res) => {
    const { businessId } = req.params;
    const appts = await prisma.appointment.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' }
    });
    res.json(appts);
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