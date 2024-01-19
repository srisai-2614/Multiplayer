import './Home.css';
import { useNavigate } from 'react-router-dom';
function Home() {
  const Navigate=useNavigate();
  return (
    <div className='Home'>
      <div className='VsComp'>
        <h3>
            Soloplayer
        </h3>
        <p>
            Vs Computer
        </p>
        <button className='Button' onClick={()=>{Navigate('/solo')}}>
            Play
        </button>
      </div>
      <div className='VsUser'>
      <h3>
            Multiplayer
        </h3>
        <p>
            Vs Friend
        </p>
        <button className='Button' onClick={()=>{Navigate('/multi')}}>
            Play
        </button>
      </div>
      
    </div>
  )
}

export default Home
