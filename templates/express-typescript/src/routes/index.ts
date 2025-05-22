import express from 'express';
import { exampleController } from '../controllers/example.controller.js';

const router = express.Router();

// Example routes
router.get('/examples', exampleController.getAll);
router.get('/examples/:id', exampleController.getById);
router.post('/examples', exampleController.create);
router.put('/examples/:id', exampleController.update);
router.delete('/examples/:id', exampleController.remove);

export { router };
