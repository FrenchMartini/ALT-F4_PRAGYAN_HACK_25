import { Router, Request, Response } from 'express';

const router = Router();

// Example route
router.get('/api/example', (req: Request, res: Response): void => {
  res.json({ message: 'Hello from the API!' });
});

export default router;
