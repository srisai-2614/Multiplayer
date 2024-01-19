import React, { useState, useEffect } from 'react';
import './User.css';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  transports: ['websocket'],
});

function User() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');

  useEffect(() => {
    // Listen for the room code from the server
    socket.on('roomCode', (code) => {
      setRoomCode(code);
    });

    // Clean up the socket on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{ backgroundColor: '#111312', width: '100%', height: '100%' }}>
      <div className='Heading'>Lobby</div>
      <div className='Users'>
        <div>
          {/* Display the generated room code */}
          <div>Room Code: {roomCode}</div>
          <button className='UserButton'>CREATE</button>
        </div>
        <div className='Join'>
          <input
            type='text'
            placeholder='Enter Room Code'
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <button
            className='UserButton'
            onClick={() => {
              navigate(`/newGame/${roomCode}`);
            }}
          >
            JOIN
          </button>
        </div>
      </div>
    </div>
  );
}

export default User;
