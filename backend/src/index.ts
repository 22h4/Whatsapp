import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize WhatsApp client
const whatsappClient = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox'],
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
}));
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
}));

// WhatsApp event handlers
whatsappClient.on('qr', async (qr) => {
  try {
    const qrCode = await qrcode.toDataURL(qr);
    io.emit('whatsapp:qr', qrCode);
  } catch (error) {
    console.error('Error generating QR code:', error);
  }
});

whatsappClient.on('ready', () => {
  console.log('WhatsApp client is ready!');
  io.emit('whatsapp:ready');
});

whatsappClient.on('authenticated', () => {
  console.log('WhatsApp client is authenticated!');
  io.emit('whatsapp:authenticated');
});

whatsappClient.on('auth_failure', () => {
  console.log('WhatsApp authentication failed!');
  io.emit('whatsapp:auth_failure');
});

whatsappClient.on('disconnected', () => {
  console.log('WhatsApp client is disconnected!');
  io.emit('whatsapp:disconnected');
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Handle WhatsApp business API connection
  socket.on('whatsapp:connect:business', async (data) => {
    try {
      const { token, phoneId } = data;
      // Store the session in the database
      await prisma.whatsAppSession.create({
        data: {
          type: 'business',
          status: 'connected',
          token,
          phoneId,
        },
      });
      socket.emit('whatsapp:connected:business');
    } catch (error) {
      console.error('Error connecting to WhatsApp Business API:', error);
      socket.emit('whatsapp:error', { message: 'Failed to connect to WhatsApp Business API' });
    }
  });

  // Handle message sending
  socket.on('whatsapp:send:message', async (data) => {
    try {
      const { to, message } = data;
      const result = await whatsappClient.sendMessage(to, message);
      socket.emit('whatsapp:message:sent', { id: result.id });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('whatsapp:error', { message: 'Failed to send message' });
    }
  });
});

// API Routes
import authRoutes from './routes/auth';
import contactRoutes from './routes/contacts';
import groupRoutes from './routes/groups';
import messageRoutes from './routes/messages';
import settingsRoutes from './routes/settings';

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  whatsappClient.initialize();
}); 