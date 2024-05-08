// import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from './pages/Home/Home';
import './App.scss';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/game/page-update" element={<Home />}/>
      <Route path="/game/update" element={<Home />}/>
      <Route path="/role/add-to-user" element={<Home />}/>
    </Routes>
  )
}

export default App;
