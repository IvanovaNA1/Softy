import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  
import '../assets/styles/Login.css'; 



const Login = () => {
    const navigate = useNavigate();
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        const cleanedPhone = phone.replace(/\D/g, '');
        try {
            const response = await axios.post("https://localhost:7092/account/login", {
                phone: cleanedPhone,
                password,
                rememberMe,
            });
            console.log(response.data); 
            navigate("/profile");
            window.location.reload();
        } catch {
            setErrorMessage("Ошибка авторизации");
        }
    };
    const handleLoginRedirect = () => {
        navigate("/register"); 
    };
    const handlePhoneChange = (e) => {
        let input = e.target.value;
        // Убираем всё, кроме цифр
        const digits = input.replace(/\D/g, '');

        if (digits.length === 0) {
            setPhone('');
            return;
        }

        // Форматируем как +7 (999) 999-99-99
        let formatted = '+7 ';
        if (digits.length > 1) {
            formatted += '(' + digits.substring(1, 4);
        }
        if (digits.length >= 4) {
            formatted += ') ' + digits.substring(4, 7);
        }
        if (digits.length >= 7) {
            formatted += '-' + digits.substring(7, 9);
        }
        if (digits.length >= 9) {
            formatted += '-' + digits.substring(9, 11);
        }

        setPhone(formatted);
    };

    return (
        <div className="login-container">
            <h2 className="login-header">Авторизация</h2>
            <form onSubmit={handleLogin} className="login-form">
                <div className="form-group">
                    <label>Телефон</label>
                    <input
                        type="text"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="+7 (999) 999-99-99"
                        required
                        className="input-field"
                    />
                </div>
                <div className="form-group">
                    <label>Пароль</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="input-field"
                    />
                </div>
                <div className="checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={() => setRememberMe(!rememberMe)}
                        />
                        Запомнить меня
                    </label>
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <button type="submit" className="submit-btn">Войти</button>
                <div>
                    <p>Нет аккаунта? <a href="#" onClick={handleLoginRedirect}>Регистрация</a></p>
                </div>
                
            </form>
        </div>
    );
};

export default Login;





