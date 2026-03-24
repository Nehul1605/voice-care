import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Routes Imports
import healthRoutes from './routes/health.routes.js';
import patientRoutes from './routes/patient.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import callRoutes from './routes/call.routes.js';

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: '*', // Set to specific domain in prod
    credentials: true
})); 
app.use(morgan('dev')); // Logger
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Mount Routes
app.use('/api/health', healthRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/calls', callRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Smart VoiceCare API is running 🚀',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// 404 Route handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: "Endpoint not found"
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // If we throw our custom ApiError, handle it gracefully
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    res.status(statusCode).json({
        success: false,
        message: message,
        errors: err.errors || [],
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

export default app;
