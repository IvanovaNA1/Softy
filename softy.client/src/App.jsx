import React from 'react';
import axios from "axios";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Profile from './pages/Profile';
import Services from './pages/Services';
import Header from './components/Header';  
import Footer from './components/Footer';  
import Login from './pages/Login';
import Home from './pages/Home';
import Register from './pages/Register';
import AddUser from './pages/AddUser';
import TattooViewer from './pages/TattooViewer';

const App = () => {
    
    return (
        <Router>
            <Header /> 
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/account/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/register" element={<Register />} />
                <Route path="/tattoo-viewer" element={<TattooViewer />} />
                <Route path="/services" element={<Services />} />
                <Route path="/users" element={<AddUser />} />
            </Routes>
            <Footer /> 
        </Router>
    );

};
axios.defaults.withCredentials = true;
export default App;

