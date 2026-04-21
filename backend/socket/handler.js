const jwt = require('jsonwebtoken');
const User = require('../models/User');

const connectedUsers = new Map();

const socketHandler = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Token manquant'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('Utilisateur introuvable'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Token invalide'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    connectedUsers.set(userId, socket.id);

    // Join personal room
    socket.join(`patient_${userId}`);
    socket.join(`doctor_${userId}`);

    console.log(`✅ ${socket.user.firstName} connecté (${socket.user.role})`);

    // Join consultation room
    socket.on('join_consultation', (consultationId) => {
      socket.join(`consultation_${consultationId}`);
      socket.to(`consultation_${consultationId}`).emit('user_joined', {
        userId,
        name: `${socket.user.firstName} ${socket.user.lastName}`,
        role: socket.user.role,
      });
    });

    // Leave consultation
    socket.on('leave_consultation', (consultationId) => {
      socket.leave(`consultation_${consultationId}`);
      socket.to(`consultation_${consultationId}`).emit('user_left', { userId });
    });

    // Real-time message
    socket.on('send_message', ({ consultationId, content, type }) => {
      const message = {
        _id: Date.now().toString(),
        sender: { _id: userId, firstName: socket.user.firstName, lastName: socket.user.lastName, avatar: socket.user.avatar, role: socket.user.role },
        content,
        type: type || 'text',
        createdAt: new Date().toISOString(),
        read: false,
      };
      io.to(`consultation_${consultationId}`).emit('new_message', message);
    });

    // Typing indicator
    socket.on('typing', ({ consultationId, isTyping }) => {
      socket.to(`consultation_${consultationId}`).emit('typing', {
        userId,
        name: socket.user.firstName,
        isTyping,
      });
    });

    // Doctor availability
    socket.on('update_availability', (isAvailable) => {
      socket.broadcast.emit('doctor_availability', { doctorUserId: userId, isAvailable });
    });

    // Appointment reminder
    socket.on('appointment_reminder', ({ patientId, message }) => {
      const patientSocketId = connectedUsers.get(patientId);
      if (patientSocketId) {
        io.to(patientSocketId).emit('reminder', { message });
      }
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      console.log(`❌ ${socket.user.firstName} déconnecté`);
    });
  });
};

module.exports = { socketHandler, connectedUsers };
