// src/routes/subjectRoutes.js
import express from 'express';
import { subjectController } from '../controllers/subjectController.js';

const router = express.Router();

router.get('/', subjectController.getAll);
router.get('/:id', subjectController.getById);
router.post('/', subjectController.create);
router.put('/:id', subjectController.update);
router.delete('/:id', subjectController.removeSubject);

export default router;