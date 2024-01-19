const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const cors=require('cors');


const app = express();
app.use(cors());


const server = http.createServer(app);
const io = new Server(server,{
  cors:{
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    transports : ['websocket']
  }
});
const rooms={};
const generateRoomCode = () => {
  return Math.floor(100000 + Math.random() * 900000);
};
let board = Array(9).fill(null);
let random=Math.random()>0.5;
io.on('connection', (socket) => {
  console.log('User connected');

  const roomCode = generateRoomCode();
  socket.emit('roomCode', roomCode);

  
  socket.emit('updateBoard', board);
  socket.on('updateBoard', (updatedBoard) => {
    board = updatedBoard;
    socket.broadcast.emit('updateBoard', board);
  }
  );
  socket.emit('next',random);
  socket.on('next',(data)=>{
    random=data
    socket.broadcast.emit('next',data)
  })

  socket.on('joinRoom',(roomCode)=>{
    if(rooms[roomCode] && rooms[roomCode].players.length <2){
      socket.join(roomCode);
      rooms[roomCode].players.push(socket.id);
      socket.emit('updateBoard', rooms[roomCode].board);
      socket.emit('next', rooms[roomCode].currentPlayer);
      socket.to(roomCode).emit('playerJoined', socket.id);

      console.log(`User joined room: ${roomCode}`);
    }
    else{
      socket.emit('roomFull');
    }
  })
  socket.on('disconnect', () => {
    console.log('User disconnected');
    for (const roomCode in rooms) {
      const index = rooms[roomCode].players.indexOf(socket.id);
      if (index !== -1) {
        rooms[roomCode].players.splice(index, 1);

        // Broadcast to the room that a player has left
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