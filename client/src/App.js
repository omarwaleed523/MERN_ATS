import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import RecruiterHome from './pages/RecruiterHome';
import CandidateHome from './pages/CandidateHome';
import Navbar from './Components/Navbar';

const App = () => (
  <>
    <UserProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/recruiterhome" element={<RecruiterHome />} />
          <Route path="/candidatehome" element={<CandidateHome />} />
        </Routes>
      </Router>
    </UserProvider>
  </>
);

export default App;