import express from 'express';
import { authController } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', authController.login);
router.get('/validate', authController.validateToken);

export default router;