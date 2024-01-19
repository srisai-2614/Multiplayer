import './App.css';
import Home from './components/Home/Home';
import {Route,Routes} from 'react-router-dom';
import Computer from './components/Computer/Computer';
import User from './components/User/User';
import TicTacToe from './components/UserBoard/UBoard';
function App() {
  return (
    <div className="App">
      <Routes>
        <Route exact path='/' element={<Home/>}/>
        <Route exact path='/solo' element={<Computer/>}/>
        <Route exact path='/multi' element={<User/>}/>
        <Route exact path='/newGame' element={<TicTacToe/>}/>  
      </Routes>
    </div>
  );
}

export default App;
