import {Route, Routes} from 'react-router-dom';
import Home from './pages/Home/Home';
import Game from './pages/Game/Game';
import PageUpdate from './pages/Game/PageUpdate/PageUpdate';
import Update from './pages/Game/Update/Update';
import Role from './pages/Role/Role';
import AddToUser from './pages/Role/AddToUser/AddToUser';
import './App.scss';
import LoginScript from './components/Navbar/Login/LoginScript';
import Events from './pages/Events/Events';
import CreateEvent from './pages/Events/CreateEvent/CreateEvent';
import UpdateEvent from './pages/Events/UpdateEvent/UpdateEvent';
import DeleteEvent from './pages/Events/DeleteEvent/DeleteEvent';
import Stages from './pages/Stages/Stages';
import CreateStage from './pages/Stages/CreateStage/CreateStage';
import UpdateStage from './pages/Stages/UpdateStage/UpdateStage';
import DeleteStage from './pages/Stages/DeleteStage/DeleteStage';
import CreateMatch from './pages/Matches/CreateMatch/CreateMatch';
import UpdateMatch from './pages/Matches/UpdateMatch/UpdateMatch';
import DeleteMatch from './pages/Matches/DeleteMatch/DeleteMatch';
import Matches from './pages/Matches/Matches';
import AutofillEvent from './pages/Events/AutofillEvent/AutofillEvent';
import AutofillStage from './pages/Stages/AutofillStage/AutofillStage';
import { loginPathRelative } from './config/config';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game" element={<Game />} />
      <Route path="/game/page-update" element={<PageUpdate />} />
      <Route path="/game/update" element={<Update />} />
      <Route path="/role" element={<Role />} />
      <Route path="/role/add-to-user" element={<AddToUser />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/create" element={<CreateEvent />} />
      <Route path="/events/update" element={<UpdateEvent />} />
      <Route path="/events/delete" element={<DeleteEvent />} />
      <Route path="/events/fill" element={<AutofillEvent />} />
      <Route path="/stages" element={<Stages />} />
      <Route path="/stages/create" element={<CreateStage />} />
      <Route path="/stages/update" element={<UpdateStage />} />
      <Route path="/stages/delete" element={<DeleteStage />} />
      <Route path="/stages/fill" element={<AutofillStage />} />
      <Route path="/matches" element={<Matches />} />
      <Route path="/matches/create" element={<CreateMatch />} />
      <Route path="/matches/update" element={<UpdateMatch />} />
      <Route path="/matches/delete" element={<DeleteMatch />} />
      <Route path={`${loginPathRelative}`} element={<LoginScript />} />
    </Routes>
  )
}

export default App;
