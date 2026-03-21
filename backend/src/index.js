import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { connectDB } from './lib/db.js';
import { corsOptions } from './config/cors.js';
import { setupMiddleware } from './config/middleware.js';
import { initializeSocket } from './config/socket.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { healthCheck } from './routes/health.js';
import authRouter from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import groupRoutes from './routes/group.route.js';

// Load environment variables
dotenv.config();

// Environment validation
const requiredEnvVars = ['MONGODB_URL', 'JWT_SECRET', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missing = requiredEnvVars.filter(key => !process.env[key]);

if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nPlease check your .env file or environment configuration.');
    process.exit(1);
}

console.log('✅ Environment variables validated successfully');

const app = express();
const server = http.createServer(app);

// Apply CORS middleware
app.use(cors(corsOptions));

// Setup body parsing middleware
setupMiddleware(app);

// Export io for use in controllers
export const io = initializeSocket(server);

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);
app.get("/health", healthCheck);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
    try {
        // Connect to database first
        await connectDB();

        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
