import {Route, Routes} from 'react-router-dom';
import Home from './pages/Home/Home';
import Game from './pages/Game/Game';
import PageUpdate from './pages/Game/PageUpdate/PageUpdate';
import UpdateGame from './pages/Game/UpdateGame/UpdateGame';
import CreateGame from './pages/Game/CreateGame/CreateGame';
import Role from './pages/Role/Role';
import AddAssignedRole from './pages/Role/AddAssignedRole/AddAssignedRole';
import RemoveAssignedRole from './pages/Role/RemoveAssignedRole.tsx/RemoveAssignedRole';
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
import File from './pages/File/File';
import Upload from './pages/File/Upload/Upload';
import List from './pages/File/List/List';
import NotFound from './pages/NotFound/NotFound';

import { loginPathRelative } from './config/config';
import Users from './pages/Users/Users';
import ShowUser from './pages/Users/ShowUser/ShowUser';
import EventBracket from './pages/Events/EventBracket/EventBracket';

function App() {
  return (
    <Routes>
      <Route path="*" element={<NotFound />} />
      <Route path="/" element={<Home />} />
      <Route path="/game" element={<Game />} />
      <Route path="/game/page-update" element={<PageUpdate />} />
      <Route path="/game/update" element={<UpdateGame/>} />
      <Route path="/game/create" element={<CreateGame />} />
      <Route path="/role" element={<Role />} />
      <Route path="/role/add-to-user" element={<AddAssignedRole />} />
      <Route path="/role/remove-from-user" element={<RemoveAssignedRole />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/create" element={<CreateEvent />} />
      <Route path="/events/update" element={<UpdateEvent />} />
      <Route path="/events/delete" element={<DeleteEvent />} />
      <Route path="/events/fill" element={<AutofillEvent />} />
      <Route path="/events/bracket" element={<EventBracket />} />
      <Route path="/stages" element={<Stages />} />
      <Route path="/stages/create" element={<CreateStage />} />
      <Route path="/stages/update" element={<UpdateStage />} />
      <Route path="/stages/delete" element={<DeleteStage />} />
      <Route path="/stages/fill" element={<AutofillStage />} />
      <Route path="/matches" element={<Matches />} />
      <Route path="/matches/create" element={<CreateMatch />} />
      <Route path="/matches/update" element={<UpdateMatch />} />
      <Route path="/matches/delete" element={<DeleteMatch />} />
      <Route path="/file" element={<File />} />
      <Route path="/file/upload" element={<Upload />} />
      <Route path="/file/list" element={<List />} />
      <Route path="/users" element={<Users />} />
      <Route path="/users/show" element={<ShowUser />} />
      <Route path={`${loginPathRelative}`} element={<LoginScript />} />
    </Routes>
  )
}

export default App;
