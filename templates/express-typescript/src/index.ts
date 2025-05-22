import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { router } from './routes/index.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', router);

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the API',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
