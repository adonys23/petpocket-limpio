import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

// Configuraciones para que tu React pueda hablar con este servidor
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 1. RUTA: OBTENER TODAS LAS MASCOTAS
app.get('/api/pets', async (req, res) => {
    try {
        const pets = await prisma.pet.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(pets);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener mascotas" });
    }
});

// 2. RUTA: AGREGAR NUEVA MASCOTA
app.post('/api/pets', async (req, res) => {
    try {
        const { name, type, age, imageUrl } = req.body;
        const newPet = await prisma.pet.create({
            data: { name, type, age, imageUrl },
        });
        res.json(newPet);
    } catch (error) {
        res.status(500).json({ error: "Error al crear mascota" });
    }
});

// 3. RUTA: ELIMINAR MASCOTA
app.delete('/api/pets/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.pet.delete({ where: { id } });
        res.json({ message: "Mascota eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar mascota" });
    }
});

// ENCENDER EL SERVIDOR
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 El Motor (Backend) está corriendo perfecto en http://localhost:${PORT}`);
});