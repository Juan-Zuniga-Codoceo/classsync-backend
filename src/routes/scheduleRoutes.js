// scheduleRoutes.js
import express from 'express';
import { scheduleController } from '../controllers/scheduleController.js';

const router = express.Router();

// Rutas principales
router.get('/', scheduleController.getAll);
router.get('/check-config', scheduleController.checkConfig);
router.get('/config', scheduleController.getConfig);
router.post('/config', scheduleController.updateConfig);
router.post('/generate', scheduleController.generate);
router.get('/export', scheduleController.exportToExcel);
router.get('/stats', scheduleController.getStats);

// Rutas para bloques específicos
router.get('/block/:id', scheduleController.getBlock);
router.post('/block', scheduleController.createBlock);
router.put('/block/:id', scheduleController.updateBlock);
router.delete('/block/:id', scheduleController.deleteBlock);

// Rutas para obtener bloques por profesor y curso
router.get('/teacher/:teacherId/blocks', scheduleController.getBlocksByTeacher);
router.get('/course/:courseId/blocks', scheduleController.getBlocksByCourse);

export default router;