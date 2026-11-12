const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;

// Track active connections for the 2 partners
const activeSockets = new Map(); // userId ('partner1' | 'partner2') -> socketId

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'SoulSync Couple Signaling Server',
    activeUsers: Array.from(activeSockets.keys()),
  });
});

io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // Couple user registers connection
  socket.on('couple:join', ({ userId }) => {
    if (!userId) return;

    activeSockets.set(userId, socket.id);
    console.log(`[Couple Joined] ${userId} registered with socket ${socket.id}`);

    // Notify the other partner that this user came online
    socket.broadcast.emit('couple:partner_status', {
      userId,
      isOnline: true,
    });
  });

  // Relay chat message to partner
  socket.on('chat:message', (message) => {
    console.log(`[Chat Message] from ${message.senderId}: ${message.text || '[Image]'}`);
    socket.broadcast.emit('chat:message', message);
  });

  // Relay typing indicator
  socket.on('chat:typing', (data) => {
    socket.broadcast.emit('chat:typing', data);
  });

  // Relay heart pulse animation
  socket.on('chat:heart_pulse', (data) => {
    socket.broadcast.emit('chat:heart_pulse', data);
  });

  // Relay WebRTC signaling: offer, answer, ice-candidate, call-request, call-ended
  socket.on('webrtc:signal', (signalData) => {
    console.log(`[WebRTC Signal] Type: ${signalData.type} from ${signalData.from} to ${signalData.to}`);
    socket.broadcast.emit('webrtc:signal', signalData);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    for (const [userId, sockId] of activeSockets.entries()) {
      if (sockId === socket.id) {
        activeSockets.delete(userId);
        console.log(`[Couple Disconnected] ${userId}`);
        socket.broadcast.emit('couple:partner_status', {
          userId,
          isOnline: false,
        });
        break;
      }
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`💖 SoulSync Couple Backend & Signaling Server Running!`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});

