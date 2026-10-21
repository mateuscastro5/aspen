import { Router } from 'express';
import { exampleService } from '../services/example.service.js';

export const routes = Router();

routes.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

routes.get('/examples', (_req, res) => {
  res.json(exampleService.list());
});

routes.post('/examples', (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if (!name) {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  res.status(201).json(exampleService.create(name));
});
