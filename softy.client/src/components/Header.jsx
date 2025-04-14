import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../assets/styles/Header.css'; 

const Header = () => {
    const [userRole, setUserRole] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false); // теперь с управлением

    useEffect(() => {
        axios.get('https://localhost:7092/users/profile')
            .then(response => setUserRole(response.data.roleId))
            .catch(error => console.error('Ошибка при получении профиля:', error));
    }, []);

    return (
        <header>
            <Link to="/"><h1>SOFTY</h1></Link>
            <nav>
                <ul>
                    <li
                        className="dropdown"
                        onMouseEnter={() => setDropdownOpen(true)}
                        onMouseLeave={() => setDropdownOpen(false)}
                    >
                        <Link to="/services">Услуги</Link>
                        {dropdownOpen && (
                            <ul className="dropdown-menu">
                                <li><Link to="/services?type=1">Ресницы</Link></li>
                                <li><Link to="/services?type=2">Брови</Link></li>
                                <li><Link to="/services?type=3">Татуировки</Link></li>
                            </ul>
                        )}
                    </li>
                    <li><Link to="/profile">Профиль</Link></li>
                    <Link to="/tattoo-viewer">Татуировки</Link>
                    {userRole === 1 && (
                        <li><Link to="/users">Мастера</Link></li>
                    )}
                </ul>
            </nav>
        </header>
    );
};

export default Header;


