const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    transports: ['websocket'],
  },
});
const rooms = {};
let board =  Array(3 * 3).fill(null);
let userIdCounter = 1;

function generateUserId() {
  const userId = userIdCounter.toString();
  userIdCounter++;
  return userId;
}

io.on('connection', (socket) => {
  let roomCode;
  console.log('User connected');
  socket.on('Created', (Code) => {
    rooms[Code] = {
      players: [],
      board: board,
      currentPlayer: Math.random() > 0.5,
    };
    roomCode=Code;
    socket.join(Code);
    
    console.log(rooms);
  });

  socket.on('Joined', (Code) => {
    roomCode = Code;
    const userId = generateUserId();
    if (rooms[roomCode]) {
      const index = rooms[roomCode].players.length;
      if (index < 2) {
        rooms[roomCode].players.push({ userId, socketId: socket.id });
        socket.emit('Player-Joined', roomCode, userId);
        socket.broadcast.emit('updateBoard',(rooms[Code].board,Code))
        socket.broadcast.emit('next',(rooms[Code].currentPlayer,Code))
        console.log('Player Joined', rooms, userId);
      } else {
        socket.emit('Room-full');
        console.log('Room is full');
      }
    } else {
      socket.emit('Wrong-Code');
      console.log('Wrong Code');
    }
  });
  socket.on('updateBoard', (updatedBoard, receivedRoomCode) => {   
    console.log(updatedBoard);
    if (receivedRoomCode && rooms[receivedRoomCode]) {
      rooms[receivedRoomCode].board = updatedBoard;
      console.log(rooms[receivedRoomCode].board,updatedBoard)
      socket.broadcast.emit('updateBoard', updatedBoard,receivedRoomCode);
    }
  });
  
  socket.on('next', (data, receivedRoomCode) => {
    if (receivedRoomCode && rooms[receivedRoomCode]) {
      rooms[receivedRoomCode].currentPlayer = data;
      console.log(rooms[receivedRoomCode].currentPlayer,data)
      socket.broadcast.emit('next', data,receivedRoomCode);
    }
  });
  

  socket.on('disconnect', () => {
    console.log('User disconnected');
    if (roomCode && rooms[roomCode]) {
      const index = rooms[roomCode].players.findIndex((player) => player.socketId === socket.id);
      if (index !== -1) {
        rooms[roomCode].players.splice(index, 1);
        socket.to(roomCode).emit('playerLeft', socket.id);
        console.log(`User left room: ${roomCode}`);
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
