import express from 'express';
import { scheduleController } from '../controllers/scheduleController.js';
import { 
  validateScheduleConfig, 
  validateScheduleBlock, 
  validateId 
} from '../validations/scheduleValidation.js';

const router = express.Router();

router.get('/', scheduleController.getAll);
router.get('/config', scheduleController.getConfig);
router.put('/config', validateScheduleConfig, scheduleController.updateConfig);
router.get('/check-config', scheduleController.checkConfig);
router.post('/generate', scheduleController.generate);
router.get('/export/excel', scheduleController.exportToExcel);
router.get('/stats', scheduleController.getStats);

// Rutas con validación de ID
router.get('/block/:id', validateId, scheduleController.getBlock);
router.post('/block', validateScheduleBlock, scheduleController.createBlock);
router.put('/block/:id', [validateId, validateScheduleBlock], scheduleController.updateBlock);
router.delete('/block/:id', validateId, scheduleController.deleteBlock);

export default router;