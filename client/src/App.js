import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import RecruiterHome from './pages/RecruiterHome';
import CandidateHome from './pages/CandidateHome';
import Navbar from './Components/Navbar';
import './App.css';
import Resumeparsing from './pages/Resumeparsing';
import EditResume from './pages/Editresume';
import UserApplications from './pages/UserApplications';
import EditJobPost from './pages/EditJobPost';
import UploadJobPost from './pages/UploadJobPost';
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
          <Route path="/editjobpost" element={<EditJobPost />} />
          <Route path="/parseresume" element={<Resumeparsing />} />
          <Route path="/editresume/:resumeId" element={<EditResume />} />
          <Route path="/applications/:userId" element={<UserApplications />} />
          <Route path="/addjobpost" element={<UploadJobPost />} />
        </Routes>
      </Router>
    </UserProvider>
  </>
);

export default App;