import React, { useState, useEffect } from 'react';
import './User.css';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  transports: ['websocket'],
});
const generateRoomCode = () => {
  return Math.floor(100000 + Math.random() * 900000);
};
function User() {
  const navigate = useNavigate();
  const Create=()=>{
    const newCode=generateRoomCode();
    alert(`Room is Created, Join and Share this Id ${newCode}`)
    socket.emit("Created",newCode)
  }
  const [roomCode, setRoomCode] = useState('');
  const Join=()=>{
      const code=roomCode.length===6 ? roomCode : alert("Check the RoomCode")
      socket.emit("Joined",code)
  }
  useEffect(()=>{
    socket.on("Player-Joined",(Code)=>{
      navigate(`/newGame/${Code}`)
    })
    socket.on("Room-full",()=>{
      alert("Room is full")
    })
   
  },[])
  return (
    <div style={{ backgroundColor: '#111312', width: '100%', height: '100%' }}>
      <div className='Heading'>Lobby</div>
      <div className='Users'>
        <div>
          <button className='UserButton' onClick={Create}>CREATE</button>
        </div>
        <div className='Join'>
          <input
            type='text'
            placeholder='XXXXXX'
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <button
            className='UserButton'
            onClick={Join}
          >
            JOIN
          </button>
        </div>
      </div>
     
    </div>
  );
}

export default User;
