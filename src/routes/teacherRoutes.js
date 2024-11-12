import express from 'express';
import { teacherController } from '../controllers/teacherController.js';

const router = express.Router();

// Rutas para profesores
router.get('/', teacherController.getAll);
router.get('/:id', teacherController.getById);
router.post('/', teacherController.create);
router.put('/:id', teacherController.update);
router.delete('/:id', teacherController.delete);

export default router;