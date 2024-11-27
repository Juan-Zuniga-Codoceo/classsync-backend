// src/routes/configRoutes.js
import express from 'express';
import { configController } from '../controllers/configController.js';

const router = express.Router();

router.get('/general', configController.getGeneralConfig);
router.put('/general', configController.updateGeneralConfig);
router.get('/schedule', configController.getScheduleConfig);
router.put('/schedule', configController.updateScheduleConfig);

export default router;