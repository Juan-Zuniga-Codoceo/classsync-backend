// src/routes/courseRoutes.js
import express from 'express';
import courseController from '../controllers/courseController.js';

const router = express.Router();

// Rutas para cursos
router.get('/', courseController.getAll);
router.get('/:id', courseController.getById);
router.post('/', courseController.create);
router.put('/:id', courseController.update);
router.delete('/:id', courseController.delete);

export default router;