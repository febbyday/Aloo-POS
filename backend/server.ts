import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import loyaltyRoutes from './src/routes/loyalty';

// Initialize environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Add root route handler
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the POS System API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/v1/health',
      api: '/api/v1',
      loyalty: '/api/v1/loyalty'
    }
  });
});

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Mount routes
app.use('/api/v1/loyalty', loyaltyRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/v1`);
});

export default app;