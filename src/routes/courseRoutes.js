// src/routes/courseRoutes.js
import express from 'express';
import { courseController } from '../controllers/courseController.js';

const router = express.Router();

// Verificar que todos los métodos del controlador existan antes de asignarlos
const {
  getAll,
  getById,
  create,
  update,
  delete: deleteMethod
} = courseController;

// Asignar las rutas solo si los métodos existen
if (getAll) router.get('/', getAll);
if (getById) router.get('/:id', getById);
if (create) router.post('/', create);
if (update) router.put('/:id', update);
if (deleteMethod) router.delete('/:id', deleteMethod);

export default router;