import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Импортируем useNavigate для перенаправления
import '../assets/styles/Login.css';  // Подключаем файл стилей


const Login = () => {
    const navigate = useNavigate();
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("https://localhost:7092/account/login", {
                phone,
                password,
                rememberMe,
            });
            console.log(response.data); 
            // Если успешная авторизация, перенаправляем на профиль
            navigate("/profile");
            window.location.reload();
        } catch (error) {
            setErrorMessage("Ошибка авторизации: " + error.response?.data?.message);
        }
    };
    const handleLoginRedirect = () => {
        navigate("/register"); // Переход на страницу логина (если нужно)
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
                        onChange={(e) => setPhone(e.target.value)}
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
                <div className="form-group checkbox-group">
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





