import {Route, Routes} from 'react-router-dom';
import Home from './pages/Home/Home';
import PageUpdate from './pages/Game/PageUpdate/PageUpdate';
import Update from './pages/Game/Update/Update';
import AddToUser from './pages/Role/AddToUser/AddToUser';
import './App.scss';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/game/page-update" element={<PageUpdate />}/>
      <Route path="/game/update" element={<Update />}/>
      <Route path="/role/add-to-user" element={<AddToUser />}/>
    </Routes>
  )
}

export default App;
